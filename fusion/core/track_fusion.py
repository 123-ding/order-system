"""
航迹级融合 - 协方差交叉 (Covariance Intersection)

当两条航迹的交叉相关性未知时，使用CI算法进行保守融合。
"""

from __future__ import annotations

import numpy as np
from scipy.optimize import minimize_scalar


def covariance_intersection(
    x1: np.ndarray,
    P1: np.ndarray,
    x2: np.ndarray,
    P2: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    """
    协方差交叉融合

    在两个估计的交叉相关性未知时，提供一致且保守的融合结果。

    Args:
        x1: 估计1的状态向量
        P1: 估计1的协方差矩阵
        x2: 估计2的状态向量
        P2: 估计2的协方差矩阵

    Returns:
        tuple: (融合状态, 融合协方差)
    """
    # 寻找最优权重 ω ∈ [0, 1]，最小化融合协方差的行列式
    def objective(omega: float) -> float:
        P_inv = omega * np.linalg.inv(P1) + (1 - omega) * np.linalg.inv(P2)
        P_fused = np.linalg.inv(P_inv)
        return np.linalg.det(P_fused)

    result = minimize_scalar(objective, bounds=(0.01, 0.99), method="bounded")
    omega = result.x

    P1_inv = np.linalg.inv(P1)
    P2_inv = np.linalg.inv(P2)

    P_fused_inv = omega * P1_inv + (1 - omega) * P2_inv
    P_fused = np.linalg.inv(P_fused_inv)

    x_fused = P_fused @ (omega * P1_inv @ x1 + (1 - omega) * P2_inv @ x2)

    return x_fused, P_fused


def weighted_average_fusion(
    states: list[np.ndarray],
    covariances: list[np.ndarray],
) -> tuple[np.ndarray, np.ndarray]:
    """
    加权平均融合

    当各估计独立时（交叉相关为零），使用信息矩阵加权的最优融合。

    Args:
        states: 状态向量列表
        covariances: 协方差矩阵列表

    Returns:
        tuple: (融合状态, 融合协方差)
    """
    if len(states) == 1:
        return states[0].copy(), covariances[0].copy()

    info_matrix = np.zeros_like(covariances[0])
    info_vector = np.zeros_like(states[0])

    for x, P in zip(states, covariances):
        P_inv = np.linalg.inv(P)
        info_matrix += P_inv
        info_vector += P_inv @ x

    P_fused = np.linalg.inv(info_matrix)
    x_fused = P_fused @ info_vector

    return x_fused, P_fused
