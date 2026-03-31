# 多源数据融合系统 (Multi-Source Data Fusion)

低空安全防御平台的核心融合引擎，支持雷达、光电、射频、ADS-B 等多种传感器数据的时空配准、航迹关联、状态估计与属性融合。

## 系统架构

```
fusion/
├── __init__.py              # 包入口
├── engine.py                # 🔥 融合引擎（主入口）
├── config/
│   └── settings.py          # 系统配置参数
├── core/                    # 核心算法
│   ├── models.py            # 数据模型定义
│   ├── kalman_filter.py     # 卡尔曼滤波器 + 运动模型(CV/CA/CT)
│   ├── imm_filter.py        # 交互多模型(IMM)滤波器
│   ├── association.py       # 航迹关联(门控 + GNN分配)
│   ├── attribute_fusion.py  # D-S证据理论属性融合
│   ├── track_fusion.py      # 协方差交叉(CI)航迹级融合
│   └── track_manager.py     # 航迹生命周期管理
├── adapters/
│   └── sensor_adapters.py   # 传感器数据适配器(雷达/ADS-B/射频/光电)
├── utils/
│   ├── coordinate.py        # 坐标变换(WGS84↔ECEF↔ENU)
│   └── time_sync.py         # 时间同步与插值
├── examples/
│   └── demo.py              # 使用示例
└── tests/                   # 单元测试(56个)
    ├── test_coordinate.py
    ├── test_kalman.py
    ├── test_association.py
    ├── test_attribute_fusion.py
    └── test_engine.py
```

## 核心模块说明

| 模块 | 功能 | 关键算法 |
|------|------|---------|
| `kalman_filter.py` | 状态估计 | 标准卡尔曼滤波, Joseph稳定更新 |
| `imm_filter.py` | 机动目标跟踪 | IMM(CV+CA+CT), 模型概率动态调整 |
| `association.py` | 量测-航迹关联 | 马氏距离门控 + 匈牙利算法(GNN) |
| `attribute_fusion.py` | 目标分类融合 | Dempster-Shafer 证据合成 |
| `track_fusion.py` | 航迹级融合 | 协方差交叉(CI), 加权平均 |
| `track_manager.py` | 航迹管理 | M/N 起始, 滑行/删除逻辑 |
| `coordinate.py` | 坐标变换 | WGS84↔ECEF↔ENU, 雷达极坐标 |

## 快速开始

### 安装依赖

```bash
pip install -r fusion/requirements.txt
```

### 基本使用

```python
from fusion.config.settings import FusionConfig
from fusion.core.models import Measurement, SensorInfo, SensorType
from fusion.engine import FusionEngine

# 1. 创建引擎
config = FusionConfig(reference_lat=30.0, reference_lon=120.0)
engine = FusionEngine(config)

# 2. 注册传感器
engine.register_sensor(SensorInfo(
    sensor_id="RADAR-01",
    sensor_type=SensorType.RADAR,
    position_lla=np.array([30.0, 120.0, 10.0]),
    max_range=10000.0,
    update_rate=10.0,
    measurement_noise=np.diag([900, 0.0003, 0.0003]),
))

# 3. 接入数据并融合
meas = engine.ingest_raw_data("RADAR-01", {
    "timestamp": 1000.0,
    "range": 5000.0,
    "azimuth": 45.0,
    "elevation": 5.0,
    "rcs": -10.0,
})
targets = engine.process_measurements([meas], current_time=1000.0)

# 4. 获取融合目标
for tgt in targets:
    print(f"目标 {tgt.target_id}: ({tgt.latitude:.5f}°, {tgt.longitude:.5f}°)")
```

### 运行示例

```bash
python -m fusion.examples.demo
```

### 运行测试

```bash
python -m pytest fusion/tests/ -v
```

## 数据处理流程

```
传感器原始数据 → 适配器解析 → 标准化量测
                                ↓
            时间校验 ← 预处理 → 位置有效性检查
                                ↓
                 航迹预测(KF/IMM) → 关联门计算(马氏距离)
                                ↓
                    GNN最优分配(匈牙利算法)
                                ↓
              ┌─────────────────┼─────────────────┐
              ↓                 ↓                 ↓
        关联量测 →         未关联航迹 →       未关联量测 →
        状态更新(KF/IMM)   航迹管理更新       新航迹起始
        属性融合(D-S)      (滑行/删除)
              ↓
        航迹质量评分 → 生成融合目标列表 → 输出(WGS84)
```

## 配置参数

主要配置项（`FusionConfig`）：

```python
FusionConfig(
    fusion_cycle=0.1,          # 融合周期 100ms
    gating_threshold=9.21,     # 关联门限 (χ², 3DoF, 99%)
    confirm_hits=3,            # M/N起始: 5次中命中3次确认
    confirm_window=5,
    max_coast_cycles=10,       # 最大滑行周期数
    process_noise_acc=2.0,     # 过程噪声 (m/s²)
    imm_enabled=True,          # 启用IMM多模型
    reference_lat=30.0,        # ENU参考原点
    reference_lon=120.0,
)
```
