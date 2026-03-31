#!/usr/bin/env python3
"""
多源数据融合系统使用示例

演示完整的融合处理流程：
  1. 创建融合引擎
  2. 注册多种传感器
  3. 模拟多源量测数据
  4. 执行融合处理
  5. 输出融合目标
"""

import numpy as np

from fusion.config.settings import FusionConfig
from fusion.core.models import SensorInfo, SensorType
from fusion.engine import FusionEngine

# 纬度1度对应的地面距离 (米)
METERS_PER_DEGREE_LAT = 111_000.0


def main():
    # ═══════ Step 1: 配置融合引擎 ═══════
    config = FusionConfig(
        reference_lat=30.0,      # 参考原点纬度
        reference_lon=120.0,     # 参考原点经度
        reference_alt=0.0,       # 参考原点高度
        fusion_cycle=0.1,        # 融合周期100ms
        imm_enabled=True,        # 启用IMM滤波
        gating_threshold=16.27,  # 关联门限 (卡方, 3自由度, 99.9%)
    )

    engine = FusionEngine(config)
    print("✅ 融合引擎初始化完成")

    # ═══════ Step 2: 注册传感器 ═══════
    radar = SensorInfo(
        sensor_id="RADAR-01",
        sensor_type=SensorType.RADAR,
        position_lla=np.array([30.0, 120.0, 10.0]),
        max_range=10000.0,
        update_rate=10.0,
        measurement_noise=np.diag([30**2, np.radians(1)**2, np.radians(1)**2]),
        description="主监视雷达",
    )

    adsb = SensorInfo(
        sensor_id="ADSB-01",
        sensor_type=SensorType.ADSB,
        position_lla=np.array([30.0, 120.0, 5.0]),
        max_range=100000.0,
        update_rate=1.0,
        measurement_noise=np.diag([25.0, 25.0, 100.0]),
        description="ADS-B接收机",
    )

    rf_detector = SensorInfo(
        sensor_id="RF-01",
        sensor_type=SensorType.RF_DETECTOR,
        position_lla=np.array([30.0, 120.0, 3.0]),
        max_range=5000.0,
        update_rate=5.0,
        measurement_noise=np.diag([200**2, np.radians(5)**2, np.radians(5)**2]),
        description="射频侦测设备",
    )

    engine.register_sensor(radar)
    engine.register_sensor(adsb)
    engine.register_sensor(rf_detector)
    print(f"✅ 已注册 {len(engine.get_status()['sensor_list'])} 个传感器")

    # ═══════ Step 3: 模拟多源数据 ═══════
    print("\n📡 开始模拟数据融合...")
    base_time = 1000.0

    # 模拟目标1: 无人机（多旋翼，匀速飞行）
    # 模拟目标2: 民航飞机（有ADS-B设备）
    for cycle in range(50):
        t = base_time + cycle * 0.1
        all_measurements = []

        # ─── 目标1: 无人机 ───
        drone_true_pos = np.array([
            2000.0 + 5.0 * cycle,   # 东向匀速
            3000.0 + 3.0 * cycle,   # 北向匀速
            150.0,                    # 定高
        ])

        # 雷达探测到无人机 (每100ms)
        radar_meas = engine.ingest_raw_data("RADAR-01", {
            "timestamp": t,
            "range": float(np.linalg.norm(drone_true_pos)),
            "azimuth": float(np.degrees(np.arctan2(drone_true_pos[0], drone_true_pos[1]))),
            "elevation": float(np.degrees(np.arcsin(drone_true_pos[2] / np.linalg.norm(drone_true_pos)))),
            "rcs": -10.0,  # 小型目标
        })
        if radar_meas:
            all_measurements.append(radar_meas)

        # 射频侦测到无人机 (每200ms)
        if cycle % 2 == 0:
            rf_meas = engine.ingest_raw_data("RF-01", {
                "timestamp": t,
                "azimuth": float(np.degrees(np.arctan2(drone_true_pos[0], drone_true_pos[1]))),
                "estimated_range": float(np.linalg.norm(drone_true_pos[:2])) + np.random.randn() * 100,
                "frequency": 2400.0,
                "protocol": "OcuSync",
            })
            if rf_meas:
                all_measurements.append(rf_meas)

        # ─── 目标2: 民航飞机 ───
        aircraft_true_pos = np.array([
            8000.0 - 20.0 * cycle,   # 东向反向飞行
            6000.0 + 15.0 * cycle,   # 北向飞行
            3000.0,                    # 高空
        ])

        # ADS-B数据 (每500ms)
        if cycle % 5 == 0:
            adsb_meas = engine.ingest_raw_data("ADSB-01", {
                "timestamp": t,
                "icao": "A1B2C3",
                "callsign": "CCA1234",
                "latitude": 30.0 + aircraft_true_pos[1] / METERS_PER_DEGREE_LAT,
                "longitude": 120.0 + aircraft_true_pos[0] / (METERS_PER_DEGREE_LAT * np.cos(np.radians(30))),
                "altitude": aircraft_true_pos[2],
                "velocity_east": -20.0,
                "velocity_north": 15.0,
            })
            if adsb_meas:
                all_measurements.append(adsb_meas)

        # ═══════ Step 4: 执行融合 ═══════
        targets = engine.process_measurements(all_measurements, current_time=t)

        # ═══════ Step 5: 输出结果 ═══════
        if cycle % 10 == 9:
            print(f"\n─── 融合周期 {cycle + 1} (t={t:.1f}s) ───")
            print(f"  活跃航迹: {len(engine.track_manager.active_tracks)}")
            print(f"  确认航迹: {len(engine.track_manager.confirmed_tracks)}")
            print(f"  输出目标: {len(targets)}")

            for tgt in targets:
                print(f"  🎯 {tgt.target_id}:")
                print(f"     位置: ({tgt.latitude:.5f}°, {tgt.longitude:.5f}°, {tgt.altitude:.0f}m)")
                print(f"     速度: {tgt.speed:.1f} m/s, 航向: {tgt.heading:.0f}°")
                print(f"     类别: {tgt.category.name}, 精度: {tgt.position_accuracy:.1f}m")
                print(f"     传感器: {tgt.contributing_sensors}")
                print(f"     质量: {tgt.quality_score:.1f}")

    # 最终统计
    print("\n═══════ 融合处理完成 ═══════")
    status = engine.get_status()
    print(f"  总融合周期: {status['cycle_count']}")
    summary = status["track_summary"]
    print(f"  活跃航迹: {summary['total_active']}")
    print(f"  确认航迹: {summary['total_confirmed']}")
    print(f"  已删除航迹: {summary['total_deleted']}")
    print(f"  状态分布: {summary['by_state']}")


if __name__ == "__main__":
    main()
