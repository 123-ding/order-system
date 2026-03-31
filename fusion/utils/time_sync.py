"""
时间同步工具

提供传感器数据的时间对齐和插值功能。
"""

import numpy as np


def align_timestamp(
    timestamp: float,
    cycle_period: float,
    method: str = "nearest",
) -> float:
    """
    将时间戳对齐到最近的融合周期节拍

    Args:
        timestamp: 原始时间戳 (秒)
        cycle_period: 融合周期 (秒)
        method: 对齐方式 "nearest" | "floor" | "ceil"

    Returns:
        float: 对齐后的时间戳
    """
    if method == "floor":
        return np.floor(timestamp / cycle_period) * cycle_period
    elif method == "ceil":
        return np.ceil(timestamp / cycle_period) * cycle_period
    else:  # nearest
        return np.round(timestamp / cycle_period) * cycle_period


def linear_interpolate_state(
    state1: np.ndarray,
    time1: float,
    state2: np.ndarray,
    time2: float,
    target_time: float,
) -> np.ndarray:
    """
    线性插值状态向量到目标时刻

    Args:
        state1: 时刻1的状态向量
        time1: 时刻1
        state2: 时刻2的状态向量
        time2: 时刻2
        target_time: 目标时刻

    Returns:
        np.ndarray: 插值后的状态向量
    """
    if abs(time2 - time1) < 1e-10:
        return state1.copy()

    alpha = (target_time - time1) / (time2 - time1)
    alpha = np.clip(alpha, 0.0, 1.0)
    return state1 + alpha * (state2 - state1)


def extrapolate_position(
    position: np.ndarray,
    velocity: np.ndarray,
    dt: float,
) -> np.ndarray:
    """
    用匀速模型外推位置到新时刻

    Args:
        position: 当前位置 [x, y, z]
        velocity: 当前速度 [vx, vy, vz]
        dt: 时间差 (秒)

    Returns:
        np.ndarray: 外推后的位置
    """
    return position + velocity * dt


def check_time_validity(
    timestamp: float,
    reference_time: float,
    max_delay: float = 5.0,
    max_future: float = 1.0,
) -> bool:
    """
    检查时间戳的有效性

    Args:
        timestamp: 待检查的时间戳
        reference_time: 参考时间（通常为当前融合时刻）
        max_delay: 允许的最大延迟 (秒)
        max_future: 允许的最大超前 (秒)

    Returns:
        bool: 时间戳是否有效
    """
    diff = timestamp - reference_time
    return -max_delay <= diff <= max_future
