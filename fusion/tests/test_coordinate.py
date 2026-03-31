"""
单元测试 - 坐标变换
"""

import numpy as np
import pytest

from fusion.utils.coordinate import (
    ecef_to_lla,
    enu_to_lla,
    lla_to_ecef,
    lla_to_enu,
    radar_spherical_to_enu,
)


class TestLLAtoECEF:
    """WGS84 ↔ ECEF 转换测试"""

    def test_zero_point(self):
        """赤道零点经度"""
        ecef = lla_to_ecef(0.0, 0.0, 0.0)
        assert abs(ecef[0] - 6378137.0) < 1.0  # X ≈ 长半轴
        assert abs(ecef[1]) < 1.0
        assert abs(ecef[2]) < 1.0

    def test_north_pole(self):
        """北极点"""
        ecef = lla_to_ecef(90.0, 0.0, 0.0)
        assert abs(ecef[0]) < 1.0
        assert abs(ecef[1]) < 1.0
        assert ecef[2] > 6300000  # Z 接近极半径

    def test_roundtrip(self):
        """往返转换精度"""
        original = (30.5, 120.3, 100.0)
        ecef = lla_to_ecef(*original)
        lat, lon, alt = ecef_to_lla(ecef)
        assert abs(lat - original[0]) < 1e-6
        assert abs(lon - original[1]) < 1e-6
        assert abs(alt - original[2]) < 0.01


class TestLLAtoENU:
    """WGS84 ↔ ENU 转换测试"""

    def test_same_point_is_origin(self):
        """参考点自身应转换为ENU原点"""
        enu = lla_to_enu(30.0, 120.0, 0.0, 30.0, 120.0, 0.0)
        np.testing.assert_allclose(enu, [0, 0, 0], atol=0.01)

    def test_north_offset(self):
        """正北方向偏移（纬度增加 → N增加）"""
        # 约111km/度
        enu = lla_to_enu(31.0, 120.0, 0.0, 30.0, 120.0, 0.0)
        assert enu[1] > 100000   # N > 100km
        assert abs(enu[0]) < 100  # E ≈ 0

    def test_east_offset(self):
        """正东方向偏移（经度增加 → E增加）"""
        enu = lla_to_enu(30.0, 121.0, 0.0, 30.0, 120.0, 0.0)
        assert enu[0] > 80000    # E > 80km (cos(30°) * 111km)
        assert abs(enu[1]) < 500  # N方向偏差很小（地球曲率导致的微小分量）

    def test_altitude_offset(self):
        """纯高度偏移"""
        enu = lla_to_enu(30.0, 120.0, 500.0, 30.0, 120.0, 0.0)
        assert abs(enu[0]) < 1   # E ≈ 0
        assert abs(enu[1]) < 1   # N ≈ 0
        assert abs(enu[2] - 500) < 1  # U ≈ 500m

    def test_roundtrip(self):
        """ENU→LLA往返"""
        ref = (30.0, 120.0, 0.0)
        enu = lla_to_enu(30.01, 120.01, 100.0, *ref)
        lat, lon, alt = enu_to_lla(enu, *ref)
        assert abs(lat - 30.01) < 1e-4
        assert abs(lon - 120.01) < 1e-4
        assert abs(alt - 100.0) < 1.0


class TestRadarSphericalToENU:
    """雷达极坐标→ENU转换"""

    def test_north_direction(self):
        """方位角0（正北）"""
        sensor_pos = np.array([0.0, 0.0, 0.0])
        enu = radar_spherical_to_enu(1000.0, 0.0, 0.0, sensor_pos)
        assert abs(enu[0]) < 0.1     # E ≈ 0
        assert abs(enu[1] - 1000) < 0.1  # N = 1000
        assert abs(enu[2]) < 0.1     # U ≈ 0

    def test_east_direction(self):
        """方位角π/2（正东）"""
        sensor_pos = np.array([0.0, 0.0, 0.0])
        enu = radar_spherical_to_enu(1000.0, np.pi / 2, 0.0, sensor_pos)
        assert abs(enu[0] - 1000) < 0.1  # E = 1000
        assert abs(enu[1]) < 0.1          # N ≈ 0

    def test_with_elevation(self):
        """带仰角的转换"""
        sensor_pos = np.array([0.0, 0.0, 0.0])
        enu = radar_spherical_to_enu(1000.0, 0.0, np.radians(30), sensor_pos)
        expected_horizontal = 1000 * np.cos(np.radians(30))
        expected_vertical = 1000 * np.sin(np.radians(30))
        assert abs(enu[1] - expected_horizontal) < 0.1
        assert abs(enu[2] - expected_vertical) < 0.1

    def test_sensor_offset(self):
        """传感器偏移"""
        sensor_pos = np.array([100.0, 200.0, 50.0])
        enu = radar_spherical_to_enu(1000.0, 0.0, 0.0, sensor_pos)
        assert abs(enu[0] - 100) < 0.1
        assert abs(enu[1] - 1200) < 0.1
        assert abs(enu[2] - 50) < 0.1
