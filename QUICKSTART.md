# 🚀 快速开始指南

本指南将帮助您快速搭建和运行点菜系统。

## 前置要求

确保您已安装以下软件：
- ✅ Node.js >= 18.0.0 ([下载](https://nodejs.org/))
- ✅ MySQL >= 8.0 ([下载](https://dev.mysql.com/downloads/mysql/))
- ✅ Redis >= 6.0 ([下载](https://redis.io/download))
- ✅ Git

## 5分钟快速启动

### 步骤1: 克隆项目

```bash
git clone https://github.com/123-ding/order-system.git
cd order-system
```

### 步骤2: 数据库初始化

```bash
# 启动 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行
source database/migrations/001_create_tables.sql
source database/seeds/001_test_data.sql
exit
```

> 💡 **数据库连接遇到问题？** 查看 [📊 数据库连接配置指南](./docs/DATABASE_CONNECTION.md) 获取详细帮助。

### 步骤3: 启动后端

```bash
cd backend
npm install
cp .env.example .env

# 编辑 .env 文件，设置数据库密码
# DB_PASSWORD=your_mysql_password

# 启动开发服务器
npm run dev
```

✅ 后端运行在 http://localhost:3000

### 步骤4: 启动后台管理前端

**新开一个终端窗口**

```bash
cd admin-frontend
npm install
npm run dev
```

✅ 后台管理运行在 http://localhost:5173

**登录账号**:
- 用户名: `admin`
- 密码: `admin123`

### 步骤5: 启动移动端前端

**新开一个终端窗口**

```bash
cd mobile-frontend
npm install
npm run dev
```

✅ 移动端运行在 http://localhost:5174

## 验证安装

### 测试后端API

```bash
curl http://localhost:3000/health
```

应该返回:
```json
{
  "code": 200,
  "message": "Order System API is running",
  "timestamp": "2024-02-15T..."
}
```

### 访问后台管理

1. 打开浏览器访问 http://localhost:5173
2. 使用账号 `admin` / `admin123` 登录
3. 查看仪表盘的统计数据

### 访问移动端

1. 打开浏览器访问 http://localhost:5174
2. 打开浏览器开发者工具，切换到移动设备模式 (F12 -> 设备工具栏)
3. 浏览首页、菜品列表等

## 常见问题

### Q: MySQL 连接失败

**A**: 检查以下几点：
1. MySQL 服务是否启动: `systemctl status mysql` (Linux) 或 `brew services list` (macOS)
2. `.env` 文件中的数据库密码是否正确
3. 数据库 `order_system` 是否已创建

### Q: Redis 连接失败

**A**: 启动 Redis 服务：
```bash
# Linux
sudo systemctl start redis

# macOS
brew services start redis

# Windows
redis-server
```

### Q: 端口被占用

**A**: 修改端口号：
- 后端: 修改 `backend/.env` 中的 `PORT=3000`
- 后台前端: 修改 `admin-frontend/vite.config.js` 中的 `server.port`
- 移动端: 修改 `mobile-frontend/vite.config.js` 中的 `server.port`

### Q: npm install 失败

**A**: 尝试以下方案：
```bash
# 方案1: 清除缓存
npm cache clean --force
npm install

# 方案2: 使用国内镜像
npm install --registry=https://registry.npmmirror.com

# 方案3: 使用 yarn
npm install -g yarn
yarn install
```

## 下一步

- 📖 阅读 [部署文档](./docs/DEPLOYMENT.md) 了解生产环境部署
- 📚 查看 [API文档](./docs/API.md) 了解接口详情
- 🗄️ 查看 [数据库文档](./docs/DATABASE.md) 了解数据结构

## 技术支持

如有问题，欢迎提交 Issue:
https://github.com/123-ding/order-system/issues

---

✨ 现在开始探索您的点菜系统吧！
