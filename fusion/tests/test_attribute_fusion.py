"""
单元测试 - D-S证据理论属性融合
"""

import pytest

from fusion.core.attribute_fusion import (
    bpa_from_classification,
    compute_belief,
    compute_plausibility,
    dempster_combine,
    dempster_combine_multiple,
    make_decision,
)
from fusion.core.models import TargetCategory


class TestDempsterCombine:
    """D-S合成规则测试"""

    def test_combining_consistent_evidence(self):
        """一致证据应互相增强"""
        bpa1 = {"MULTI_ROTOR": 0.6, "UNKNOWN": 0.4}
        bpa2 = {"MULTI_ROTOR": 0.7, "UNKNOWN": 0.3}

        result = dempster_combine(bpa1, bpa2)
        assert result["MULTI_ROTOR"] > 0.8  # 信任度增强

    def test_combining_with_unknown(self):
        """与全集(UNKNOWN)融合不改变信息"""
        bpa1 = {"MULTI_ROTOR": 0.6, "UNKNOWN": 0.4}
        bpa2 = {"UNKNOWN": 1.0}

        result = dempster_combine(bpa1, bpa2)
        assert abs(result["MULTI_ROTOR"] - 0.6) < 1e-6

    def test_conflicting_evidence(self):
        """冲突证据会产生归一化"""
        bpa1 = {"MULTI_ROTOR": 0.8, "UNKNOWN": 0.2}
        bpa2 = {"FIXED_WING": 0.7, "UNKNOWN": 0.3}

        result = dempster_combine(bpa1, bpa2)
        total = sum(result.values())
        assert abs(total - 1.0) < 1e-6

    def test_total_conflict_returns_unknown(self):
        """完全冲突应返回UNKNOWN"""
        bpa1 = {"MULTI_ROTOR": 1.0}
        bpa2 = {"FIXED_WING": 1.0}

        result = dempster_combine(bpa1, bpa2)
        assert "UNKNOWN" in result

    def test_multiple_combine(self):
        """多证据序贯融合"""
        bpa_list = [
            {"MULTI_ROTOR": 0.6, "UNKNOWN": 0.4},
            {"MULTI_ROTOR": 0.5, "UNKNOWN": 0.5},
            {"MULTI_ROTOR": 0.7, "UNKNOWN": 0.3},
        ]

        result = dempster_combine_multiple(bpa_list)
        # 三次一致证据融合后置信度应很高
        assert result.get("MULTI_ROTOR", 0) > 0.9

    def test_sum_to_one(self):
        """融合结果应归一化"""
        bpa1 = {"MULTI_ROTOR": 0.4, "BIRD": 0.3, "UNKNOWN": 0.3}
        bpa2 = {"MULTI_ROTOR": 0.5, "FIXED_WING": 0.2, "UNKNOWN": 0.3}

        result = dempster_combine(bpa1, bpa2)
        assert abs(sum(result.values()) - 1.0) < 1e-6


class TestBeliefPlausibility:
    """信任度和似真度测试"""

    def test_belief(self):
        bpa = {"MULTI_ROTOR": 0.7, "FIXED_WING": 0.1, "UNKNOWN": 0.2}
        bel = compute_belief(bpa)
        assert abs(bel["MULTI_ROTOR"] - 0.7) < 1e-6
        assert abs(bel["FIXED_WING"] - 0.1) < 1e-6

    def test_plausibility(self):
        bpa = {"MULTI_ROTOR": 0.7, "FIXED_WING": 0.1, "UNKNOWN": 0.2}
        pl = compute_plausibility(bpa)
        assert pl["MULTI_ROTOR"] > bpa["MULTI_ROTOR"]  # Pl ≥ Bel
        assert pl["MULTI_ROTOR"] == pytest.approx(0.9)  # 0.7 + 0.2


class TestMakeDecision:
    """分类决策测试"""

    def test_clear_decision(self):
        bpa = {"MULTI_ROTOR": 0.85, "UNKNOWN": 0.15}
        category, conf = make_decision(bpa, threshold=0.6)
        assert category == "MULTI_ROTOR"
        assert conf > 0.6

    def test_uncertain_returns_unknown(self):
        bpa = {"MULTI_ROTOR": 0.3, "FIXED_WING": 0.3, "UNKNOWN": 0.4}
        category, conf = make_decision(bpa, threshold=0.6)
        assert category == "UNKNOWN"


class TestBPAFromClassification:
    """传感器分类结果→BPA转换测试"""

    def test_normal_classification(self):
        bpa = bpa_from_classification(TargetCategory.MULTI_ROTOR, 0.8)
        assert "MULTI_ROTOR" in bpa
        assert abs(bpa["MULTI_ROTOR"] - 0.8) < 1e-6
        assert abs(bpa["UNKNOWN"] - 0.2) < 1e-6

    def test_unknown_classification(self):
        bpa = bpa_from_classification(TargetCategory.UNKNOWN, 0.8)
        assert bpa == {"UNKNOWN": 1.0}

    def test_zero_confidence(self):
        bpa = bpa_from_classification(TargetCategory.MULTI_ROTOR, 0.0)
        assert bpa == {"UNKNOWN": 1.0}
