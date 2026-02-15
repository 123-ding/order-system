# 🍽️ 智能点菜系统 (Order System)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-blue.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个完整的智能点菜系统，支持微信公众号，包含后台管理和移动端用户界面。

## ✨ 项目简介

本项目是一个功能完善的现代化点菜系统，采用前后端分离架构，包含：

- 🎨 **后台管理系统**：基于 Vue 3 + Element Plus 的美观管理界面
- 📱 **移动端应用**：基于 Vue 3 + Vant UI 的移动端网页
- 🚀 **后端服务**：基于 Node.js + Express 的 RESTful API
- 💾 **数据库**：MySQL + Redis 数据存储

## 📸 项目截图

### 后台管理系统
- 紫色渐变主题设计
- 响应式侧边栏布局
- ECharts 数据可视化
- 完整的 CRUD 操作

### 移动端应用
- 橙色主题设计 (#FF6B35)
- Vant UI 组件库
- 流畅的用户体验
- 购物车与订单管理

## 🎯 主要功能

### 后台管理
- ✅ 管理员登录认证 (JWT)
- ✅ 菜品管理（CRUD、图片上传、批量操作）
- ✅ 分类管理（多级分类支持）
- ✅ 订单管理（状态更新、筛选、详情查看）
- ✅ 用户管理（状态控制、详情查看）
- ✅ 评价管理（查看、回复、删除）
- ✅ 数据统计（概览卡片、销售图表）
- ✅ 系统设置（基础配置、营业时间）

### 移动端
- ✅ 微信登录集成
- ✅ 菜品浏览和搜索
- ✅ 按日期点菜（日历选择）
- ✅ 购物车功能
- ✅ 订单管理（创建、查看、取消）
- ✅ 菜品评价（评分、图片上传）
- ✅ 个人中心
- ✅ 收货地址管理

## 🛠️ 技术栈

### 后端
- **框架**: Node.js 18+ & Express.js 4.x
- **数据库**: MySQL 8.0 & Redis 6.x
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **日志**: Winston
- **微信**: 微信公众号 SDK

### 后台管理前端
- **框架**: Vue 3.4 (Composition API)
- **UI库**: Element Plus 2.5
- **路由**: Vue Router 4
- **状态管理**: Pinia 2.1
- **构建工具**: Vite 5
- **HTTP客户端**: Axios
- **图表**: ECharts 5

### 移动端前端
- **框架**: Vue 3.4 (Composition API)
- **UI库**: Vant 4.8
- **路由**: Vue Router 4
- **状态管理**: Pinia 2.1
- **构建工具**: Vite 5
- **HTTP客户端**: Axios
- **日期处理**: dayjs

## 📁 项目结构

```
order-system/
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── config/              # 配置文件 (数据库、Redis、微信)
│   │   ├── controllers/         # 控制器 (admin & mobile)
│   │   ├── models/              # Sequelize 模型 (8个表)
│   │   ├── middleware/          # 中间件 (认证、错误处理、上传)
│   │   ├── routes/              # 路由 (admin & mobile)
│   │   ├── services/            # 业务服务 (微信服务)
│   │   ├── utils/               # 工具函数
│   │   └── app.js               # 应用入口
│   ├── uploads/                 # 上传文件目录
│   └── package.json
│
├── admin-frontend/               # 后台管理前端
│   ├── src/
│   │   ├── views/               # 页面视图 (10个管理页面)
│   │   ├── components/          # 公共组件
│   │   ├── router/              # 路由配置
│   │   ├── store/               # Pinia 状态
│   │   ├── api/                 # API 接口封装
│   │   └── main.js
│   └── package.json
│
├── mobile-frontend/              # 移动端前端
│   ├── src/
│   │   ├── views/               # 页面视图 (9个用户页面)
│   │   ├── components/          # 公共组件
│   │   ├── router/              # 路由配置
│   │   ├── store/               # Pinia 状态
│   │   ├── api/                 # API 接口封装
│   │   ├── utils/               # 工具函数 (微信JSSDK)
│   │   └── main.js
│   └── package.json
│
├── database/                     # 数据库
│   ├── migrations/              # 建表脚本 (8个表)
│   └── seeds/                   # 测试数据
│
└── docs/                        # 文档
    ├── PRD.md                   # 产品需求文档
    ├── API.md                   # API 接口文档
    ├── DATABASE.md              # 数据库设计
    └── DEPLOYMENT.md            # 部署文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0
- npm 或 yarn

### 1. 克隆项目

```bash
git clone https://github.com/123-ding/order-system.git
cd order-system
```

### 2. 数据库初始化

```bash
# 登录 MySQL
mysql -u root -p

# 执行建表脚本
source database/migrations/001_create_tables.sql

# 插入测试数据
source database/seeds/001_test_data.sql
```

### 3. 后端启动

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 配置数据库连接信息
npm run dev
```

后端服务运行在 `http://localhost:3000`

### 4. 后台管理前端启动

```bash
cd admin-frontend
npm install
npm run dev
```

访问 `http://localhost:5173`

**默认管理员账号**:
- 用户名: `admin`
- 密码: `admin123`

### 5. 移动端前端启动

```bash
cd mobile-frontend
npm install
npm run dev
```

访问 `http://localhost:5174` (建议使用浏览器移动设备模式)

## 📚 文档

- [📋 产品需求文档 (PRD)](./docs/PRD.md)
- [🔌 API 接口文档](./docs/API.md)
- [🗄️ 数据库设计文档](./docs/DATABASE.md)
- [🚢 部署文档](./docs/DEPLOYMENT.md)

## 💡 核心特性

### 安全性
- ✅ JWT Token 认证
- ✅ BCrypt 密码加密
- ✅ XSS 防护
- ✅ SQL 注入防护
- ✅ 文件类型验证
- ✅ 请求频率限制

### 性能优化
- ✅ Redis 缓存
- ✅ 数据库索引优化
- ✅ 图片懒加载
- ✅ 代码分割
- ✅ Gzip 压缩

### 开发体验
- ✅ Vue 3 Composition API
- ✅ TypeScript 支持(可选)
- ✅ 热更新
- ✅ ESLint 代码检查
- ✅ 详细的中文注释

## 📊 数据库设计

8个核心数据表：
- `users` - 用户表
- `admins` - 管理员表
- `categories` - 分类表
- `dishes` - 菜品表
- `orders` - 订单表
- `order_items` - 订单详情表
- `reviews` - 评价表
- `addresses` - 收货地址表

详见 [数据库设计文档](./docs/DATABASE.md)

## 🔧 开发进度

- [x] **第一阶段**: 项目框架搭建 ✅
  - [x] 数据库设计
  - [x] 后端 API 框架
  - [x] 后台管理前端框架
  - [x] 移动端前端框架
  - [x] 基础文档

- [ ] **第二阶段**: 核心功能开发
  - [ ] 完善后端业务逻辑
  - [ ] 完善前端交互
  - [ ] 单元测试

- [ ] **第三阶段**: 微信集成
  - [ ] 微信登录
  - [ ] 微信支付
  - [ ] 模板消息推送

- [ ] **第四阶段**: 优化上线
  - [ ] 性能优化
  - [ ] 安全加固
  - [ ] 生产环境部署

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 👥 作者

[@123-ding](https://github.com/123-ding)

## ⭐ Star History

如果这个项目对您有帮助，请给个 Star！

---

**最后更新**: 2024-02-15