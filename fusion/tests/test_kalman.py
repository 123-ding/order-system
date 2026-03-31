"""
单元测试 - 卡尔曼滤波器与IMM
"""

import numpy as np
import pytest

from fusion.core.kalman_filter import (
    KalmanFilter,
    build_ca_model,
    build_ct_model,
    build_cv_model,
    build_observation_matrix,
)
from fusion.core.imm_filter import IMMFilter


class TestKalmanFilter:
    """卡尔曼滤波器基础测试"""

    def setup_method(self):
        self.kf = KalmanFilter(state_dim=6, meas_dim=3)

    def test_predict_no_velocity(self):
        """静止目标预测应保持位置不变"""
        x = np.array([100.0, 200.0, 50.0, 0.0, 0.0, 0.0])
        P = np.eye(6)
        F, Q = build_cv_model(dt=1.0, sigma_a=1.0)

        x_pred, P_pred = self.kf.predict(x, P, F, Q)
        np.testing.assert_allclose(x_pred[:3], [100, 200, 50], atol=0.01)

    def test_predict_with_velocity(self):
        """运动目标预测应根据速度外推位置"""
        x = np.array([0.0, 0.0, 100.0, 10.0, 20.0, -5.0])
        P = np.eye(6)
        F, Q = build_cv_model(dt=2.0, sigma_a=0.1)

        x_pred, _ = self.kf.predict(x, P, F, Q)
        np.testing.assert_allclose(x_pred[:3], [20, 40, 90], atol=0.01)

    def test_update_improves_estimate(self):
        """量测更新应降低不确定度"""
        x_pred = np.array([100.0, 200.0, 50.0, 0.0, 0.0, 0.0])
        P_pred = np.eye(6) * 100.0

        z = np.array([102.0, 198.0, 51.0])
        H = build_observation_matrix(meas_dim=3)
        R = np.eye(3) * 10.0

        x_upd, P_upd, K, lik = self.kf.update(x_pred, P_pred, z, H, R)

        # 更新后位置应在预测和量测之间
        assert 100 < x_upd[0] < 102
        # 更新后不确定度应降低
        assert P_upd[0, 0] < P_pred[0, 0]
        # 似然值应为正数
        assert lik > 0

    def test_convergence(self):
        """多次更新后应收敛到真值"""
        true_pos = np.array([500.0, 300.0, 100.0])
        x = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        P = np.eye(6) * 10000.0
        H = build_observation_matrix(meas_dim=3)
        R = np.eye(3) * 25.0

        for _ in range(20):
            F, Q = build_cv_model(dt=0.1, sigma_a=0.5)
            x, P = self.kf.predict(x, P, F, Q)
            noise = np.random.randn(3) * 5.0
            z = true_pos + noise
            x, P, _, _ = self.kf.update(x, P, z, H, R)

        np.testing.assert_allclose(x[:3], true_pos, atol=20.0)


class TestMotionModels:
    """运动模型测试"""

    def test_cv_model_dimensions(self):
        """CV模型矩阵维度"""
        F, Q = build_cv_model(dt=1.0, sigma_a=2.0)
        assert F.shape == (6, 6)
        assert Q.shape == (6, 6)

    def test_cv_model_symmetry(self):
        """过程噪声矩阵应对称正定"""
        _, Q = build_cv_model(dt=0.1, sigma_a=2.0)
        np.testing.assert_allclose(Q, Q.T, atol=1e-10)
        eigenvalues = np.linalg.eigvalsh(Q)
        assert np.all(eigenvalues >= 0)

    def test_ca_model(self):
        """CA模型应有更大的过程噪声"""
        _, Q_cv = build_cv_model(dt=1.0, sigma_a=2.0)
        _, Q_ca = build_ca_model(dt=1.0, sigma_j=2.0)
        assert np.trace(Q_ca) > np.trace(Q_cv)

    def test_ct_model_degenerates_to_cv(self):
        """当转弯率趋近0时，CT模型应退化为CV模型"""
        F_cv, _ = build_cv_model(dt=1.0, sigma_a=2.0)
        F_ct, _ = build_ct_model(dt=1.0, omega=1e-10, sigma_a=2.0)
        np.testing.assert_allclose(F_ct, F_cv, atol=1e-3)


class TestIMMFilter:
    """IMM滤波器测试"""

    def setup_method(self):
        transition = np.array([
            [0.9, 0.05, 0.05],
            [0.05, 0.9, 0.05],
            [0.05, 0.05, 0.9],
        ])
        self.imm = IMMFilter(transition, process_noise_acc=2.0)

    def test_predict_preserves_probability_sum(self):
        """预测后模型概率之和应为1"""
        x0 = np.array([0.0, 0.0, 100.0, 10.0, 0.0, 0.0])
        states = [x0.copy() for _ in range(3)]
        covs = [np.eye(6) * 100 for _ in range(3)]
        probs = np.array([0.5, 0.3, 0.2])

        _, _, mixing = self.imm.predict(states, covs, probs, dt=0.1)
        # mixing probabilities columns should sum to 1
        for j in range(3):
            assert abs(np.sum(mixing[:, j]) - 1.0) < 1e-6

    def test_update_adjusts_model_probs(self):
        """更新后模型概率应改变且归一"""
        x0 = np.array([0.0, 0.0, 100.0, 10.0, 0.0, 0.0])
        states = [x0.copy() for _ in range(3)]
        covs = [np.eye(6) * 100 for _ in range(3)]
        probs = np.array([1.0 / 3, 1.0 / 3, 1.0 / 3])

        pred_s, pred_c, _ = self.imm.predict(states, covs, probs, dt=0.1)

        z = np.array([1.0, 0.0, 100.0])
        R = np.eye(3) * 25.0

        _, _, new_probs, fused_x, fused_P = self.imm.update(
            pred_s, pred_c, probs, z, R
        )

        assert abs(np.sum(new_probs) - 1.0) < 1e-6
        assert fused_P.shape == (6, 6)
