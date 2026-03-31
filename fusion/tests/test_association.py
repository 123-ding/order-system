"""
单元测试 - 航迹关联
"""

import numpy as np
import pytest

from fusion.core.association import (
    associate,
    compute_mahalanobis_distance,
    gating,
    gnn_assignment,
)
from fusion.core.kalman_filter import build_observation_matrix
from fusion.core.models import Measurement, Track


def make_track(pos, vel=None):
    """创建测试航迹"""
    t = Track()
    t.state_vector = np.zeros(6)
    t.state_vector[:3] = pos
    if vel is not None:
        t.state_vector[3:6] = vel
    t.covariance = np.eye(6) * 100.0
    return t


def make_measurement(pos, noise_cov=None):
    """创建测试量测"""
    m = Measurement()
    m.position = np.array(pos, dtype=float)
    m.noise_covariance = noise_cov or np.eye(3) * 25.0
    return m


class TestMahalanobisDistance:
    """马氏距离测试"""

    def test_zero_distance(self):
        """量测等于预测时距离为0"""
        H = build_observation_matrix(3)
        x = np.array([100.0, 200.0, 50.0, 0.0, 0.0, 0.0])
        P = np.eye(6) * 100
        z = np.array([100.0, 200.0, 50.0])
        R = np.eye(3) * 25.0

        d2 = compute_mahalanobis_distance(z, x, P, H, R)
        assert abs(d2) < 1e-10

    def test_large_offset(self):
        """大偏差应产生大距离"""
        H = build_observation_matrix(3)
        x = np.array([100.0, 200.0, 50.0, 0.0, 0.0, 0.0])
        P = np.eye(6) * 10
        z = np.array([500.0, 600.0, 300.0])
        R = np.eye(3) * 10.0

        d2 = compute_mahalanobis_distance(z, x, P, H, R)
        assert d2 > 100

    def test_uncertainty_reduces_distance(self):
        """更大的不确定度应减小马氏距离"""
        H = build_observation_matrix(3)
        x = np.zeros(6)
        z = np.array([10.0, 10.0, 10.0])
        R = np.eye(3) * 10.0

        P_small = np.eye(6) * 10
        P_large = np.eye(6) * 10000

        d2_small = compute_mahalanobis_distance(z, x, P_small, H, R)
        d2_large = compute_mahalanobis_distance(z, x, P_large, H, R)

        assert d2_large < d2_small


class TestGating:
    """关联门测试"""

    def test_close_measurement_passes_gate(self):
        """接近的量测应通过关联门"""
        tracks = [make_track([100, 200, 50])]
        measurements = [make_measurement([105, 198, 52])]

        cost = gating(tracks, measurements, threshold=100)
        assert cost[0, 0] < np.inf

    def test_far_measurement_fails_gate(self):
        """远离的量测应被门限拒绝"""
        tracks = [make_track([100, 200, 50])]
        measurements = [make_measurement([1000, 2000, 500])]

        cost = gating(tracks, measurements, threshold=9.21)
        assert cost[0, 0] == np.inf

    def test_empty_inputs(self):
        """空输入应返回空代价矩阵"""
        cost = gating([], [], threshold=9.21)
        assert cost.shape == (0, 0)


class TestGNNAssignment:
    """全局最近邻分配测试"""

    def test_obvious_assignment(self):
        """明显的一对一分配"""
        cost = np.array([
            [1.0, 100.0],
            [100.0, 2.0],
        ])
        assignments = gnn_assignment(cost)
        assert (0, 0) in assignments
        assert (1, 1) in assignments

    def test_inf_prevents_assignment(self):
        """inf应阻止分配"""
        cost = np.array([
            [1.0, np.inf],
            [np.inf, np.inf],
        ])
        assignments = gnn_assignment(cost)
        assert (0, 0) in assignments
        assert len(assignments) == 1

    def test_all_inf(self):
        """全部为inf时应返回空分配"""
        cost = np.full((2, 2), np.inf)
        assignments = gnn_assignment(cost)
        assert len(assignments) == 0


class TestAssociate:
    """完整关联流程测试"""

    def test_full_pipeline(self):
        """完整关联流程：2航迹3量测"""
        tracks = [
            make_track([100, 200, 50]),
            make_track([500, 600, 100]),
        ]
        measurements = [
            make_measurement([105, 198, 52]),    # 应关联到track[0]
            make_measurement([498, 602, 98]),    # 应关联到track[1]
            make_measurement([1000, 1000, 200]),  # 无关联
        ]

        assignments, unassigned_t, unassigned_m = associate(
            tracks, measurements, threshold=50
        )

        assert len(assignments) == 2
        assert len(unassigned_t) == 0
        assert len(unassigned_m) == 1
        assert 2 in unassigned_m

    def test_no_tracks(self):
        """无航迹时所有量测都未关联"""
        measurements = [make_measurement([100, 200, 50])]
        _, _, unassigned_m = associate([], measurements)
        assert len(unassigned_m) == 1
