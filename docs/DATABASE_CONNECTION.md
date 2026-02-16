# 📊 数据库连接配置指南

本文档详细介绍如何配置和连接点菜系统的MySQL数据库。

---

## 📋 目录

1. [快速开始](#快速开始)
2. [详细步骤](#详细步骤)
3. [配置说明](#配置说明)
4. [连接测试](#连接测试)
5. [常见问题](#常见问题)
6. [高级配置](#高级配置)

---

## 🚀 快速开始

### 最快3步连接数据库

```bash
# 1. 安装MySQL (如果还未安装)
# Ubuntu/Debian
sudo apt install mysql-server

# macOS
brew install mysql

# 2. 创建数据库并导入数据
mysql -u root -p < database/migrations/001_create_tables.sql
mysql -u root -p < database/seeds/001_test_data.sql

# 3. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env 文件，设置 DB_PASSWORD
```

---

## 📝 详细步骤

### 步骤1: 安装MySQL

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt update

# 安装MySQL服务器
sudo apt install mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 运行安全配置向导
sudo mysql_secure_installation
```

#### macOS
```bash
# 使用Homebrew安装
brew install mysql

# 启动MySQL服务
brew services start mysql

# 首次设置root密码
mysql_secure_installation
```

#### Windows
1. 从 [MySQL官网](https://dev.mysql.com/downloads/mysql/) 下载MySQL安装包
2. 运行安装程序，选择"Developer Default"
3. 设置root密码（记住这个密码！）
4. 完成安装

### 步骤2: 登录MySQL

```bash
# 使用root账号登录
mysql -u root -p

# 输入密码后，您会看到MySQL提示符：
# mysql>
```

### 步骤3: 创建数据库

#### 方法1: 在MySQL命令行中执行

```bash
# 登录MySQL
mysql -u root -p

# 在MySQL命令行中执行：
mysql> source /path/to/order-system/database/migrations/001_create_tables.sql
mysql> source /path/to/order-system/database/seeds/001_test_data.sql
mysql> exit
```

**注意**: 请将 `/path/to/order-system` 替换为您的实际项目路径。

#### 方法2: 使用命令行直接导入

```bash
# 进入项目目录
cd /path/to/order-system

# 导入建表脚本
mysql -u root -p < database/migrations/001_create_tables.sql

# 导入测试数据
mysql -u root -p < database/seeds/001_test_data.sql
```

### 步骤4: 验证数据库创建

```bash
# 登录MySQL
mysql -u root -p

# 查看数据库
mysql> SHOW DATABASES;

# 应该能看到 order_system 数据库
+--------------------+
| Database           |
+--------------------+
| order_system       |
| ...                |
+--------------------+

# 使用数据库
mysql> USE order_system;

# 查看表
mysql> SHOW TABLES;

# 应该看到8个表
+------------------------+
| Tables_in_order_system |
+------------------------+
| addresses              |
| admins                 |
| categories             |
| dishes                 |
| order_items            |
| orders                 |
| reviews                |
| users                  |
+------------------------+

# 查看管理员账号（测试数据）
mysql> SELECT username, nickname FROM admins;
+----------+--------------+
| username | nickname     |
+----------+--------------+
| admin    | 系统管理员   |
+----------+--------------+

mysql> exit
```

### 步骤5: 配置环境变量

```bash
# 进入后端目录
cd backend

# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用您喜欢的编辑器
```

在 `.env` 文件中配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost        # 数据库主机地址
DB_PORT=3306            # 数据库端口
DB_NAME=order_system    # 数据库名称
DB_USER=root            # 数据库用户名
DB_PASSWORD=your_password  # 您的MySQL root密码
```

**重要**: 将 `your_password` 替换为您在安装MySQL时设置的实际密码！

### 步骤6: 测试连接

```bash
# 在backend目录下安装依赖
npm install

# 启动后端服务
npm run dev

# 如果看到以下信息，说明连接成功：
# ✅ 数据库连接成功
# 🚀 点菜系统后端服务启动成功
# 📡 服务地址: http://localhost:3000
```

---

## ⚙️ 配置说明

### 环境变量详解

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `DB_HOST` | 数据库主机地址 | localhost | localhost, 192.168.1.100 |
| `DB_PORT` | 数据库端口 | 3306 | 3306 |
| `DB_NAME` | 数据库名称 | order_system | order_system |
| `DB_USER` | 数据库用户名 | root | root, admin |
| `DB_PASSWORD` | 数据库密码 | 空 | your_secure_password |

### 数据库连接池配置

在 `backend/src/config/database.js` 中，连接池已配置为：

```javascript
pool: {
  max: 10,        // 最大连接数
  min: 0,         // 最小连接数
  acquire: 30000, // 获取连接超时时间(ms)
  idle: 10000     // 空闲连接超时时间(ms)
}
```

生产环境建议调整：
- `max`: 20-50 (根据并发量)
- `min`: 5-10 (保持最小连接数)

### 字符集配置

数据库使用 `utf8mb4` 字符集，支持：
- ✅ 中文字符
- ✅ Emoji表情
- ✅ 特殊符号

---

## 🧪 连接测试

### 方法1: 使用测试脚本

创建测试脚本 `backend/test-db-connection.js`:

```javascript
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
    console.log('📊 数据库信息:');
    console.log('   - 主机:', process.env.DB_HOST);
    console.log('   - 端口:', process.env.DB_PORT);
    console.log('   - 数据库:', process.env.DB_NAME);
    console.log('   - 用户:', process.env.DB_USER);
    
    // 测试查询
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM admins');
    console.log('✅ 管理员数量:', results[0].count);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

testConnection();
```

运行测试：
```bash
cd backend
node test-db-connection.js
```

### 方法2: 使用MySQL命令行

```bash
# 测试连接
mysql -h localhost -P 3306 -u root -p order_system

# 成功会看到：
# mysql>
```

### 方法3: 启动后端服务

```bash
cd backend
npm run dev

# 观察启动日志
# ✅ 数据库连接成功  <- 表示连接成功
# ❌ 数据库连接失败  <- 表示连接失败
```

---

## ❓ 常见问题

### Q1: 提示"Access denied for user 'root'@'localhost'"

**原因**: 密码错误或用户权限不足

**解决方案**:
```bash
# 方法1: 重置MySQL root密码
sudo mysql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
mysql> FLUSH PRIVILEGES;
mysql> exit

# 方法2: 创建新的数据库用户
sudo mysql
mysql> CREATE USER 'order_admin'@'localhost' IDENTIFIED BY 'secure_password';
mysql> GRANT ALL PRIVILEGES ON order_system.* TO 'order_admin'@'localhost';
mysql> FLUSH PRIVILEGES;
mysql> exit

# 然后在 .env 中使用新用户
DB_USER=order_admin
DB_PASSWORD=secure_password
```

### Q2: 提示"Unknown database 'order_system'"

**原因**: 数据库未创建

**解决方案**:
```bash
# 手动创建数据库
mysql -u root -p
mysql> CREATE DATABASE order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> exit

# 然后导入表结构
mysql -u root -p order_system < database/migrations/001_create_tables.sql
```

### Q3: 提示"Can't connect to MySQL server"

**原因**: MySQL服务未启动

**解决方案**:
```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl status mysql

# macOS
brew services start mysql
brew services list

# Windows
# 在服务管理器中启动MySQL服务
```

### Q4: 提示"Client does not support authentication protocol"

**原因**: MySQL 8.0使用了新的认证方式

**解决方案**:
```bash
mysql -u root -p
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
mysql> FLUSH PRIVILEGES;
mysql> exit
```

### Q5: 端口3306被占用

**解决方案**:
```bash
# 查看占用端口的进程
# Linux/macOS
sudo lsof -i :3306

# 更改MySQL端口
# 编辑 MySQL 配置文件 /etc/mysql/my.cnf
[mysqld]
port = 3307

# 重启MySQL
sudo systemctl restart mysql

# 更新 .env 文件
DB_PORT=3307
```

### Q6: 连接数过多 "Too many connections"

**解决方案**:
```bash
# 临时增加最大连接数
mysql -u root -p
mysql> SET GLOBAL max_connections = 200;

# 永久修改：编辑 /etc/mysql/my.cnf
[mysqld]
max_connections = 200

# 重启MySQL
sudo systemctl restart mysql
```

---

## 🔧 高级配置

### 远程数据库连接

如果数据库在远程服务器上：

```env
# .env 配置
DB_HOST=192.168.1.100    # 远程数据库IP
DB_PORT=3306
DB_NAME=order_system
DB_USER=remote_user
DB_PASSWORD=remote_password
```

**在数据库服务器上设置**:
```bash
# 创建远程访问用户
mysql -u root -p
mysql> CREATE USER 'remote_user'@'%' IDENTIFIED BY 'remote_password';
mysql> GRANT ALL PRIVILEGES ON order_system.* TO 'remote_user'@'%';
mysql> FLUSH PRIVILEGES;
mysql> exit

# 修改MySQL配置允许远程连接
# 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
# 注释掉或修改:
# bind-address = 0.0.0.0

# 重启MySQL
sudo systemctl restart mysql

# 开放防火墙端口
sudo ufw allow 3306
```

### SSL加密连接

```javascript
// backend/src/config/database.js
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);
```

### 读写分离

```javascript
// backend/src/config/database.js
const sequelize = new Sequelize(process.env.DB_NAME, null, null, {
  dialect: 'mysql',
  replication: {
    read: [
      { host: '192.168.1.101', username: 'read_user', password: 'read_pass' },
      { host: '192.168.1.102', username: 'read_user', password: 'read_pass' }
    ],
    write: { 
      host: '192.168.1.100', 
      username: 'write_user', 
      password: 'write_pass' 
    }
  }
});
```

### Docker环境配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: order_system
      MYSQL_USER: order_admin
      MYSQL_PASSWORD: orderpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/migrations:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: order_admin
      DB_PASSWORD: orderpass
    depends_on:
      - mysql

volumes:
  mysql_data:
```

---

## 📚 相关文档

- [数据库设计文档](./DATABASE.md) - 查看完整的数据库表结构
- [API文档](./API.md) - 了解如何使用数据库API
- [部署文档](./DEPLOYMENT.md) - 生产环境部署指南
- [快速开始](../QUICKSTART.md) - 5分钟快速启动

---

## 🆘 获取帮助

如果遇到其他问题：

1. 查看 [常见问题](#常见问题) 部分
2. 查看后端启动日志中的错误信息
3. 提交 Issue: https://github.com/123-ding/order-system/issues
4. 查看MySQL错误日志: `/var/log/mysql/error.log`

---

**最后更新**: 2024-02-16  
**作者**: 123-ding
