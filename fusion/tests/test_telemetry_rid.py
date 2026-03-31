"""
单元测试 - 遥测(Telemetry)和远程识别(RID)适配器
"""

import numpy as np
import pytest

from fusion.adapters.sensor_adapters import (
    RIDAdapter,
    TelemetryAdapter,
    create_adapter,
)
from fusion.config.settings import FusionConfig
from fusion.core.models import (
    SensorInfo,
    SensorType,
    TargetCategory,
)


def make_config():
    return FusionConfig(
        reference_lat=30.0,
        reference_lon=120.0,
        reference_alt=0.0,
    )


def make_telemetry_sensor():
    return SensorInfo(
        sensor_id="TELEM-01",
        sensor_type=SensorType.TELEMETRY,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=50000.0,
        update_rate=10.0,
        measurement_noise=np.diag([4.0, 4.0, 9.0]),
        description="飞行器遥测数据链",
    )


def make_rid_sensor():
    return SensorInfo(
        sensor_id="RID-01",
        sensor_type=SensorType.RID,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=1000.0,
        update_rate=1.0,
        measurement_noise=np.diag([9.0, 9.0, 16.0]),
        description="RID接收设备",
    )


class TestTelemetryAdapter:
    """遥测数据适配器测试"""

    def test_parse_basic_telemetry(self):
        """基本遥测数据解析"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "serial_number": "DJI-SN-001",
            "operator_id": "OP-001",
        })

        assert meas is not None
        assert meas.sensor_type == SensorType.TELEMETRY
        assert meas.is_authoritative is True
        assert meas.serial_number == "DJI-SN-001"
        assert meas.operator_id == "OP-001"
        assert meas.position is not None
        assert np.all(np.isfinite(meas.position))

    def test_telemetry_with_velocity(self):
        """遥测数据含速度信息"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "velocity_east": 5.0,
            "velocity_north": 3.0,
            "velocity_up": -1.0,
            "serial_number": "DJI-SN-001",
        })

        assert meas is not None
        assert meas.velocity is not None
        np.testing.assert_allclose(meas.velocity, [5.0, 3.0, -1.0])

    def test_telemetry_noise_covariance(self):
        """遥测数据噪声应很小（高精度）"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "serial_number": "DJI-SN-001",
        })

        assert meas is not None
        # 遥测噪声应比雷达、射频小得多
        assert meas.noise_covariance[0, 0] <= 10.0  # ≤ 10m²
        assert meas.noise_covariance[1, 1] <= 10.0

    def test_telemetry_classification(self):
        """遥测分类置信度应极高"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "serial_number": "DJI-SN-001",
            "aircraft_type": "MULTI_ROTOR",
        })

        assert meas is not None
        assert meas.classification == TargetCategory.MULTI_ROTOR
        assert meas.classification_confidence >= 0.95

    def test_telemetry_with_flight_plan(self):
        """遥测数据含飞行计划信息"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "serial_number": "DJI-SN-001",
            "flight_plan_id": "FP-2024-001",
            "battery_level": 85.0,
            "flight_mode": "AUTO",
        })

        assert meas is not None
        assert meas.flight_plan_id == "FP-2024-001"
        assert meas.battery_level == 85.0
        assert meas.flight_mode == "AUTO"

    def test_telemetry_missing_required_field(self):
        """缺少必要字段应返回None"""
        config = make_config()
        adapter = TelemetryAdapter(make_telemetry_sensor(), config)

        # 缺少 latitude
        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "longitude": 120.01,
            "altitude": 150.0,
        })
        assert meas is None


class TestRIDAdapter:
    """RID适配器测试"""

    def test_parse_basic_rid(self):
        """基本RID数据解析"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-2024-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
            "rid_type": "broadcast",
        })

        assert meas is not None
        assert meas.sensor_type == SensorType.RID
        assert meas.is_authoritative is True
        assert meas.uas_id == "UAS-2024-001"
        assert meas.rid_type == "broadcast"
        assert meas.position is not None

    def test_rid_with_velocity(self):
        """RID数据含速度信息"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
            "velocity_east": 8.0,
            "velocity_north": -2.0,
            "velocity_up": 0.5,
        })

        assert meas is not None
        assert meas.velocity is not None
        np.testing.assert_allclose(meas.velocity, [8.0, -2.0, 0.5])

    def test_rid_with_operator_location(self):
        """RID数据含操作员位置"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
            "operator_id": "OP-RID-001",
            "operator_latitude": 30.005,
            "operator_longitude": 120.005,
        })

        assert meas is not None
        assert meas.rid_operator_id == "OP-RID-001"
        assert meas.rid_operator_location is not None

    def test_rid_noise_covariance(self):
        """RID噪声应较小"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
        })

        assert meas is not None
        assert meas.noise_covariance[0, 0] <= 20.0  # ≤ 20m²
        assert meas.noise_covariance[1, 1] <= 20.0

    def test_rid_classification(self):
        """RID分类置信度应很高"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
            "aircraft_type": "FIXED_WING",
        })

        assert meas is not None
        assert meas.classification == TargetCategory.FIXED_WING
        assert meas.classification_confidence >= 0.9

    def test_rid_missing_required_field(self):
        """缺少必要字段应返回None"""
        config = make_config()
        adapter = RIDAdapter(make_rid_sensor(), config)

        meas = adapter.parse_raw_data({
            "timestamp": 1000.0,
            "uas_id": "UAS-001",
            # 缺少 latitude
        })
        assert meas is None


class TestAdapterFactory:
    """适配器工厂测试"""

    def test_create_telemetry_adapter(self):
        """工厂应能创建遥测适配器"""
        config = make_config()
        adapter = create_adapter(make_telemetry_sensor(), config)
        assert isinstance(adapter, TelemetryAdapter)

    def test_create_rid_adapter(self):
        """工厂应能创建RID适配器"""
        config = make_config()
        adapter = create_adapter(make_rid_sensor(), config)
        assert isinstance(adapter, RIDAdapter)
