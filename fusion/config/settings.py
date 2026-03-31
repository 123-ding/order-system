"""
系统配置

定义融合系统的所有可调参数。
"""

from dataclasses import dataclass, field

import numpy as np


@dataclass
class FusionConfig:
    """融合系统配置"""

    # ─── 融合引擎参数 ───
    fusion_cycle: float = 0.1          # 融合周期 (秒), 默认100ms
    max_tracks: int = 500              # 最大同时跟踪目标数

    # ─── 航迹关联参数 ───
    gating_threshold: float = 9.21     # 关联门限 (卡方分布, 3自由度, 99%置信度)
    association_method: str = "GNN"    # 关联方法: "GNN" | "JPDA"

    # ─── 航迹管理参数 ───
    confirm_hits: int = 3              # 确认航迹所需命中次数 (M/N 中的 M)
    confirm_window: int = 5            # 确认航迹的窗口大小 (M/N 中的 N)
    max_coast_cycles: int = 10         # 最大滑行周期数（超过则删除）
    tentative_max_miss: int = 3        # 暂定航迹最大连续丢失次数

    # ─── 状态估计参数 ───
    process_noise_acc: float = 2.0     # 过程噪声加速度标准差 (m/s²)
    initial_velocity_std: float = 10.0  # 初始速度不确定度 (m/s)
    initial_position_std: float = 50.0  # 初始位置不确定度 (m)

    # ─── IMM参数 ───
    imm_enabled: bool = True           # 是否启用交互多模型
    imm_models: list = field(default_factory=lambda: ["CV", "CA", "CT"])
    # IMM模型转移概率矩阵
    imm_transition_matrix: np.ndarray = field(
        default_factory=lambda: np.array([
            [0.90, 0.05, 0.05],   # CV → CV/CA/CT
            [0.05, 0.90, 0.05],   # CA → CV/CA/CT
            [0.05, 0.05, 0.90],   # CT → CV/CA/CT
        ])
    )

    # ─── 属性融合参数 ───
    ds_conflict_threshold: float = 0.7  # D-S证据理论冲突阈值
    classification_confidence_threshold: float = 0.6  # 分类置信度门限

    # ─── 坐标系统参数 ───
    # 参考原点 (WGS84) - 默认为某城市中心
    reference_lat: float = 30.0        # 参考点纬度 (度)
    reference_lon: float = 120.0       # 参考点经度 (度)
    reference_alt: float = 0.0         # 参考点高度 (米)
