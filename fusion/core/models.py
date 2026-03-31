"""
数据模型定义

定义融合系统中所有核心数据结构，包括传感器、量测、航迹、融合目标等。
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional

import numpy as np


# ──────────────────────────── 枚举类型 ────────────────────────────


class SensorType(Enum):
    """传感器类型"""
    RADAR = auto()          # 雷达
    ELECTRO_OPTICAL = auto()  # 光电/红外
    RF_DETECTOR = auto()    # 射频侦测
    ADSB = auto()           # ADS-B接收机
    ACOUSTIC = auto()       # 声学阵列
    WEATHER = auto()        # 气象站


class TrackState(Enum):
    """航迹状态"""
    TENTATIVE = auto()   # 暂定航迹（待确认）
    CONFIRMED = auto()   # 已确认航迹
    TRACKING = auto()    # 稳定跟踪中
    COASTING = auto()    # 滑行（暂时丢失量测）
    DELETED = auto()     # 已删除


class TargetCategory(Enum):
    """目标粗分类"""
    UNKNOWN = auto()
    MULTI_ROTOR = auto()       # 多旋翼无人机
    FIXED_WING = auto()        # 固定翼无人机
    HELICOPTER = auto()        # 直升机
    BIRD = auto()              # 鸟类
    BALLOON = auto()           # 气球
    MANNED_AIRCRAFT = auto()   # 有人驾驶飞行器


class ThreatLevel(Enum):
    """威胁等级"""
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


# ──────────────────────────── 传感器模型 ────────────────────────────


@dataclass
class SensorInfo:
    """传感器信息"""
    sensor_id: str
    sensor_type: SensorType
    position_lla: np.ndarray      # 传感器安装位置 [lat, lon, alt] (度, 度, 米)
    max_range: float              # 最大探测距离 (米)
    update_rate: float            # 更新频率 (Hz)
    measurement_noise: np.ndarray  # 量测噪声协方差矩阵 R
    is_active: bool = True
    description: str = ""

    # 系统误差校正参数
    bias_range: float = 0.0       # 距离偏差 (米)
    bias_azimuth: float = 0.0     # 方位角偏差 (弧度)
    bias_elevation: float = 0.0   # 俯仰角偏差 (弧度)


# ──────────────────────────── 量测数据 ────────────────────────────


@dataclass
class Measurement:
    """单次传感器量测"""
    measurement_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    sensor_id: str = ""
    sensor_type: SensorType = SensorType.RADAR
    timestamp: float = 0.0        # Unix时间戳 (秒)

    # 统一后的量测值（ENU坐标系下）
    position: Optional[np.ndarray] = None   # [x, y, z] (米) - ENU坐标
    velocity: Optional[np.ndarray] = None   # [vx, vy, vz] (m/s)

    # 原始量测（因传感器而异）
    raw_range: Optional[float] = None       # 距离 (米)
    raw_azimuth: Optional[float] = None     # 方位角 (弧度)
    raw_elevation: Optional[float] = None   # 俯仰角 (弧度)
    raw_doppler: Optional[float] = None     # 多普勒速度 (m/s)
    raw_rcs: Optional[float] = None         # 雷达截面积 (dBsm)

    # ADS-B专有字段
    icao_address: Optional[str] = None      # ICAO地址
    callsign: Optional[str] = None          # 呼号
    squawk: Optional[str] = None            # 应答机编码

    # 射频侦测专有字段
    rf_frequency: Optional[float] = None    # 中心频率 (MHz)
    rf_protocol: Optional[str] = None       # 通信协议

    # 目标分类信息（来自传感器本身的分类结果）
    classification: Optional[TargetCategory] = None
    classification_confidence: float = 0.0

    # 量测噪声协方差（该次量测的精度）
    noise_covariance: Optional[np.ndarray] = None   # R矩阵


# ──────────────────────────── 航迹 ────────────────────────────


@dataclass
class Track:
    """系统融合航迹"""
    track_id: str = field(default_factory=lambda: f"T-{uuid.uuid4().hex[:6].upper()}")
    state: TrackState = TrackState.TENTATIVE

    # 状态向量 [x, y, z, vx, vy, vz] (ENU坐标，米/秒)
    state_vector: np.ndarray = field(default_factory=lambda: np.zeros(6))
    # 状态协方差矩阵 (6x6)
    covariance: np.ndarray = field(default_factory=lambda: np.eye(6) * 100.0)

    # 航迹管理参数
    creation_time: float = field(default_factory=time.time)
    last_update_time: float = field(default_factory=time.time)
    hit_count: int = 0            # 关联命中次数
    miss_count: int = 0           # 连续丢失次数
    total_updates: int = 0        # 总更新次数
    associated_sensors: set = field(default_factory=set)  # 关联过的传感器ID集合

    # 目标属性
    category: TargetCategory = TargetCategory.UNKNOWN
    category_bpa: Optional[dict] = None   # D-S证据理论的基本概率赋值
    threat_level: ThreatLevel = ThreatLevel.NONE

    # 航迹质量评分 [0, 100]
    quality_score: float = 0.0

    # 历史轨迹（用于态势展示）
    history: list = field(default_factory=list)
    max_history_length: int = 200

    # IMM模型概率
    model_probabilities: Optional[np.ndarray] = None

    @property
    def position(self) -> np.ndarray:
        """当前位置 [x, y, z]"""
        return self.state_vector[:3]

    @property
    def velocity(self) -> np.ndarray:
        """当前速度 [vx, vy, vz]"""
        return self.state_vector[3:6]

    @property
    def speed(self) -> float:
        """速度标量 (m/s)"""
        return float(np.linalg.norm(self.velocity))

    def record_history(self):
        """记录当前状态到历史轨迹"""
        self.history.append({
            "time": self.last_update_time,
            "position": self.state_vector[:3].copy(),
            "velocity": self.state_vector[3:6].copy(),
        })
        if len(self.history) > self.max_history_length:
            self.history.pop(0)

    def compute_quality(self) -> float:
        """计算航迹质量评分"""
        # 基于多因素综合评分
        hit_ratio = self.hit_count / max(self.total_updates, 1)
        sensor_diversity = min(len(self.associated_sensors) / 3.0, 1.0)
        position_accuracy = min(1.0, 10.0 / max(np.trace(self.covariance[:3, :3]), 0.1))
        continuity = 1.0 / (1.0 + self.miss_count)

        self.quality_score = (
            hit_ratio * 30
            + sensor_diversity * 25
            + position_accuracy * 25
            + continuity * 20
        )
        return self.quality_score


# ──────────────────────────── 融合输出目标 ────────────────────────────


@dataclass
class FusedTarget:
    """融合后的目标输出"""
    target_id: str
    timestamp: float

    # 位置和速度（WGS84）
    latitude: float = 0.0     # 纬度 (度)
    longitude: float = 0.0    # 经度 (度)
    altitude: float = 0.0     # 高度 (米)
    velocity_east: float = 0.0   # 东向速度 (m/s)
    velocity_north: float = 0.0  # 北向速度 (m/s)
    velocity_up: float = 0.0     # 天向速度 (m/s)
    speed: float = 0.0        # 速度标量 (m/s)
    heading: float = 0.0      # 航向角 (度, 北偏东)

    # 目标属性
    category: TargetCategory = TargetCategory.UNKNOWN
    category_confidence: float = 0.0
    threat_level: ThreatLevel = ThreatLevel.NONE

    # 精度信息
    position_accuracy: float = 0.0  # 位置精度 (米, 1σ)
    quality_score: float = 0.0

    # 来源信息
    contributing_sensors: list = field(default_factory=list)
    track_state: TrackState = TrackState.TRACKING

    # ADS-B信息（如果有）
    icao_address: Optional[str] = None
    callsign: Optional[str] = None
