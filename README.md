# 海上物流配送平台

一个面向航运企业和货主的一站式海上货运管理系统，支持订单在线下单、船舶调度、货物追踪与运费结算。

## 项目概述

本系统包含三个子项目：

- 🖥️ **后台管理系统**：基于 Vue 3 + Element Plus，供管理员和调度员使用
- 📱 **移动端应用**：基于 Vue 3 + Vant UI，供货主在手机上下单和追踪货物
- 🚀 **后端服务**：基于 Node.js + Express 的 RESTful API
- 💾 **数据库**：MySQL 8.0，完整的海运业务数据模型

## 主要功能

### 订单管理
- ✅ 在线提交运输订单
- ✅ 订单全状态流转（待处理→确认→装货→运输→到港→完成）
- ✅ 多条件筛选与搜索
- ✅ 运费自动计算

### 船舶管理
- ✅ 船舶档案管理（集装箱船、散货船、油轮、滚装船）
- ✅ 船舶状态与位置追踪
- ✅ 可用船舶快速查询

### 航线管理
- ✅ 航线档案管理（港口、距离、运费率）
- ✅ 航线启停控制

### 货物管理
- ✅ 多批货物录入与追踪
- ✅ 危险品与温控货物标记
- ✅ 货物全生命周期状态管理

### 用户管理
- ✅ 三级角色权限（管理员 / 调度员 / 客户）
- ✅ JWT 认证
- ✅ 用户增删改查与禁用

### 数据统计
- ✅ 订单数量与运费收入统计
- ✅ 船舶利用率分析
- ✅ 航线热度分析

## 技术栈

### 后端
- Node.js 18+
- Express.js 4.x
- MySQL 8.0
- Redis 6.x
- JWT 认证
- bcrypt 密码加密

### 后台前端
- Vue 3 (Composition API)
- Element Plus
- Vue Router 4
- Pinia
- Vite
- Axios

### 移动端前端
- Vue 3 (Composition API)
- Vant UI 4.x
- Vue Router 4
- Pinia
- Vite
- Axios

## 项目结构

```
order-system/
├── backend/              # 后端服务
├── admin-frontend/       # 后台管理前端
├── mobile-frontend/      # 移动端前端
├── database/
│   └── schema.sql        # 数据库结构与初始化数据
└── docs/
    ├── API.md            # API 接口文档
    ├── DEPLOYMENT.md     # 部署指南
    └── PRD.md            # 产品需求文档
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0

### 初始化数据库

```bash
mysql -u root -p < database/schema.sql
```

初始账号：
| 用户名   | 密码   | 角色   |
|----------|--------|--------|
| admin    | 123456 | 管理员 |
| operator1| 123456 | 调度员 |
| customer1| 123456 | 客户   |

### 启动后端

```bash
cd backend
cp .env.example .env   # 填写数据库等配置
npm install
npm start
```

### 启动后台管理系统

```bash
cd admin-frontend
npm install
npm run dev
```

### 启动移动端

```bash
cd mobile-frontend
npm install
npm run dev
```

## 文档

- [产品需求文档 (PRD)](./docs/PRD.md)
- [API 接口文档](./docs/API.md)
- [部署指南](./docs/DEPLOYMENT.md)

## 许可证

MIT License

---

⭐ 如果这个项目对您有帮助，请给个 Star！