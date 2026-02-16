# 数据库连接流程图

## 连接架构示意图

```
┌─────────────────────────────────────────────────────────────────┐
│                     点菜系统应用架构                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  后台管理前端     │         │   移动端前端      │
│  (Vue 3)         │         │   (Vue 3)        │
│  Port: 5173      │         │   Port: 5174     │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │  HTTP API 请求             │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    后端服务 (Express)   │
         │    Port: 3000          │
         │                        │
         │  - JWT 认证            │
         │  - 业务逻辑            │
         │  - API 路由            │
         └──────┬────────┬────────┘
                │        │
       ┌────────┘        └────────┐
       │                          │
       ▼                          ▼
┌─────────────┐          ┌─────────────┐
│   MySQL     │          │   Redis     │
│   Port:3306 │          │   Port:6379 │
│             │          │             │
│ - 8个数据表 │          │ - Token缓存 │
│ - 外键关联  │          │ - 会话存储  │
│ - 索引优化  │          │             │
└─────────────┘          └─────────────┘
```

## 数据库连接配置流程

```
1. 安装 MySQL
   │
   ├─ Ubuntu: sudo apt install mysql-server
   ├─ macOS: brew install mysql
   └─ Windows: 下载安装包
   │
   ▼
2. 启动 MySQL 服务
   │
   ├─ Ubuntu: sudo systemctl start mysql
   ├─ macOS: brew services start mysql
   └─ Windows: 服务管理器启动
   │
   ▼
3. 创建数据库和表
   │
   ├─ 方法1: MySQL命令行
   │   mysql> source database/migrations/001_create_tables.sql
   │
   └─ 方法2: 命令行导入
       mysql -u root -p < database/migrations/001_create_tables.sql
   │
   ▼
4. 插入测试数据
   │
   mysql -u root -p < database/seeds/001_test_data.sql
   │
   ▼
5. 配置环境变量
   │
   ├─ cd backend
   ├─ cp .env.example .env
   └─ 编辑 .env 文件:
       DB_HOST=localhost
       DB_PORT=3306
       DB_NAME=order_system
       DB_USER=root
       DB_PASSWORD=your_password
   │
   ▼
6. 测试数据库连接
   │
   ├─ 方法1: 运行测试脚本
   │   npm run test:db
   │
   └─ 方法2: 启动后端服务
       npm run dev
   │
   ▼
7. 连接成功 ✅
```

## Sequelize 连接配置

```javascript
// backend/src/config/database.js

require('dotenv').config();
const { Sequelize } = require('sequelize');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.DB_NAME,      // 数据库名: order_system
  process.env.DB_USER,      // 用户名: root
  process.env.DB_PASSWORD,  // 密码: 从 .env 读取
  {
    host: process.env.DB_HOST,     // 主机: localhost
    port: process.env.DB_PORT,     // 端口: 3306
    dialect: 'mysql',              // 数据库类型
    timezone: '+08:00',            // 时区: 东八区
    
    // 连接池配置
    pool: {
      max: 10,       // 最大连接数
      min: 0,        // 最小连接数
      acquire: 30000,// 获取连接超时(ms)
      idle: 10000    // 空闲超时(ms)
    },
    
    // 表定义配置
    define: {
      timestamps: true,              // 启用时间戳
      underscored: true,             // 使用下划线命名
      charset: 'utf8mb4',           // 字符集
      collate: 'utf8mb4_unicode_ci' // 排序规则
    }
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => console.log('✅ 数据库连接成功'))
  .catch(err => console.error('❌ 数据库连接失败:', err));

module.exports = sequelize;
```

## 环境变量配置 (.env)

```env
# 数据库配置
DB_HOST=localhost        # 数据库主机地址
DB_PORT=3306            # 数据库端口
DB_NAME=order_system    # 数据库名称
DB_USER=root            # 数据库用户名
DB_PASSWORD=your_pass   # 数据库密码 (必填!)

# 其他配置...
```

## 数据表结构

```
order_system 数据库
│
├── users           (用户表)
│   ├── id
│   ├── openid      (微信openid, UNIQUE)
│   ├── nickname
│   ├── avatar
│   ├── phone
│   └── status
│
├── admins          (管理员表)
│   ├── id
│   ├── username    (UNIQUE)
│   ├── password    (BCrypt加密)
│   ├── nickname
│   └── status
│
├── categories      (分类表)
│   ├── id
│   ├── name
│   ├── icon
│   ├── sort
│   ├── parent_id
│   └── status
│
├── dishes          (菜品表)
│   ├── id
│   ├── name
│   ├── category_id (外键 -> categories.id)
│   ├── price
│   ├── description
│   ├── images      (JSON)
│   ├── stock
│   ├── sales
│   ├── rating
│   ├── status
│   ├── is_recommended
│   └── deleted_at  (软删除)
│
├── orders          (订单表)
│   ├── id
│   ├── order_no    (UNIQUE)
│   ├── user_id     (外键 -> users.id)
│   ├── total_amount
│   ├── delivery_date
│   ├── delivery_address
│   ├── status
│   └── remark
│
├── order_items     (订单详情表)
│   ├── id
│   ├── order_id    (外键 -> orders.id)
│   ├── dish_id     (外键 -> dishes.id)
│   ├── dish_name   (快照)
│   ├── price       (快照)
│   └── quantity
│
├── reviews         (评价表)
│   ├── id
│   ├── user_id     (外键 -> users.id)
│   ├── dish_id     (外键 -> dishes.id)
│   ├── order_id    (外键 -> orders.id)
│   ├── rating
│   ├── content
│   ├── images      (JSON)
│   ├── reply
│   └── likes
│
└── addresses       (收货地址表)
    ├── id
    ├── user_id     (外键 -> users.id)
    ├── name
    ├── phone
    ├── address
    └── is_default
```

## 连接测试检查清单

```
测试项目                                     状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ MySQL 服务已启动                          [ ]
□ 数据库 order_system 已创建                [ ]
□ 8个数据表已创建                           [ ]
□ 测试数据已导入                            [ ]
□ .env 文件已配置                           [ ]
□ DB_PASSWORD 已正确设置                    [ ]
□ 运行 npm run test:db 通过                 [ ]
□ 运行 npm run dev 启动成功                 [ ]
□ 看到 "✅ 数据库连接成功" 消息             [ ]
```

## 相关文档

- 📊 [数据库连接配置指南](./DATABASE_CONNECTION.md)
- 🗄️ [数据库设计文档](./DATABASE.md)
- 🚀 [快速开始指南](../QUICKSTART.md)
- 🚢 [部署文档](./DEPLOYMENT.md)
