"""
多源数据融合系统 (Multi-Source Data Fusion System)

低空安全防御平台的核心融合引擎，支持雷达、光电、射频、ADS-B等多种传感器数据的
时空配准、航迹关联、状态估计与属性融合。

Modules:
    core        - 核心融合算法（卡尔曼滤波、IMM、D-S证据理论等）
    adapters    - 传感器数据接入适配器
    utils       - 工具函数（坐标变换、时间同步等）
    config      - 系统配置
"""

__version__ = "1.0.0"
