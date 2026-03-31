"""
属性融合 - Dempster-Shafer (D-S) 证据理论

实现多传感器目标分类结果的融合。每个传感器对目标类别给出信任度（BPA），
通过D-S合成规则融合多个独立证据。
"""

from __future__ import annotations

from .models import TargetCategory


def dempster_combine(
    bpa1: dict[str, float],
    bpa2: dict[str, float],
) -> dict[str, float]:
    """
    Dempster合成规则

    将两组基本概率赋值 (BPA) 进行融合。

    BPA格式:
        key: 焦元标识 (如 "MULTI_ROTOR", "FIXED_WING", "UNKNOWN"=框架Θ)
        value: 信任度 [0, 1]

    Args:
        bpa1: 第一组BPA (来自传感器1)
        bpa2: 第二组BPA (来自传感器2)

    Returns:
        dict: 融合后的BPA

    Raises:
        ValueError: 当两个证据完全冲突时 (K=1)
    """
    # 计算冲突因子 K
    conflict = 0.0
    combined_raw: dict[str, float] = {}

    for focal1, mass1 in bpa1.items():
        for focal2, mass2 in bpa2.items():
            intersection = _intersect_focal(focal1, focal2)
            product = mass1 * mass2

            if intersection is None:
                # 空集 → 冲突
                conflict += product
            else:
                combined_raw[intersection] = (
                    combined_raw.get(intersection, 0.0) + product
                )

    if conflict >= 1.0 - 1e-10:
        # 完全冲突，返回均匀分布
        return {"UNKNOWN": 1.0}

    # 归一化
    normalizer = 1.0 / (1.0 - conflict)
    result = {}
    for focal, mass in combined_raw.items():
        normalized_mass = mass * normalizer
        if normalized_mass > 1e-10:
            result[focal] = normalized_mass

    return result


def dempster_combine_multiple(bpa_list: list[dict[str, float]]) -> dict[str, float]:
    """
    多证据序贯融合

    Args:
        bpa_list: 多组BPA列表

    Returns:
        dict: 融合后的BPA
    """
    if not bpa_list:
        return {"UNKNOWN": 1.0}

    result = bpa_list[0].copy()
    for i in range(1, len(bpa_list)):
        result = dempster_combine(result, bpa_list[i])

    return result


def compute_belief(bpa: dict[str, float]) -> dict[str, float]:
    """
    计算信任函数 Bel(A)

    Bel(A) = Σ m(B), 对所有 B ⊆ A

    对于单元素焦元，Bel(A) = m(A)

    Args:
        bpa: 基本概率赋值

    Returns:
        dict: 各假设的信任度
    """
    belief: dict[str, float] = {}
    for focal, mass in bpa.items():
        if focal != "UNKNOWN":  # UNKNOWN是全集Θ，不计入单类信任度
            belief[focal] = belief.get(focal, 0.0) + mass
    return belief


def compute_plausibility(bpa: dict[str, float]) -> dict[str, float]:
    """
    计算似真度函数 Pl(A)

    Pl(A) = 1 - Bel(¬A) = Σ m(B), 对所有 B ∩ A ≠ ∅

    Args:
        bpa: 基本概率赋值

    Returns:
        dict: 各假设的似真度
    """
    # 获取所有单元素假设
    all_hypotheses = {f for f in bpa if f != "UNKNOWN"}

    plausibility: dict[str, float] = {}
    for hypothesis in all_hypotheses:
        pl = 0.0
        for focal, mass in bpa.items():
            if focal == hypothesis or focal == "UNKNOWN":
                pl += mass
        plausibility[hypothesis] = pl

    return plausibility


def make_decision(bpa: dict[str, float], threshold: float = 0.6) -> tuple[str, float]:
    """
    基于BPA做出分类决策

    使用 Pignistic 概率转换，然后选择概率最大的假设。

    Args:
        bpa: 融合后的BPA
        threshold: 置信度门限，低于此门限返回UNKNOWN

    Returns:
        tuple: (分类结果, 置信度)
    """
    pignistic = _compute_pignistic_probability(bpa)

    if not pignistic:
        return "UNKNOWN", 0.0

    best = max(pignistic, key=pignistic.get)
    confidence = pignistic[best]

    if confidence < threshold:
        return "UNKNOWN", confidence

    return best, confidence


def bpa_from_classification(
    category: TargetCategory,
    confidence: float,
) -> dict[str, float]:
    """
    将传感器分类结果转换为BPA

    Args:
        category: 传感器给出的分类
        confidence: 传感器分类置信度 [0, 1]

    Returns:
        dict: BPA
    """
    if category == TargetCategory.UNKNOWN or confidence <= 0:
        return {"UNKNOWN": 1.0}

    name = category.name
    return {
        name: confidence,
        "UNKNOWN": 1.0 - confidence,
    }


def _intersect_focal(focal1: str, focal2: str) -> str | None:
    """
    计算两个焦元的交集

    简化实现：仅处理单元素焦元和全集(UNKNOWN)

    Args:
        focal1, focal2: 焦元标识

    Returns:
        str | None: 交集焦元，如果为空集则返回None
    """
    if focal1 == "UNKNOWN":
        return focal2
    if focal2 == "UNKNOWN":
        return focal1
    if focal1 == focal2:
        return focal1
    return None  # 不同单元素焦元的交集为空


def _compute_pignistic_probability(bpa: dict[str, float]) -> dict[str, float]:
    """
    计算 Pignistic 概率

    BetP(A) = Σ |A∩B|/|B| * m(B) / (1-m(∅))

    简化实现：UNKNOWN的质量均匀分配给所有单元素假设
    """
    single_hypotheses = {f for f in bpa if f != "UNKNOWN"}

    if not single_hypotheses:
        return {}

    unknown_mass = bpa.get("UNKNOWN", 0.0)
    n_hypotheses = len(single_hypotheses)
    share_per_hypothesis = unknown_mass / n_hypotheses if n_hypotheses > 0 else 0.0

    pignistic: dict[str, float] = {}
    for h in single_hypotheses:
        pignistic[h] = bpa.get(h, 0.0) + share_per_hypothesis

    return pignistic
