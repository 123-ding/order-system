"""
航迹关联算法

实现量测-航迹关联，包括关联门（Gating）和全局最近邻（GNN）分配。
"""

from __future__ import annotations

import numpy as np
from scipy.optimize import linear_sum_assignment

from .kalman_filter import build_observation_matrix
from .models import Measurement, Track


def compute_mahalanobis_distance(
    z: np.ndarray,
    x_pred: np.ndarray,
    P_pred: np.ndarray,
    H: np.ndarray,
    R: np.ndarray,
) -> float:
    """
    计算马氏距离 (Mahalanobis Distance)

    用于判断量测是否可能属于某条航迹。

    Args:
        z: 量测向量 (meas_dim,)
        x_pred: 预测状态 (state_dim,)
        P_pred: 预测协方差 (state_dim, state_dim)
        H: 观测矩阵 (meas_dim, state_dim)
        R: 量测噪声协方差 (meas_dim, meas_dim)

    Returns:
        float: 马氏距离的平方 (服从χ²分布)
    """
    innovation = z - H @ x_pred
    S = H @ P_pred @ H.T + R

    try:
        S_inv = np.linalg.inv(S)
    except np.linalg.LinAlgError:
        return float("inf")

    d2 = float(innovation @ S_inv @ innovation)
    return d2


def gating(
    tracks: list[Track],
    measurements: list[Measurement],
    threshold: float = 9.21,
) -> np.ndarray:
    """
    关联门计算

    对每对(航迹, 量测)计算马氏距离，返回代价矩阵。
    超过门限的设为无穷大。

    Args:
        tracks: 当前航迹列表
        measurements: 当前量测列表
        threshold: 门限值 (卡方分布, 3自由度99%=9.21, 95%=7.81)

    Returns:
        np.ndarray: 代价矩阵 (n_tracks x n_measurements)
            - 值为马氏距离平方，超门限为inf
    """
    n_tracks = len(tracks)
    n_meas = len(measurements)

    if n_tracks == 0 or n_meas == 0:
        return np.full((n_tracks, n_meas), np.inf)

    H = build_observation_matrix(meas_dim=3)
    cost_matrix = np.full((n_tracks, n_meas), np.inf)

    for i, track in enumerate(tracks):
        for j, meas in enumerate(measurements):
            if meas.position is None:
                continue

            R = meas.noise_covariance
            if R is None:
                R = np.diag([100.0, 100.0, 100.0])  # 默认噪声

            d2 = compute_mahalanobis_distance(
                meas.position, track.state_vector, track.covariance, H, R
            )

            if d2 <= threshold:
                cost_matrix[i, j] = d2

    return cost_matrix


def gnn_assignment(cost_matrix: np.ndarray) -> list[tuple[int, int]]:
    """
    全局最近邻 (GNN) 分配

    使用匈牙利算法求解最优分配，使总代价最小。

    Args:
        cost_matrix: 代价矩阵 (n_tracks x n_measurements)
            - inf 表示不可关联

    Returns:
        list: 关联对列表 [(track_idx, meas_idx), ...]
    """
    n_tracks, n_meas = cost_matrix.shape
    if n_tracks == 0 or n_meas == 0:
        return []

    # 将 inf 替换为一个很大的有限值以便匈牙利算法处理
    large_value = 1e6
    finite_cost = np.where(np.isinf(cost_matrix), large_value, cost_matrix)

    row_ind, col_ind = linear_sum_assignment(finite_cost)

    # 过滤掉原本为 inf 的分配
    assignments = []
    for r, c in zip(row_ind, col_ind):
        if cost_matrix[r, c] < np.inf:
            assignments.append((r, c))

    return assignments


def associate(
    tracks: list[Track],
    measurements: list[Measurement],
    threshold: float = 9.21,
) -> tuple[list[tuple[int, int]], list[int], list[int]]:
    """
    完整的关联流程：门控 → GNN分配 → 输出结果

    Args:
        tracks: 当前航迹列表
        measurements: 当前量测列表
        threshold: 关联门限

    Returns:
        tuple:
            - assignments: 关联对 [(track_idx, meas_idx), ...]
            - unassigned_tracks: 未关联航迹索引列表
            - unassigned_measurements: 未关联量测索引列表
    """
    cost_matrix = gating(tracks, measurements, threshold)
    assignments = gnn_assignment(cost_matrix)

    assigned_tracks = {a[0] for a in assignments}
    assigned_meas = {a[1] for a in assignments}

    unassigned_tracks = [i for i in range(len(tracks)) if i not in assigned_tracks]
    unassigned_meas = [j for j in range(len(measurements)) if j not in assigned_meas]

    return assignments, unassigned_tracks, unassigned_meas
