"""
多源数据融合引擎

系统的核心模块，负责协调所有融合处理流程：
  数据接入 → 预处理 → 关联 → 状态估计 → 属性融合 → 航迹管理 → 输出
"""

from __future__ import annotations

import logging
import time
from typing import Optional

import numpy as np

from .adapters.sensor_adapters import BaseSensorAdapter, create_adapter
from .config.settings import FusionConfig
from .core.association import associate
from .core.attribute_fusion import (
    bpa_from_classification,
    dempster_combine,
    make_decision,
)
from .core.imm_filter import IMMFilter
from .core.kalman_filter import (
    KalmanFilter,
    build_cv_model,
    build_observation_matrix,
)
from .core.models import (
    FusedTarget,
    Measurement,
    SensorInfo,
    SensorType,
    TargetCategory,
    TrackState,
)
from .core.track_manager import TrackManager
from .utils.coordinate import enu_to_lla
from .utils.time_sync import check_time_validity

logger = logging.getLogger(__name__)


class FusionEngine:
    """
    多源数据融合引擎

    主要职责:
        1. 管理传感器注册与数据接入
        2. 对量测数据进行预处理和时间校验
        3. 执行量测-航迹关联
        4. 对关联的量测进行状态更新（KF/IMM）
        5. 对目标属性进行D-S证据融合
        6. 管理航迹生命周期
        7. 输出融合后的目标列表

    Usage:
        engine = FusionEngine()
        engine.register_sensor(sensor_info)
        engine.process_measurements(measurements)
        targets = engine.get_fused_targets()
    """

    def __init__(self, config: FusionConfig | None = None):
        self.config = config or FusionConfig()

        # 传感器管理
        self._sensors: dict[str, SensorInfo] = {}
        self._adapters: dict[str, BaseSensorAdapter] = {}

        # 航迹管理
        self.track_manager = TrackManager(self.config)

        # 滤波器
        self._kf = KalmanFilter(state_dim=6, meas_dim=3)
        self._imm: Optional[IMMFilter] = None
        if self.config.imm_enabled:
            self._imm = IMMFilter(
                transition_matrix=self.config.imm_transition_matrix,
                process_noise_acc=self.config.process_noise_acc,
            )

        # IMM滤波器状态存储 (track_id -> {states, covariances, model_probs})
        self._imm_states: dict[str, dict] = {}

        # 融合时钟
        self._current_time: float = 0.0
        self._cycle_count: int = 0

        logger.info(
            "FusionEngine initialized | IMM=%s | cycle=%.0fms | max_tracks=%d",
            self.config.imm_enabled,
            self.config.fusion_cycle * 1000,
            self.config.max_tracks,
        )

    # ─────────────────── 传感器管理 ───────────────────

    def register_sensor(self, sensor_info: SensorInfo):
        """
        注册传感器

        Args:
            sensor_info: 传感器信息
        """
        self._sensors[sensor_info.sensor_id] = sensor_info
        self._adapters[sensor_info.sensor_id] = create_adapter(
            sensor_info, self.config
        )
        logger.info(
            "Sensor registered: %s (%s)",
            sensor_info.sensor_id,
            sensor_info.sensor_type.name,
        )

    def unregister_sensor(self, sensor_id: str):
        """注销传感器"""
        self._sensors.pop(sensor_id, None)
        self._adapters.pop(sensor_id, None)
        logger.info("Sensor unregistered: %s", sensor_id)

    # ─────────────────── 数据处理入口 ───────────────────

    def ingest_raw_data(self, sensor_id: str, raw_data: dict) -> Optional[Measurement]:
        """
        接入原始传感器数据

        通过对应的适配器解析原始数据为标准量测格式。

        Args:
            sensor_id: 传感器ID
            raw_data: 原始数据字典

        Returns:
            Measurement: 标准化量测，失败返回None
        """
        adapter = self._adapters.get(sensor_id)
        if adapter is None:
            logger.warning("Unknown sensor: %s", sensor_id)
            return None

        return adapter.parse_raw_data(raw_data)

    def process_measurements(
        self,
        measurements: list[Measurement],
        current_time: float | None = None,
    ) -> list[FusedTarget]:
        """
        融合处理主循环

        执行完整的一次融合处理周期。

        Args:
            measurements: 本周期收到的所有量测
            current_time: 当前时间（默认使用系统时间）

        Returns:
            list[FusedTarget]: 融合后的目标列表
        """
        self._current_time = current_time or time.time()
        self._cycle_count += 1

        # Step 1: 预处理 - 过滤无效量测
        valid_measurements = self._preprocess(measurements)

        # 对量测排序：权威数据源排在后面，确保它们最后更新航迹
        # 这样权威源的状态更新会覆盖之前较低精度源的结果
        valid_measurements.sort(key=lambda m: m.is_authoritative)

        # Step 2: 对已有航迹做预测
        self._predict_all_tracks()

        # Step 3: 量测-航迹关联
        active_tracks = self.track_manager.active_tracks
        assignments, unassigned_tracks, unassigned_meas = associate(
            active_tracks,
            valid_measurements,
            self.config.gating_threshold,
        )

        # Step 4: 对关联到的航迹执行状态更新
        for track_idx, meas_idx in assignments:
            track = active_tracks[track_idx]
            meas = valid_measurements[meas_idx]
            self._update_track(track, meas)
            self.track_manager.update_track_state(track, associated=True, current_time=self._current_time)

        # Step 5: 处理未关联的航迹
        for track_idx in unassigned_tracks:
            track = active_tracks[track_idx]
            self.track_manager.update_track_state(track, associated=False, current_time=self._current_time)

        # Step 6: 用未关联量测初始化新航迹
        for meas_idx in unassigned_meas:
            meas = valid_measurements[meas_idx]
            new_track = self.track_manager.initiate_track(meas, self._current_time)
            if new_track and self._imm:
                self._init_imm_state(new_track)

        # Step 7: 清理已删除的航迹
        self.track_manager.cleanup_deleted()
        self._cleanup_imm_states()

        # Step 8: 生成融合目标列表
        return self.get_fused_targets()

    # ─────────────────── 内部处理方法 ───────────────────

    def _preprocess(self, measurements: list[Measurement]) -> list[Measurement]:
        """预处理：过滤无效数据"""
        valid = []
        for meas in measurements:
            # 检查位置数据是否存在
            if meas.position is None:
                continue

            # 检查位置是否包含NaN或Inf
            if not np.all(np.isfinite(meas.position)):
                continue

            # 检查时间有效性
            if self._current_time > 0 and not check_time_validity(
                meas.timestamp, self._current_time
            ):
                logger.debug(
                    "Measurement %s rejected: time invalid (%.2f vs %.2f)",
                    meas.measurement_id, meas.timestamp, self._current_time,
                )
                continue

            valid.append(meas)

        return valid

    def _predict_all_tracks(self):
        """对所有活跃航迹执行预测"""
        for track in self.track_manager.active_tracks:
            dt = self._current_time - track.last_update_time
            if dt <= 0:
                dt = self.config.fusion_cycle

            if self._imm and track.track_id in self._imm_states:
                self._predict_track_imm(track, dt)
            else:
                self._predict_track_kf(track, dt)

    def _predict_track_kf(self, track, dt: float):
        """用标准KF预测航迹"""
        F, Q = build_cv_model(dt, self.config.process_noise_acc)
        track.state_vector, track.covariance = self._kf.predict(
            track.state_vector, track.covariance, F, Q
        )

    def _predict_track_imm(self, track, dt: float):
        """用IMM预测航迹"""
        imm_state = self._imm_states[track.track_id]
        pred_states, pred_covs, _ = self._imm.predict(
            imm_state["states"],
            imm_state["covariances"],
            imm_state["model_probs"],
            dt,
        )
        imm_state["states"] = pred_states
        imm_state["covariances"] = pred_covs

        # 更新航迹的融合状态（加权平均）
        probs = imm_state["model_probs"]
        track.state_vector = sum(p * s for p, s in zip(probs, pred_states))
        track.covariance = np.zeros((6, 6))
        for i in range(len(probs)):
            diff = pred_states[i] - track.state_vector
            track.covariance += probs[i] * (pred_covs[i] + np.outer(diff, diff))

    def _update_track(self, track, meas: Measurement):
        """用量测更新航迹状态

        当量测来自权威数据源（遥测/RID）时，使用更低的量测噪声
        以使卡尔曼滤波器更信任该数据，并直接覆盖分类结果。
        """
        H = build_observation_matrix(meas_dim=3)
        R = meas.noise_covariance
        if R is None:
            R = np.diag([100.0, 100.0, 100.0])

        z = meas.position

        # 权威数据源优先级处理
        is_authoritative = meas.is_authoritative
        if is_authoritative:
            # 进一步缩小量测噪声，让KF更信任权威数据
            R = R * self.config.authoritative_noise_scale
            track.has_authoritative_source = True
            # 保存权威源附加信息
            track.authoritative_meas = {
                "sensor_type": meas.sensor_type.name,
                "serial_number": meas.serial_number,
                "operator_id": meas.operator_id or meas.rid_operator_id,
                "uas_id": meas.uas_id,
                "flight_plan_id": meas.flight_plan_id,
                "battery_level": meas.battery_level,
                "flight_mode": meas.flight_mode,
                "rid_type": meas.rid_type,
            }

        if self._imm and track.track_id in self._imm_states:
            self._update_track_imm(track, z, R)
        else:
            # 标准KF更新
            x_upd, P_upd, _, _ = self._kf.update(
                track.state_vector, track.covariance, z, H, R
            )
            track.state_vector = x_upd
            track.covariance = P_upd

        # 若权威源提供了速度，直接写入（高置信度）
        if is_authoritative and meas.velocity is not None:
            track.state_vector[3:6] = meas.velocity
            # 缩小速度协方差
            track.covariance[3, 3] = min(track.covariance[3, 3], 1.0)
            track.covariance[4, 4] = min(track.covariance[4, 4], 1.0)
            track.covariance[5, 5] = min(track.covariance[5, 5], 4.0)

        # 更新传感器关联记录
        track.associated_sensors.add(meas.sensor_id)

        # 属性融合
        if meas.classification and meas.classification != TargetCategory.UNKNOWN:
            if is_authoritative and self.config.authoritative_override_classification:
                # 权威数据源直接覆盖分类
                track.category = meas.classification
                track.category_bpa = {
                    meas.classification.name: meas.classification_confidence,
                    "UNKNOWN": 1.0 - meas.classification_confidence,
                }
            else:
                # 普通数据源使用D-S证据融合
                self._fuse_attribute(track, meas)

    def _update_track_imm(self, track, z: np.ndarray, R: np.ndarray):
        """用IMM更新航迹"""
        imm_state = self._imm_states[track.track_id]
        upd_states, upd_covs, new_probs, fused_x, fused_P = self._imm.update(
            imm_state["states"],
            imm_state["covariances"],
            imm_state["model_probs"],
            z, R,
        )
        imm_state["states"] = upd_states
        imm_state["covariances"] = upd_covs
        imm_state["model_probs"] = new_probs

        track.state_vector = fused_x
        track.covariance = fused_P
        track.model_probabilities = new_probs

    def _fuse_attribute(self, track, meas: Measurement):
        """D-S证据融合目标属性"""
        new_bpa = bpa_from_classification(
            meas.classification, meas.classification_confidence
        )

        if track.category_bpa is None:
            track.category_bpa = new_bpa
        else:
            track.category_bpa = dempster_combine(track.category_bpa, new_bpa)

        # 做出分类决策
        category_name, confidence = make_decision(
            track.category_bpa,
            self.config.classification_confidence_threshold,
        )
        try:
            track.category = TargetCategory[category_name]
        except KeyError:
            track.category = TargetCategory.UNKNOWN

    def _init_imm_state(self, track):
        """为新航迹初始化IMM状态"""
        n_models = self.config.imm_transition_matrix.shape[0]
        self._imm_states[track.track_id] = {
            "states": [track.state_vector.copy() for _ in range(n_models)],
            "covariances": [track.covariance.copy() for _ in range(n_models)],
            "model_probs": np.ones(n_models) / n_models,
        }

    def _cleanup_imm_states(self):
        """清理已删除航迹的IMM状态"""
        active_ids = {t.track_id for t in self.track_manager.tracks}
        to_delete = [tid for tid in self._imm_states if tid not in active_ids]
        for tid in to_delete:
            del self._imm_states[tid]

    # ─────────────────── 输出 ───────────────────

    def get_fused_targets(self) -> list[FusedTarget]:
        """
        获取当前融合目标列表

        Returns:
            list[FusedTarget]: 已确认的融合目标
        """
        targets = []
        for track in self.track_manager.confirmed_tracks:
            target = self._track_to_target(track)
            if target:
                targets.append(target)
        return targets

    def _track_to_target(self, track) -> Optional[FusedTarget]:
        """将内部航迹转换为输出目标"""
        try:
            lat, lon, alt = enu_to_lla(
                track.position,
                self.config.reference_lat,
                self.config.reference_lon,
                self.config.reference_alt,
            )
        except Exception:
            return None

        speed = track.speed
        vx, vy = track.velocity[0], track.velocity[1]
        heading = float(np.degrees(np.arctan2(vx, vy))) % 360  # 北偏东

        pos_accuracy = float(np.sqrt(np.trace(track.covariance[:3, :3]) / 3))

        return FusedTarget(
            target_id=track.track_id,
            timestamp=self._current_time,
            latitude=lat,
            longitude=lon,
            altitude=alt,
            velocity_east=float(track.velocity[0]),
            velocity_north=float(track.velocity[1]),
            velocity_up=float(track.velocity[2]),
            speed=speed,
            heading=heading,
            category=track.category,
            category_confidence=0.0,
            threat_level=track.threat_level,
            position_accuracy=pos_accuracy,
            quality_score=track.quality_score,
            contributing_sensors=list(track.associated_sensors),
            track_state=track.state,
            has_authoritative_source=track.has_authoritative_source,
            serial_number=(track.authoritative_meas or {}).get("serial_number"),
            operator_id=(track.authoritative_meas or {}).get("operator_id"),
            uas_id=(track.authoritative_meas or {}).get("uas_id"),
        )

    # ─────────────────── 状态查询 ───────────────────

    def get_status(self) -> dict:
        """获取融合引擎状态"""
        return {
            "cycle_count": self._cycle_count,
            "current_time": self._current_time,
            "registered_sensors": len(self._sensors),
            "sensor_list": [
                {"id": s.sensor_id, "type": s.sensor_type.name, "active": s.is_active}
                for s in self._sensors.values()
            ],
            "track_summary": self.track_manager.get_track_summary(),
        }
