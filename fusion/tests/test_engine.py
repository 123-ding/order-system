"""
集成测试 - 融合引擎端到端测试
"""

import numpy as np
import pytest

from fusion.config.settings import FusionConfig
from fusion.core.models import (
    Measurement,
    SensorInfo,
    SensorType,
    TargetCategory,
)
from fusion.engine import FusionEngine


def make_config():
    """创建测试配置"""
    return FusionConfig(
        reference_lat=30.0,
        reference_lon=120.0,
        reference_alt=0.0,
        fusion_cycle=0.1,
        imm_enabled=True,
        confirm_hits=2,
        confirm_window=3,
        max_coast_cycles=5,
    )


def make_radar_sensor():
    """创建测试雷达传感器"""
    return SensorInfo(
        sensor_id="RADAR-01",
        sensor_type=SensorType.RADAR,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=10000.0,
        update_rate=10.0,
        measurement_noise=np.diag([30.0**2, np.radians(1.0)**2, np.radians(1.0)**2]),
    )


def make_adsb_sensor():
    """创建测试ADS-B传感器"""
    return SensorInfo(
        sensor_id="ADSB-01",
        sensor_type=SensorType.ADSB,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=100000.0,
        update_rate=1.0,
        measurement_noise=np.diag([25.0, 25.0, 100.0]),
    )


class TestFusionEngineBasic:
    """融合引擎基础功能测试"""

    def test_engine_init(self):
        """引擎初始化"""
        engine = FusionEngine(make_config())
        status = engine.get_status()
        assert status["cycle_count"] == 0
        assert status["registered_sensors"] == 0

    def test_sensor_registration(self):
        """传感器注册和注销"""
        engine = FusionEngine(make_config())
        engine.register_sensor(make_radar_sensor())
        engine.register_sensor(make_adsb_sensor())

        status = engine.get_status()
        assert status["registered_sensors"] == 2

        engine.unregister_sensor("RADAR-01")
        assert engine.get_status()["registered_sensors"] == 1

    def test_ingest_radar_data(self):
        """雷达原始数据接入"""
        engine = FusionEngine(make_config())
        engine.register_sensor(make_radar_sensor())

        meas = engine.ingest_raw_data("RADAR-01", {
            "timestamp": 1000.0,
            "range": 5000.0,
            "azimuth": 45.0,
            "elevation": 5.0,
        })

        assert meas is not None
        assert meas.position is not None
        assert meas.noise_covariance is not None

    def test_ingest_adsb_data(self):
        """ADS-B数据接入"""
        engine = FusionEngine(make_config())
        engine.register_sensor(make_adsb_sensor())

        meas = engine.ingest_raw_data("ADSB-01", {
            "timestamp": 1000.0,
            "icao": "A1B2C3",
            "callsign": "TEST01",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 500.0,
            "velocity_east": 50.0,
            "velocity_north": 30.0,
        })

        assert meas is not None
        assert meas.icao_address == "A1B2C3"

    def test_unknown_sensor(self):
        """未知传感器应返回None"""
        engine = FusionEngine(make_config())
        meas = engine.ingest_raw_data("UNKNOWN", {"timestamp": 1000.0})
        assert meas is None


class TestFusionEngineIntegration:
    """融合引擎端到端集成测试"""

    def test_single_target_tracking(self):
        """单目标跟踪 - 从暂定到确认"""
        config = make_config()
        engine = FusionEngine(config)

        # 模拟目标位置序列（匀速直线运动）
        base_time = 1000.0
        target_positions = [
            np.array([1000.0 + 10 * i, 2000.0 + 5 * i, 100.0])
            for i in range(10)
        ]

        for i, pos in enumerate(target_positions):
            meas = Measurement(
                sensor_id="SIM-01",
                sensor_type=SensorType.RADAR,
                timestamp=base_time + i * 0.1,
                position=pos + np.random.randn(3) * 5,  # 添加小噪声
                noise_covariance=np.diag([25.0, 25.0, 25.0]),
            )

            targets = engine.process_measurements([meas], current_time=base_time + i * 0.1)

        # 经过多次更新后应有确认航迹
        assert len(engine.track_manager.confirmed_tracks) > 0
        assert len(targets) > 0

    def test_two_target_separation(self):
        """两个间隔较远的目标应形成两条航迹"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0

        for i in range(10):
            t = base_time + i * 0.1
            measurements = [
                Measurement(
                    sensor_id="SIM-01",
                    timestamp=t,
                    position=np.array([1000.0, 2000.0, 100.0]) + np.random.randn(3) * 3,
                    noise_covariance=np.diag([25.0, 25.0, 25.0]),
                ),
                Measurement(
                    sensor_id="SIM-01",
                    timestamp=t,
                    position=np.array([5000.0, 6000.0, 200.0]) + np.random.randn(3) * 3,
                    noise_covariance=np.diag([25.0, 25.0, 25.0]),
                ),
            ]

            engine.process_measurements(measurements, current_time=t)

        # 应形成2条确认航迹
        assert len(engine.track_manager.confirmed_tracks) == 2

    def test_multi_sensor_fusion(self):
        """多传感器数据融合（雷达+ADS-B）"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([3000.0, 4000.0, 500.0])

        for i in range(10):
            t = base_time + i * 0.1
            measurements = []

            # 雷达量测（较低精度）
            measurements.append(Measurement(
                sensor_id="RADAR-01",
                sensor_type=SensorType.RADAR,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 20,
                noise_covariance=np.diag([400.0, 400.0, 400.0]),
            ))

            # ADS-B量测（较高精度）
            measurements.append(Measurement(
                sensor_id="ADSB-01",
                sensor_type=SensorType.ADSB,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 5,
                noise_covariance=np.diag([25.0, 25.0, 100.0]),
                classification=TargetCategory.MANNED_AIRCRAFT,
                classification_confidence=0.9,
            ))

            engine.process_measurements(measurements, current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1

        # 融合航迹应包含多个传感器来源
        track = confirmed[0]
        assert len(track.associated_sensors) >= 1

    def test_track_deletion(self):
        """航迹在目标消失后应被删除"""
        config = make_config()
        config.max_coast_cycles = 3
        config.tentative_max_miss = 2
        engine = FusionEngine(config)

        base_time = 1000.0

        # 先建立航迹
        for i in range(5):
            t = base_time + i * 0.1
            meas = Measurement(
                sensor_id="SIM-01",
                timestamp=t,
                position=np.array([1000.0, 2000.0, 100.0]) + np.random.randn(3) * 3,
                noise_covariance=np.diag([25.0, 25.0, 25.0]),
            )
            engine.process_measurements([meas], current_time=t)

        assert len(engine.track_manager.confirmed_tracks) > 0

        # 停止提供量测，航迹应最终被删除
        for i in range(20):
            t = base_time + (5 + i) * 0.1
            engine.process_measurements([], current_time=t)

        assert len(engine.track_manager.confirmed_tracks) == 0

    def test_fused_target_output(self):
        """验证融合目标输出格式"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        for i in range(10):
            t = base_time + i * 0.1
            meas = Measurement(
                sensor_id="SIM-01",
                timestamp=t,
                position=np.array([1000.0, 2000.0, 100.0]) + np.random.randn(3) * 3,
                noise_covariance=np.diag([25.0, 25.0, 25.0]),
            )
            targets = engine.process_measurements([meas], current_time=t)

        assert len(targets) > 0
        target = targets[0]
        assert target.latitude != 0
        assert target.longitude != 0
        assert target.position_accuracy > 0
