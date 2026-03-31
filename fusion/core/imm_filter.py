"""
交互多模型 (IMM) 滤波器

用于处理目标运动模式切换（匀速 ↔ 加速 ↔ 转弯），通过并行运行多个
运动模型滤波器并根据似然度动态调整各模型权重。
"""

from __future__ import annotations

import numpy as np

from .kalman_filter import (
    KalmanFilter,
    build_ca_model,
    build_ct_model,
    build_cv_model,
    build_observation_matrix,
)


class IMMFilter:
    """
    交互多模型 (Interacting Multiple Model) 滤波器

    并行运行 CV/CA/CT 三种运动模型，根据量测自适应切换。

    Attributes:
        n_models: 模型数量
        model_probs: 各模型概率
        transition_matrix: 模型转移概率矩阵
    """

    def __init__(
        self,
        transition_matrix: np.ndarray,
        process_noise_acc: float = 2.0,
        turn_rate: float = 0.1,
    ):
        """
        Args:
            transition_matrix: 模型转移概率矩阵 (n_models x n_models)
            process_noise_acc: 过程噪声加速度标准差
            turn_rate: 协调转弯角速度 (rad/s)
        """
        self.n_models = transition_matrix.shape[0]
        self.transition_matrix = transition_matrix
        self.process_noise_acc = process_noise_acc
        self.turn_rate = turn_rate
        self.kf = KalmanFilter(state_dim=6, meas_dim=3)

    def predict(
        self,
        states: list[np.ndarray],
        covariances: list[np.ndarray],
        model_probs: np.ndarray,
        dt: float,
    ) -> tuple[list[np.ndarray], list[np.ndarray], np.ndarray]:
        """
        IMM预测步骤：混合 → 模型预测

        Args:
            states: 各模型的状态向量列表
            covariances: 各模型的协方差矩阵列表
            model_probs: 各模型概率
            dt: 时间步长

        Returns:
            tuple: (预测状态列表, 预测协方差列表, 混合概率)
        """
        # Step 1: 计算混合概率
        mixing_probs = self._compute_mixing_probabilities(model_probs)

        # Step 2: 状态混合
        mixed_states, mixed_covs = self._mix_states(
            states, covariances, mixing_probs
        )

        # Step 3: 各模型独立预测
        predicted_states = []
        predicted_covs = []

        model_builders = [
            lambda d: build_cv_model(d, self.process_noise_acc),
            lambda d: build_ca_model(d, self.process_noise_acc),
            lambda d: build_ct_model(d, self.turn_rate, self.process_noise_acc),
        ]

        for i in range(self.n_models):
            F, Q = model_builders[i](dt)
            x_pred, P_pred = self.kf.predict(mixed_states[i], mixed_covs[i], F, Q)
            predicted_states.append(x_pred)
            predicted_covs.append(P_pred)

        return predicted_states, predicted_covs, mixing_probs

    def update(
        self,
        predicted_states: list[np.ndarray],
        predicted_covs: list[np.ndarray],
        model_probs: np.ndarray,
        z: np.ndarray,
        R: np.ndarray,
    ) -> tuple[list[np.ndarray], list[np.ndarray], np.ndarray, np.ndarray, np.ndarray]:
        """
        IMM更新步骤：各模型更新 → 模型概率更新 → 状态融合

        Args:
            predicted_states: 各模型预测状态列表
            predicted_covs: 各模型预测协方差列表
            model_probs: 当前模型概率
            z: 量测向量 [x, y, z]
            R: 量测噪声协方差

        Returns:
            tuple: (更新后状态列表, 更新后协方差列表, 更新后模型概率,
                    融合状态, 融合协方差)
        """
        H = build_observation_matrix(meas_dim=3)

        updated_states = []
        updated_covs = []
        likelihoods = np.zeros(self.n_models)

        # Step 1: 各模型独立更新
        for i in range(self.n_models):
            x_upd, P_upd, _, lik = self.kf.update(
                predicted_states[i], predicted_covs[i], z, H, R
            )
            updated_states.append(x_upd)
            updated_covs.append(P_upd)
            likelihoods[i] = lik

        # Step 2: 模型概率更新
        # 预测概率 (通过转移矩阵)
        predicted_probs = self.transition_matrix.T @ model_probs
        # 更新概率
        new_probs = predicted_probs * likelihoods
        total = np.sum(new_probs)
        if total > 1e-300:
            new_probs /= total
        else:
            new_probs = np.ones(self.n_models) / self.n_models

        # Step 3: 状态融合（加权平均）
        fused_state = np.zeros(6)
        for i in range(self.n_models):
            fused_state += new_probs[i] * updated_states[i]

        fused_cov = np.zeros((6, 6))
        for i in range(self.n_models):
            diff = updated_states[i] - fused_state
            fused_cov += new_probs[i] * (
                updated_covs[i] + np.outer(diff, diff)
            )

        return updated_states, updated_covs, new_probs, fused_state, fused_cov

    def _compute_mixing_probabilities(
        self, model_probs: np.ndarray
    ) -> np.ndarray:
        """计算混合概率矩阵"""
        mixing = np.zeros((self.n_models, self.n_models))

        for j in range(self.n_models):
            c_j = 0.0
            for i in range(self.n_models):
                c_j += self.transition_matrix[i, j] * model_probs[i]

            if c_j > 1e-300:
                for i in range(self.n_models):
                    mixing[i, j] = (
                        self.transition_matrix[i, j] * model_probs[i] / c_j
                    )

        return mixing

    def _mix_states(
        self,
        states: list[np.ndarray],
        covariances: list[np.ndarray],
        mixing_probs: np.ndarray,
    ) -> tuple[list[np.ndarray], list[np.ndarray]]:
        """状态混合"""
        mixed_states = []
        mixed_covs = []

        for j in range(self.n_models):
            # 混合状态
            x_mixed = np.zeros(6)
            for i in range(self.n_models):
                x_mixed += mixing_probs[i, j] * states[i]

            # 混合协方差
            P_mixed = np.zeros((6, 6))
            for i in range(self.n_models):
                diff = states[i] - x_mixed
                P_mixed += mixing_probs[i, j] * (
                    covariances[i] + np.outer(diff, diff)
                )

            mixed_states.append(x_mixed)
            mixed_covs.append(P_mixed)

        return mixed_states, mixed_covs
