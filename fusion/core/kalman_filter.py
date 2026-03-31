"""
卡尔曼滤波器

实现标准卡尔曼滤波（KF）用于线性运动模型下的目标状态估计，
以及扩展卡尔曼滤波（EKF）的基础结构。

状态向量: x = [x, y, z, vx, vy, vz]  (6维)
"""

from __future__ import annotations

import numpy as np


class KalmanFilter:
    """
    标准卡尔曼滤波器

    用于目标状态估计，支持匀速(CV)和匀加速(CA)运动模型。
    """

    def __init__(self, state_dim: int = 6, meas_dim: int = 3):
        """
        Args:
            state_dim: 状态向量维度 (默认6: [x,y,z,vx,vy,vz])
            meas_dim: 量测向量维度 (默认3: [x,y,z])
        """
        self.state_dim = state_dim
        self.meas_dim = meas_dim

    def predict(
        self,
        x: np.ndarray,
        P: np.ndarray,
        F: np.ndarray,
        Q: np.ndarray,
    ) -> tuple[np.ndarray, np.ndarray]:
        """
        预测步骤

        Args:
            x: 当前状态向量 (state_dim,)
            P: 当前状态协方差 (state_dim, state_dim)
            F: 状态转移矩阵 (state_dim, state_dim)
            Q: 过程噪声协方差 (state_dim, state_dim)

        Returns:
            tuple: (预测状态, 预测协方差)
        """
        x_pred = F @ x
        P_pred = F @ P @ F.T + Q
        return x_pred, P_pred

    def update(
        self,
        x_pred: np.ndarray,
        P_pred: np.ndarray,
        z: np.ndarray,
        H: np.ndarray,
        R: np.ndarray,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        更新步骤

        Args:
            x_pred: 预测状态向量
            P_pred: 预测协方差
            z: 量测向量 (meas_dim,)
            H: 观测矩阵 (meas_dim, state_dim)
            R: 量测噪声协方差 (meas_dim, meas_dim)

        Returns:
            tuple: (更新后状态, 更新后协方差, 卡尔曼增益, 似然值)
        """
        # 新息 (Innovation)
        y = z - H @ x_pred

        # 新息协方差
        S = H @ P_pred @ H.T + R

        # 卡尔曼增益
        K = P_pred @ H.T @ np.linalg.inv(S)

        # 状态更新
        x_upd = x_pred + K @ y

        # 协方差更新 (Joseph form for numerical stability)
        I_KH = np.eye(self.state_dim) - K @ H
        P_upd = I_KH @ P_pred @ I_KH.T + K @ R @ K.T

        # 计算似然值（用于模型概率更新）
        likelihood = self._compute_likelihood(y, S)

        return x_upd, P_upd, K, likelihood

    def _compute_likelihood(self, innovation: np.ndarray, S: np.ndarray) -> float:
        """计算量测似然值"""
        n = len(innovation)
        det_S = np.linalg.det(S)
        if det_S <= 0:
            return 1e-300

        exponent = -0.5 * innovation @ np.linalg.inv(S) @ innovation
        normalizer = 1.0 / np.sqrt((2 * np.pi) ** n * det_S)
        return max(normalizer * np.exp(exponent), 1e-300)


def build_cv_model(dt: float, sigma_a: float) -> tuple[np.ndarray, np.ndarray]:
    """
    构建匀速 (Constant Velocity, CV) 运动模型

    Args:
        dt: 时间步长 (秒)
        sigma_a: 过程噪声加速度标准差 (m/s²)

    Returns:
        tuple: (状态转移矩阵F, 过程噪声Q)
    """
    F = np.eye(6)
    F[0, 3] = dt
    F[1, 4] = dt
    F[2, 5] = dt

    # 分段白噪声加速度模型
    q = sigma_a ** 2
    dt2 = dt * dt
    dt3 = dt2 * dt
    dt4 = dt3 * dt

    # 单轴过程噪声块
    q_block = np.array([
        [dt4 / 4, dt3 / 2],
        [dt3 / 2, dt2],
    ]) * q

    Q = np.zeros((6, 6))
    for i in range(3):
        Q[i, i] = q_block[0, 0]
        Q[i, i + 3] = q_block[0, 1]
        Q[i + 3, i] = q_block[1, 0]
        Q[i + 3, i + 3] = q_block[1, 1]

    return F, Q


def build_ca_model(dt: float, sigma_j: float) -> tuple[np.ndarray, np.ndarray]:
    """
    构建匀加速 (Constant Acceleration, CA) 运动模型

    注意：CA模型需要9维状态向量 [x,y,z,vx,vy,vz,ax,ay,az]
    这里简化为6维，通过增大过程噪声来近似。

    Args:
        dt: 时间步长 (秒)
        sigma_j: 加加速度标准差 (m/s³)

    Returns:
        tuple: (状态转移矩阵F, 过程噪声Q)
    """
    F = np.eye(6)
    F[0, 3] = dt
    F[1, 4] = dt
    F[2, 5] = dt

    # CA模型使用更大的过程噪声来容纳加速度变化
    sigma_a = sigma_j * dt  # 等效加速度噪声
    _, Q = build_cv_model(dt, sigma_a * 3.0)
    return F, Q


def build_ct_model(dt: float, omega: float, sigma_a: float) -> tuple[np.ndarray, np.ndarray]:
    """
    构建协调转弯 (Coordinated Turn, CT) 运动模型

    假设目标在水平面内做匀速转弯。

    Args:
        dt: 时间步长 (秒)
        omega: 转弯角速度 (rad/s), 正值为逆时针
        sigma_a: 过程噪声加速度标准差 (m/s²)

    Returns:
        tuple: (状态转移矩阵F, 过程噪声Q)
    """
    if abs(omega) < 1e-6:
        return build_cv_model(dt, sigma_a)

    sin_wt = np.sin(omega * dt)
    cos_wt = np.cos(omega * dt)

    F = np.array([
        [1, 0, 0, sin_wt / omega, -(1 - cos_wt) / omega, 0],
        [0, 1, 0, (1 - cos_wt) / omega, sin_wt / omega, 0],
        [0, 0, 1, 0, 0, dt],
        [0, 0, 0, cos_wt, -sin_wt, 0],
        [0, 0, 0, sin_wt, cos_wt, 0],
        [0, 0, 0, 0, 0, 1],
    ])

    # 使用CV模型的过程噪声近似
    _, Q = build_cv_model(dt, sigma_a * 2.0)
    return F, Q


def build_observation_matrix(meas_dim: int = 3) -> np.ndarray:
    """
    构建位置观测矩阵 H

    Args:
        meas_dim: 量测维度 (3=仅位置, 6=位置+速度)

    Returns:
        np.ndarray: 观测矩阵 H
    """
    if meas_dim == 3:
        H = np.zeros((3, 6))
        H[0, 0] = 1  # 观测 x
        H[1, 1] = 1  # 观测 y
        H[2, 2] = 1  # 观测 z
    elif meas_dim == 6:
        H = np.eye(6)
    else:
        raise ValueError(f"Unsupported measurement dimension: {meas_dim}")
    return H
