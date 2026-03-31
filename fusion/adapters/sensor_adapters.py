"""
传感器数据接入适配器

为不同类型的传感器提供统一的数据接入接口，将各传感器的原始数据
转换为标准化的 Measurement 格式。
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

import numpy as np

from ..config.settings import FusionConfig
from ..core.models import (
    Measurement,
    SensorInfo,
    SensorType,
    TargetCategory,
)
from ..utils.coordinate import lla_to_enu, radar_spherical_to_enu


class BaseSensorAdapter(ABC):
    """传感器适配器基类"""

    def __init__(self, sensor_info: SensorInfo, config: FusionConfig):
        self.sensor_info = sensor_info
        self.config = config
        # 传感器在ENU坐标系下的位置
        self._sensor_enu = lla_to_enu(
            sensor_info.position_lla[0],
            sensor_info.position_lla[1],
            sensor_info.position_lla[2],
            config.reference_lat,
            config.reference_lon,
            config.reference_alt,
        )

    @abstractmethod
    def parse_raw_data(self, raw_data: dict) -> Optional[Measurement]:
        """
        解析原始传感器数据

        Args:
            raw_data: 原始数据字典

        Returns:
            Measurement: 标准化量测，解析失败返回None
        """
        ...

    def _apply_bias_correction(self, meas: Measurement) -> Measurement:
        """应用系统误差校正"""
        if meas.raw_range is not None:
            meas.raw_range -= self.sensor_info.bias_range
        if meas.raw_azimuth is not None:
            meas.raw_azimuth -= self.sensor_info.bias_azimuth
        if meas.raw_elevation is not None:
            meas.raw_elevation -= self.sensor_info.bias_elevation
        return meas


class RadarAdapter(BaseSensorAdapter):
    """
    雷达传感器适配器

    将雷达极坐标量测 (距离, 方位角, 俯仰角) 转换为ENU笛卡尔坐标。
    """

    def parse_raw_data(self, raw_data: dict) -> Optional[Measurement]:
        """
        解析雷达原始数据

        Expected raw_data format:
        {
            "timestamp": float,          # Unix时间戳
            "range": float,              # 距离 (米)
            "azimuth": float,            # 方位角 (度, 北偏东)
            "elevation": float,          # 俯仰角 (度)
            "doppler_velocity": float,   # 多普勒速度 (m/s), 可选
            "rcs": float,               # RCS (dBsm), 可选
        }
        """
        try:
            meas = Measurement(
                sensor_id=self.sensor_info.sensor_id,
                sensor_type=SensorType.RADAR,
                timestamp=raw_data["timestamp"],
                raw_range=raw_data["range"],
                raw_azimuth=np.radians(raw_data["azimuth"]),
                raw_elevation=np.radians(raw_data.get("elevation", 0.0)),
                raw_doppler=raw_data.get("doppler_velocity"),
                raw_rcs=raw_data.get("rcs"),
            )

            # 系统误差校正
            meas = self._apply_bias_correction(meas)

            # 极坐标→ENU笛卡尔坐标
            meas.position = radar_spherical_to_enu(
                meas.raw_range,
                meas.raw_azimuth,
                meas.raw_elevation,
                self._sensor_enu,
            )

            # 量测噪声协方差（从极坐标误差传播到笛卡尔坐标）
            meas.noise_covariance = self._compute_cartesian_noise(
                meas.raw_range, meas.raw_azimuth, meas.raw_elevation
            )

            # 粗分类（基于RCS）
            if meas.raw_rcs is not None:
                meas.classification = self._classify_by_rcs(meas.raw_rcs)
                meas.classification_confidence = 0.4  # 雷达分类置信度较低

            return meas

        except (KeyError, TypeError, ValueError):
            return None

    def _compute_cartesian_noise(
        self, range_m: float, az_rad: float, el_rad: float
    ) -> np.ndarray:
        """将极坐标噪声传播到笛卡尔坐标"""
        R_polar = self.sensor_info.measurement_noise
        if R_polar.shape == (3, 3):
            sigma_r = np.sqrt(R_polar[0, 0])
            sigma_az = np.sqrt(R_polar[1, 1])
            sigma_el = np.sqrt(R_polar[2, 2])
        else:
            sigma_r, sigma_az, sigma_el = 30.0, np.radians(1.0), np.radians(1.0)

        cos_el = np.cos(el_rad)
        sin_el = np.sin(el_rad)
        cos_az = np.cos(az_rad)
        sin_az = np.sin(az_rad)

        # 雅可比矩阵 (极坐标→ENU)
        J = np.array([
            [cos_el * sin_az, range_m * cos_el * cos_az, -range_m * sin_el * sin_az],
            [cos_el * cos_az, -range_m * cos_el * sin_az, -range_m * sin_el * cos_az],
            [sin_el, 0, range_m * cos_el],
        ])

        R_polar_diag = np.diag([sigma_r ** 2, sigma_az ** 2, sigma_el ** 2])
        return J @ R_polar_diag @ J.T

    @staticmethod
    def _classify_by_rcs(rcs_dbsm: float) -> TargetCategory:
        """基于RCS的粗分类"""
        if rcs_dbsm < -15:
            return TargetCategory.BIRD
        elif rcs_dbsm < -5:
            return TargetCategory.MULTI_ROTOR
        elif rcs_dbsm < 5:
            return TargetCategory.FIXED_WING
        else:
            return TargetCategory.MANNED_AIRCRAFT


class ADSBAdapter(BaseSensorAdapter):
    """
    ADS-B接收机适配器

    解析ADS-B报文数据，直接提供WGS84经纬高位置和速度。
    """

    def parse_raw_data(self, raw_data: dict) -> Optional[Measurement]:
        """
        解析ADS-B原始数据

        Expected raw_data format:
        {
            "timestamp": float,
            "icao": str,            # ICAO 24位地址
            "callsign": str,        # 呼号
            "latitude": float,      # 纬度 (度)
            "longitude": float,     # 经度 (度)
            "altitude": float,      # 高度 (米)
            "velocity_east": float, # 东向速度 (m/s), 可选
            "velocity_north": float,# 北向速度 (m/s), 可选
            "velocity_up": float,   # 垂直速度 (m/s), 可选
            "squawk": str,          # 应答机编码, 可选
        }
        """
        try:
            meas = Measurement(
                sensor_id=self.sensor_info.sensor_id,
                sensor_type=SensorType.ADSB,
                timestamp=raw_data["timestamp"],
                icao_address=raw_data.get("icao"),
                callsign=raw_data.get("callsign"),
                squawk=raw_data.get("squawk"),
            )

            # 经纬高→ENU
            meas.position = lla_to_enu(
                raw_data["latitude"],
                raw_data["longitude"],
                raw_data["altitude"],
                self.config.reference_lat,
                self.config.reference_lon,
                self.config.reference_alt,
            )

            # 速度（如果有）
            if "velocity_east" in raw_data:
                meas.velocity = np.array([
                    raw_data["velocity_east"],
                    raw_data["velocity_north"],
                    raw_data.get("velocity_up", 0.0),
                ])

            # ADS-B位置精度较高
            meas.noise_covariance = np.diag([25.0, 25.0, 100.0])  # 5m/5m/10m

            # ADS-B设备一定是合规飞行器
            meas.classification = TargetCategory.MANNED_AIRCRAFT
            meas.classification_confidence = 0.9

            return meas

        except (KeyError, TypeError, ValueError):
            return None


class RFDetectorAdapter(BaseSensorAdapter):
    """
    射频侦测适配器

    解析射频侦测设备的数据，提供通信协议、频率等信息。
    射频侦测通常只有方位角信息，位置精度较低。
    """

    def parse_raw_data(self, raw_data: dict) -> Optional[Measurement]:
        """
        解析射频侦测原始数据

        Expected raw_data format:
        {
            "timestamp": float,
            "azimuth": float,           # 方位角 (度)
            "estimated_range": float,   # 估计距离 (米), 可选
            "frequency": float,         # 中心频率 (MHz)
            "protocol": str,            # 通信协议 (如 "OcuSync", "WiFi", "LightBridge")
            "signal_strength": float,   # 信号强度 (dBm), 可选
        }
        """
        try:
            meas = Measurement(
                sensor_id=self.sensor_info.sensor_id,
                sensor_type=SensorType.RF_DETECTOR,
                timestamp=raw_data["timestamp"],
                raw_azimuth=np.radians(raw_data["azimuth"]),
                rf_frequency=raw_data.get("frequency"),
                rf_protocol=raw_data.get("protocol"),
            )

            # 射频一般只有方位角，估计一个大致位置
            est_range = raw_data.get("estimated_range", 500.0)  # 默认500m
            meas.raw_range = est_range

            # 转换到ENU
            meas.position = radar_spherical_to_enu(
                est_range,
                meas.raw_azimuth,
                0.0,  # 射频无仰角信息，假设水平
                self._sensor_enu,
            )

            # 射频位置精度很低
            meas.noise_covariance = np.diag([
                10000.0, 10000.0, 2500.0  # ~100m/100m/50m
            ])

            # 基于协议分类
            protocol = raw_data.get("protocol", "").upper()
            if protocol in ("OCUSYNC", "LIGHTBRIDGE", "DJI"):
                meas.classification = TargetCategory.MULTI_ROTOR
                meas.classification_confidence = 0.8
            elif protocol in ("WIFI", "BLUETOOTH"):
                meas.classification = TargetCategory.MULTI_ROTOR
                meas.classification_confidence = 0.5
            else:
                meas.classification = TargetCategory.UNKNOWN
                meas.classification_confidence = 0.1

            return meas

        except (KeyError, TypeError, ValueError):
            return None


class ElectroOpticalAdapter(BaseSensorAdapter):
    """
    光电/红外传感器适配器

    解析光电系统的目标检测结果（通常来自AI视觉识别模块）。
    """

    def parse_raw_data(self, raw_data: dict) -> Optional[Measurement]:
        """
        解析光电检测结果

        Expected raw_data format:
        {
            "timestamp": float,
            "azimuth": float,           # 方位角 (度)
            "elevation": float,         # 俯仰角 (度)
            "estimated_range": float,   # 测距结果 (米), 可选 (激光测距)
            "classification": str,      # AI分类结果 (如 "MULTI_ROTOR")
            "confidence": float,        # 分类置信度
        }
        """
        try:
            meas = Measurement(
                sensor_id=self.sensor_info.sensor_id,
                sensor_type=SensorType.ELECTRO_OPTICAL,
                timestamp=raw_data["timestamp"],
                raw_azimuth=np.radians(raw_data["azimuth"]),
                raw_elevation=np.radians(raw_data.get("elevation", 0.0)),
            )

            est_range = raw_data.get("estimated_range", 300.0)
            meas.raw_range = est_range

            meas.position = radar_spherical_to_enu(
                est_range,
                meas.raw_azimuth,
                meas.raw_elevation,
                self._sensor_enu,
            )

            # 光电位置精度取决于是否有激光测距
            has_laser = "estimated_range" in raw_data
            if has_laser:
                meas.noise_covariance = np.diag([100.0, 100.0, 100.0])  # ~10m
            else:
                meas.noise_covariance = np.diag([2500.0, 2500.0, 2500.0])  # ~50m

            # AI分类结果（光电分类精度通常较高）
            cls_name = raw_data.get("classification", "UNKNOWN")
            try:
                meas.classification = TargetCategory[cls_name]
            except KeyError:
                meas.classification = TargetCategory.UNKNOWN
            meas.classification_confidence = raw_data.get("confidence", 0.5)

            return meas

        except (KeyError, TypeError, ValueError):
            return None


def create_adapter(
    sensor_info: SensorInfo,
    config: FusionConfig,
) -> BaseSensorAdapter:
    """
    工厂函数：根据传感器类型创建对应的适配器

    Args:
        sensor_info: 传感器信息
        config: 系统配置

    Returns:
        BaseSensorAdapter: 适配器实例
    """
    adapter_map = {
        SensorType.RADAR: RadarAdapter,
        SensorType.ADSB: ADSBAdapter,
        SensorType.RF_DETECTOR: RFDetectorAdapter,
        SensorType.ELECTRO_OPTICAL: ElectroOpticalAdapter,
    }

    adapter_cls = adapter_map.get(sensor_info.sensor_type)
    if adapter_cls is None:
        raise ValueError(f"Unsupported sensor type: {sensor_info.sensor_type}")

    return adapter_cls(sensor_info, config)
