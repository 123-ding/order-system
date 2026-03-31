"""
集成测试 - 权威数据源优先级融合
测试遥测/RID数据在多源融合中的优先级行为
"""

import numpy as np
import pytest

from fusion.config.settings import FusionConfig
from fusion.core.models import (
    Measurement,
    SensorInfo,
    SensorType,
    TargetCategory,
    TrackState,
)
from fusion.engine import FusionEngine


def make_config():
    return FusionConfig(
        reference_lat=30.0,
        reference_lon=120.0,
        reference_alt=0.0,
        fusion_cycle=0.1,
        imm_enabled=True,
        confirm_hits=2,
        confirm_window=3,
        max_coast_cycles=5,
        authoritative_noise_scale=0.1,
        authoritative_override_classification=True,
    )


def make_telemetry_sensor():
    return SensorInfo(
        sensor_id="TELEM-01",
        sensor_type=SensorType.TELEMETRY,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=50000.0,
        update_rate=10.0,
        measurement_noise=np.diag([4.0, 4.0, 9.0]),
    )


def make_rid_sensor():
    return SensorInfo(
        sensor_id="RID-01",
        sensor_type=SensorType.RID,
        position_lla=np.array([30.0, 120.0, 0.0]),
        max_range=1000.0,
        update_rate=1.0,
        measurement_noise=np.diag([9.0, 9.0, 16.0]),
    )


class TestTelemetryPriorityFusion:
    """遥测数据优先级融合测试"""

    def test_telemetry_data_ingestion(self):
        """遥测数据通过引擎接入"""
        config = make_config()
        engine = FusionEngine(config)
        engine.register_sensor(make_telemetry_sensor())

        meas = engine.ingest_raw_data("TELEM-01", {
            "timestamp": 1000.0,
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 150.0,
            "serial_number": "DJI-SN-001",
            "operator_id": "OP-001",
        })

        assert meas is not None
        assert meas.is_authoritative is True

    def test_telemetry_overrides_radar_position(self):
        """遥测数据应在融合中主导位置估计（比雷达更精确）"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        true_pos = np.array([2000.0, 3000.0, 150.0])

        for i in range(10):
            t = base_time + i * 0.1
            measurements = []

            # 雷达量测（较大噪声）
            measurements.append(Measurement(
                sensor_id="RADAR-01",
                sensor_type=SensorType.RADAR,
                timestamp=t,
                position=true_pos + np.random.randn(3) * 30,  # 30m噪声
                noise_covariance=np.diag([900.0, 900.0, 900.0]),
            ))

            # 遥测量测（极小噪声）
            measurements.append(Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=true_pos + np.random.randn(3) * 2,  # 2m噪声
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                velocity=np.array([5.0, 3.0, 0.0]),
                is_authoritative=True,
                serial_number="DJI-SN-001",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            ))

            targets = engine.process_measurements(measurements, current_time=t)

        # 融合结果应接近真实位置（被遥测数据主导）
        assert len(targets) > 0
        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1

        track = confirmed[0]
        pos_error = np.linalg.norm(track.position - true_pos)
        # 由于遥测的高精度，位置误差应较小
        assert pos_error < 30.0  # 远小于雷达的30m噪声

    def test_telemetry_overrides_classification(self):
        """遥测数据应直接覆盖D-S融合的分类结果"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([2000.0, 3000.0, 150.0])

        for i in range(6):
            t = base_time + i * 0.1
            measurements = []

            # 雷达把目标误分类为鸟
            measurements.append(Measurement(
                sensor_id="RADAR-01",
                sensor_type=SensorType.RADAR,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 5,
                noise_covariance=np.diag([25.0, 25.0, 25.0]),
                classification=TargetCategory.BIRD,
                classification_confidence=0.7,
            ))

            # 遥测数据明确是多旋翼
            measurements.append(Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 2,
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                is_authoritative=True,
                serial_number="DJI-SN-001",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            ))

            targets = engine.process_measurements(measurements, current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1
        # 遥测覆盖分类，应为MULTI_ROTOR而不是BIRD
        assert confirmed[0].category == TargetCategory.MULTI_ROTOR

    def test_telemetry_marks_track_authoritative(self):
        """遥测关联后航迹应标记为拥有权威数据源"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([2000.0, 3000.0, 150.0])

        for i in range(5):
            t = base_time + i * 0.1
            meas = Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 2,
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                is_authoritative=True,
                serial_number="DJI-SN-001",
                operator_id="OP-001",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            )
            engine.process_measurements([meas], current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1
        track = confirmed[0]
        assert track.has_authoritative_source is True
        assert track.authoritative_meas is not None
        assert track.authoritative_meas["serial_number"] == "DJI-SN-001"

    def test_telemetry_output_includes_metadata(self):
        """融合输出应包含遥测元数据"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([2000.0, 3000.0, 150.0])

        for i in range(5):
            t = base_time + i * 0.1
            meas = Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 2,
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                is_authoritative=True,
                serial_number="DJI-SN-001",
                operator_id="OP-001",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            )
            targets = engine.process_measurements([meas], current_time=t)

        assert len(targets) > 0
        target = targets[0]
        assert target.has_authoritative_source is True
        assert target.serial_number == "DJI-SN-001"
        assert target.operator_id == "OP-001"


class TestRIDPriorityFusion:
    """RID数据优先级融合测试"""

    def test_rid_data_ingestion(self):
        """RID数据通过引擎接入"""
        config = make_config()
        engine = FusionEngine(config)
        engine.register_sensor(make_rid_sensor())

        meas = engine.ingest_raw_data("RID-01", {
            "timestamp": 1000.0,
            "uas_id": "UAS-2024-001",
            "latitude": 30.01,
            "longitude": 120.01,
            "altitude": 100.0,
            "rid_type": "broadcast",
        })

        assert meas is not None
        assert meas.is_authoritative is True
        assert meas.uas_id == "UAS-2024-001"

    def test_rid_overrides_classification(self):
        """RID数据应覆盖其他传感器的分类"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([1000.0, 1500.0, 80.0])

        for i in range(6):
            t = base_time + i * 0.1
            measurements = []

            # RF探测器（位置精度中等，确保能关联）
            measurements.append(Measurement(
                sensor_id="RF-01",
                sensor_type=SensorType.RF_DETECTOR,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 10,
                noise_covariance=np.diag([400.0, 400.0, 400.0]),
                classification=TargetCategory.UNKNOWN,
                classification_confidence=0.1,
            ))

            # RID明确是固定翼
            measurements.append(Measurement(
                sensor_id="RID-01",
                sensor_type=SensorType.RID,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 3,
                noise_covariance=np.diag([9.0, 9.0, 16.0]),
                is_authoritative=True,
                uas_id="UAS-FW-001",
                classification=TargetCategory.FIXED_WING,
                classification_confidence=0.95,
            ))

            targets = engine.process_measurements(measurements, current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1
        # 至少一条航迹应被RID覆盖为FIXED_WING
        auth_tracks = [t for t in confirmed if t.has_authoritative_source]
        assert len(auth_tracks) >= 1
        assert auth_tracks[0].category == TargetCategory.FIXED_WING

    def test_rid_output_includes_uas_id(self):
        """融合输出应包含RID的UAS ID"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        target_pos = np.array([1000.0, 1500.0, 80.0])

        for i in range(5):
            t = base_time + i * 0.1
            meas = Measurement(
                sensor_id="RID-01",
                sensor_type=SensorType.RID,
                timestamp=t,
                position=target_pos + np.random.randn(3) * 3,
                noise_covariance=np.diag([9.0, 9.0, 16.0]),
                is_authoritative=True,
                uas_id="UAS-2024-001",
                rid_operator_id="OP-RID-001",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.95,
            )
            targets = engine.process_measurements([meas], current_time=t)

        assert len(targets) > 0
        target = targets[0]
        assert target.has_authoritative_source is True
        assert target.uas_id == "UAS-2024-001"
        assert target.operator_id == "OP-RID-001"


class TestThreeSourceFusion:
    """三源融合（雷达+遥测/RID+其他）优先级测试"""

    def test_radar_plus_telemetry_plus_eo(self):
        """雷达+遥测+光电三源融合，遥测应主导"""
        config = make_config()
        engine = FusionEngine(config)

        base_time = 1000.0
        true_pos = np.array([3000.0, 4000.0, 200.0])

        for i in range(10):
            t = base_time + i * 0.1
            measurements = []

            # 雷达（中等精度）
            measurements.append(Measurement(
                sensor_id="RADAR-01",
                sensor_type=SensorType.RADAR,
                timestamp=t,
                position=true_pos + np.random.randn(3) * 20,
                noise_covariance=np.diag([400.0, 400.0, 400.0]),
                classification=TargetCategory.BIRD,
                classification_confidence=0.4,
            ))

            # 光电（较高分类精度但中等位置精度）
            measurements.append(Measurement(
                sensor_id="EO-01",
                sensor_type=SensorType.ELECTRO_OPTICAL,
                timestamp=t,
                position=true_pos + np.random.randn(3) * 15,
                noise_covariance=np.diag([225.0, 225.0, 225.0]),
                classification=TargetCategory.FIXED_WING,
                classification_confidence=0.7,
            ))

            # 遥测（最高精度+权威分类）
            measurements.append(Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=true_pos + np.random.randn(3) * 2,
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                velocity=np.array([10.0, 5.0, 0.0]),
                is_authoritative=True,
                serial_number="DJI-SN-002",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            ))

            targets = engine.process_measurements(measurements, current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 1

        # 应有至少一条包含遥测的航迹
        auth_tracks = [t for t in confirmed if t.has_authoritative_source]
        assert len(auth_tracks) >= 1
        # 遥测覆盖后分类应为MULTI_ROTOR
        assert auth_tracks[0].category == TargetCategory.MULTI_ROTOR
        assert auth_tracks[0].has_authoritative_source is True

    def test_authoritative_quality_boost(self):
        """有权威数据源的航迹质量评分应更高"""
        config = make_config()
        config.max_coast_cycles = 20
        engine = FusionEngine(config)

        base_time = 1000.0
        pos1 = np.array([1000.0, 2000.0, 100.0])
        pos2 = np.array([20000.0, 30000.0, 200.0])  # 很远，确保不会关联

        for i in range(10):
            t = base_time + i * 0.1
            measurements = []

            # 目标1：仅雷达
            measurements.append(Measurement(
                sensor_id="RADAR-01",
                sensor_type=SensorType.RADAR,
                timestamp=t,
                position=pos1 + np.random.randn(3) * 5,
                noise_covariance=np.diag([25.0, 25.0, 25.0]),
            ))

            # 目标2：仅遥测（权威）
            measurements.append(Measurement(
                sensor_id="TELEM-01",
                sensor_type=SensorType.TELEMETRY,
                timestamp=t,
                position=pos2 + np.random.randn(3) * 2,
                noise_covariance=np.diag([4.0, 4.0, 9.0]),
                is_authoritative=True,
                serial_number="SN-002",
                classification=TargetCategory.MULTI_ROTOR,
                classification_confidence=0.98,
            ))

            engine.process_measurements(measurements, current_time=t)

        confirmed = engine.track_manager.confirmed_tracks
        assert len(confirmed) >= 2

        # 找到有权威源的航迹和没有的
        auth_track = next((t for t in confirmed if t.has_authoritative_source), None)
        normal_track = next((t for t in confirmed if not t.has_authoritative_source), None)

        assert auth_track is not None
        assert normal_track is not None
        # 权威源航迹质量应更高
        assert auth_track.quality_score > normal_track.quality_score
