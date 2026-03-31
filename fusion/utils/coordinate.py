"""
坐标变换工具

提供 WGS84 ↔ ENU (东北天) 坐标系互相转换，以及极坐标→笛卡尔坐标转换。
"""

import numpy as np


# WGS84 椭球参数
_WGS84_A = 6378137.0            # 长半轴 (米)
_WGS84_E2 = 6.69437999014e-3    # 第一偏心率的平方


def _deg2rad(deg: float) -> float:
    return deg * np.pi / 180.0


def _rad2deg(rad: float) -> float:
    return rad * 180.0 / np.pi


def _prime_vertical_radius(lat_rad: float) -> float:
    """计算卯酉圈曲率半径 N"""
    sin_lat = np.sin(lat_rad)
    return _WGS84_A / np.sqrt(1.0 - _WGS84_E2 * sin_lat * sin_lat)


def lla_to_ecef(lat: float, lon: float, alt: float) -> np.ndarray:
    """
    WGS84经纬高 → ECEF地心地固坐标

    Args:
        lat: 纬度 (度)
        lon: 经度 (度)
        alt: 高度 (米, 椭球高)

    Returns:
        np.ndarray: [X, Y, Z] ECEF坐标 (米)
    """
    lat_r = _deg2rad(lat)
    lon_r = _deg2rad(lon)
    n = _prime_vertical_radius(lat_r)

    x = (n + alt) * np.cos(lat_r) * np.cos(lon_r)
    y = (n + alt) * np.cos(lat_r) * np.sin(lon_r)
    z = (n * (1 - _WGS84_E2) + alt) * np.sin(lat_r)

    return np.array([x, y, z])


def ecef_to_enu(
    ecef_point: np.ndarray,
    ref_lat: float,
    ref_lon: float,
    ref_alt: float,
) -> np.ndarray:
    """
    ECEF → ENU (以参考点为原点的东北天局部坐标)

    Args:
        ecef_point: [X, Y, Z] ECEF坐标 (米)
        ref_lat: 参考点纬度 (度)
        ref_lon: 参考点经度 (度)
        ref_alt: 参考点高度 (米)

    Returns:
        np.ndarray: [E, N, U] ENU坐标 (米)
    """
    ref_ecef = lla_to_ecef(ref_lat, ref_lon, ref_alt)
    diff = ecef_point - ref_ecef

    lat_r = _deg2rad(ref_lat)
    lon_r = _deg2rad(ref_lon)

    sin_lat = np.sin(lat_r)
    cos_lat = np.cos(lat_r)
    sin_lon = np.sin(lon_r)
    cos_lon = np.cos(lon_r)

    # ECEF→ENU旋转矩阵
    rotation = np.array([
        [-sin_lon, cos_lon, 0],
        [-sin_lat * cos_lon, -sin_lat * sin_lon, cos_lat],
        [cos_lat * cos_lon, cos_lat * sin_lon, sin_lat],
    ])

    return rotation @ diff


def enu_to_ecef(
    enu_point: np.ndarray,
    ref_lat: float,
    ref_lon: float,
    ref_alt: float,
) -> np.ndarray:
    """
    ENU → ECEF

    Args:
        enu_point: [E, N, U] ENU坐标 (米)
        ref_lat: 参考点纬度 (度)
        ref_lon: 参考点经度 (度)
        ref_alt: 参考点高度 (米)

    Returns:
        np.ndarray: [X, Y, Z] ECEF坐标 (米)
    """
    ref_ecef = lla_to_ecef(ref_lat, ref_lon, ref_alt)

    lat_r = _deg2rad(ref_lat)
    lon_r = _deg2rad(ref_lon)

    sin_lat = np.sin(lat_r)
    cos_lat = np.cos(lat_r)
    sin_lon = np.sin(lon_r)
    cos_lon = np.cos(lon_r)

    # ENU→ECEF旋转矩阵 (上面矩阵的转置)
    rotation = np.array([
        [-sin_lon, -sin_lat * cos_lon, cos_lat * cos_lon],
        [cos_lon, -sin_lat * sin_lon, cos_lat * sin_lon],
        [0, cos_lat, sin_lat],
    ])

    return ref_ecef + rotation @ enu_point


def lla_to_enu(
    lat: float,
    lon: float,
    alt: float,
    ref_lat: float,
    ref_lon: float,
    ref_alt: float,
) -> np.ndarray:
    """
    WGS84经纬高 → ENU局部坐标

    Args:
        lat, lon, alt: 目标经纬高
        ref_lat, ref_lon, ref_alt: 参考原点经纬高

    Returns:
        np.ndarray: [E, N, U] ENU坐标 (米)
    """
    ecef = lla_to_ecef(lat, lon, alt)
    return ecef_to_enu(ecef, ref_lat, ref_lon, ref_alt)


def enu_to_lla(
    enu_point: np.ndarray,
    ref_lat: float,
    ref_lon: float,
    ref_alt: float,
) -> tuple[float, float, float]:
    """
    ENU局部坐标 → WGS84经纬高

    Args:
        enu_point: [E, N, U] ENU坐标 (米)
        ref_lat, ref_lon, ref_alt: 参考原点经纬高

    Returns:
        tuple: (lat, lon, alt) 度/度/米
    """
    ecef = enu_to_ecef(enu_point, ref_lat, ref_lon, ref_alt)
    return ecef_to_lla(ecef)


def ecef_to_lla(ecef: np.ndarray) -> tuple[float, float, float]:
    """
    ECEF → WGS84经纬高 (Bowring迭代法)

    Args:
        ecef: [X, Y, Z] ECEF坐标 (米)

    Returns:
        tuple: (lat, lon, alt) 度/度/米
    """
    x, y, z = ecef
    lon = np.arctan2(y, x)

    p = np.sqrt(x * x + y * y)
    lat = np.arctan2(z, p * (1 - _WGS84_E2))

    for _ in range(10):
        n = _prime_vertical_radius(lat)
        lat_new = np.arctan2(z + _WGS84_E2 * n * np.sin(lat), p)
        if abs(lat_new - lat) < 1e-12:
            break
        lat = lat_new

    n = _prime_vertical_radius(lat)
    cos_lat = np.cos(lat)
    if abs(cos_lat) > 1e-10:
        alt = p / cos_lat - n
    else:
        alt = abs(z) - n * (1 - _WGS84_E2)

    return _rad2deg(lat), _rad2deg(lon), alt


def radar_spherical_to_enu(
    range_m: float,
    azimuth_rad: float,
    elevation_rad: float,
    sensor_enu: np.ndarray,
) -> np.ndarray:
    """
    雷达极坐标量测 → ENU笛卡尔坐标

    Args:
        range_m: 距离 (米)
        azimuth_rad: 方位角 (弧度, 北偏东)
        elevation_rad: 俯仰角 (弧度)
        sensor_enu: 传感器在ENU系下的位置 [E, N, U]

    Returns:
        np.ndarray: [E, N, U] 目标在ENU系下的位置
    """
    cos_el = np.cos(elevation_rad)
    e = range_m * cos_el * np.sin(azimuth_rad)
    n = range_m * cos_el * np.cos(azimuth_rad)
    u = range_m * np.sin(elevation_rad)

    return sensor_enu + np.array([e, n, u])
