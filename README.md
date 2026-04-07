# 🚁 飞行汽车运营平台 (Flying Car Operations Platform)

一个综合性的城市空中交通（UAM）运营管理平台，为飞行汽车商业化运营提供全面的数字化解决方案。

## 产品概述

飞行汽车运营平台覆盖从乘客出行预订到航班调度、空域管理、实时监控、安全保障的全流程管理。

### 核心功能

- 🛫 **航线预订**：乘客可通过移动端浏览航线、预订航班、在线支付
- 📊 **运营管理**：管理后台支持航线、车辆、飞行员、订单全方位管理
- 🗺️ **实时监控**：飞行汽车实时位置追踪、遥测数据监控、告警预警
- 🛡️ **安全保障**：空域管理、飞行路径冲突检测、维保计划管理
- 👨‍✈️ **飞行员管理**：任务派发、排班管理、飞行日志、绩效评估
- 💰 **财务管理**：动态定价、多支付方式、结算管理、数据分析

### 系统架构

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 乘客 APP │  │ 飞行员端 │  │ 管理后台 │  │ 监控大屏 │
│(移动端)  │  │(移动端)  │  │(Web端)   │  │(Web端)   │
└─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
      └──────────────┴──────────────┴──────────────┘
                          │
              ┌───────────┴───────────┐
              │   API Gateway (Nginx) │
              └───────────┬───────────┘
                          │
  ┌────────┬────────┬─────┴───┬────────┬────────┐
  │用户服务│订单服务│航班服务 │车辆服务│空域服务│
  └────────┴────────┴─────────┴────────┴────────┘
                          │
         ┌────────┬───────┴──┬────────┐
         │ MySQL  │  Redis   │   MQ   │
         └────────┴──────────┴────────┘
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端** | Node.js 18+ / Express.js | REST API + WebSocket 实时通信 |
| **管理后台** | Vue 3 + Element Plus | 运营管理、数据可视化 |
| **移动端** | Vue 3 + Vant UI | 乘客端、飞行员端 |
| **数据库** | MySQL 8.0 | 核心业务数据 |
| **缓存** | Redis 6.x | 会话、实时位置、热点数据 |
| **容器化** | Docker + Docker Compose | 开发/生产环境部署 |

## 项目结构

```
order-system/
├── docs/                          # 文档
│   └── solution/                  # 解决方案文档
│       ├── ARCHITECTURE.md        # 系统架构设计
│       ├── PRD.md                 # 产品需求文档
│       ├── DATABASE.md            # 数据库设计文档
│       ├── API.md                 # API 接口设计
│       └── DEPLOYMENT.md          # 部署指南
├── backend/                       # 后端服务
│   ├── src/
│   │   ├── app.js                 # 应用入口
│   │   ├── config/                # 配置文件
│   │   ├── middleware/            # 中间件(认证/限流/错误处理)
│   │   ├── routes/                # API 路由
│   │   ├── services/              # 业务逻辑模块
│   │   └── utils/                 # 工具函数
│   ├── package.json
│   └── Dockerfile
├── admin-frontend/                # 管理后台前端
├── mobile-frontend/               # 移动端前端
├── database/                      # 数据库
│   └── init.sql                   # 初始化脚本(21张表 + 示例数据)
├── docker-compose.yml             # Docker 编排
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0
- Docker >= 20.10 (可选)

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/123-ding/order-system.git
cd order-system

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 手动启动

```bash
# 1. 初始化数据库
mysql -u root -p < database/init.sql

# 2. 启动后端
cd backend
cp .env.example .env    # 配置环境变量
npm install
npm run dev

# 3. 访问服务
# API:        http://localhost:3000
# 健康检查:   http://localhost:3000/health
```

## 解决方案文档

| 文档 | 内容 |
|------|------|
| [🏗️ 系统架构设计](./docs/solution/ARCHITECTURE.md) | 整体架构、技术选型、核心模块设计、非功能性需求 |
| [📋 产品需求文档](./docs/solution/PRD.md) | 用户角色、功能模块、业务规则、数据指标、版本规划 |
| [💾 数据库设计](./docs/solution/DATABASE.md) | 21张数据表结构、ER关系、索引策略、安全策略 |
| [🔌 API 接口设计](./docs/solution/API.md) | RESTful API、WebSocket、第三方集成、安全规范 |
| [🚀 部署指南](./docs/solution/DEPLOYMENT.md) | Docker/K8s 部署、CI/CD、监控告警 |

## 核心 API 概览

| 模块 | 接口示例 | 说明 |
|------|---------|------|
| 认证 | `POST /api/v1/auth/phone/login` | 手机号/微信登录 |
| 航线 | `GET /api/v1/routes/search` | 搜索航线和航班 |
| 起降点 | `GET /api/v1/vertiports/nearby` | 查找附近起降点 |
| 订单 | `POST /api/v1/orders` | 创建出行订单 |
| 追踪 | `GET /api/v1/orders/:id/tracking` | 实时追踪航班 |
| 飞行员 | `GET /api/v1/pilot/tasks/today` | 今日飞行任务 |
| 管理 | `GET /api/v1/admin/dashboard/overview` | 运营数据概览 |

## 数据库设计

系统包含 **21 张核心数据表**，覆盖用户、飞行员、车辆、航线、订单、支付、评价、空域、维保等完整业务链条。附带北京 5 个起降点、8 条航线、8 辆飞行汽车的示例数据。

## 开发进度

- [x] 解决方案设计（架构/PRD/数据库/API/部署）
- [x] 数据库表结构设计与初始化脚本
- [x] 后端项目框架搭建（Express.js）
- [x] 核心 API 路由骨架（认证/用户/航线/订单/起降点/管理/飞行员）
- [x] 中间件（JWT认证/角色授权/限流/错误处理）
- [x] Docker 部署配置
- [ ] 数据库连接与 ORM 集成
- [ ] 完整业务逻辑实现
- [ ] 管理后台前端开发
- [ ] 移动端前端开发
- [ ] WebSocket 实时通信
- [ ] 微信支付集成
- [ ] 单元测试与集成测试
- [ ] 性能优化与安全加固

## 许可证

MIT License

## 作者

123-ding

---

⭐ 如果这个项目对您有帮助，请给个 Star！