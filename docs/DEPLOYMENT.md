# 部署文档

## 环境要求

### 必需软件

- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0
- **Redis**: >= 6.0
- **npm** 或 **yarn**

### 推荐配置

**开发环境**:
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB

**生产环境**:
- CPU: 4核+
- 内存: 8GB+
- 硬盘: 50GB+

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/123-ding/order-system.git
cd order-system
```

### 2. 安装数据库

#### MySQL 安装

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS**:
```bash
brew install mysql
brew services start mysql
```

**Windows**:
从 [MySQL官网](https://dev.mysql.com/downloads/mysql/) 下载安装包

#### Redis 安装

**Ubuntu/Debian**:
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

**macOS**:
```bash
brew install redis
brew services start redis
```

**Windows**:
从 [Redis官网](https://redis.io/download) 下载安装包

### 3. 数据库初始化

登录MySQL:
```bash
mysql -u root -p
```

执行建表脚本:
```sql
source /path/to/order-system/database/migrations/001_create_tables.sql
```

插入测试数据:
```sql
source /path/to/order-system/database/seeds/001_test_data.sql
```

或者使用命令行:
```bash
mysql -u root -p order_system < database/migrations/001_create_tables.sql
mysql -u root -p order_system < database/seeds/001_test_data.sql
```

### 4. 后端配置

进入后端目录:
```bash
cd backend
```

安装依赖:
```bash
npm install
```

配置环境变量:
```bash
cp .env.example .env
```

编辑 `.env` 文件:
```env
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=order_system
DB_USER=root
DB_PASSWORD=your_mysql_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRES_IN=7d

# 微信公众号配置（可选）
WECHAT_APP_ID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_appsecret
WECHAT_TOKEN=your_wechat_token
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

# 跨域配置
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

启动后端服务:
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将运行在 `http://localhost:3000`

### 5. 后台管理前端配置

进入后台前端目录:
```bash
cd admin-frontend
```

安装依赖:
```bash
npm install
```

启动开发服务器:
```bash
npm run dev
```

访问 `http://localhost:5173`

默认管理员账号:
- 用户名: `admin`
- 密码: `admin123`

### 6. 移动端前端配置

进入移动端目录:
```bash
cd mobile-frontend
```

安装依赖:
```bash
npm install
```

启动开发服务器:
```bash
npm run dev
```

访问 `http://localhost:5174` (建议使用浏览器的移动设备模式)

---

## 生产环境部署

### 1. 后端部署

#### 使用 PM2

安装 PM2:
```bash
npm install -g pm2
```

启动应用:
```bash
cd backend
pm2 start src/app.js --name order-system-backend
```

PM2 常用命令:
```bash
pm2 list              # 查看应用列表
pm2 logs              # 查看日志
pm2 restart all       # 重启所有应用
pm2 stop all          # 停止所有应用
pm2 delete all        # 删除所有应用
```

设置开机自启:
```bash
pm2 startup
pm2 save
```

### 2. 前端部署

#### 构建生产版本

后台管理前端:
```bash
cd admin-frontend
npm run build
```

移动端前端:
```bash
cd mobile-frontend
npm run build
```

构建产物在 `dist/` 目录

#### 使用 Nginx

安装 Nginx:
```bash
sudo apt install nginx
```

配置 Nginx (`/etc/nginx/sites-available/order-system`):
```nginx
# 后台管理
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    root /var/www/order-system/admin-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}

# 移动端
server {
    listen 80;
    server_name m.yourdomain.com;
    
    root /var/www/order-system/mobile-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

启用站点:
```bash
sudo ln -s /etc/nginx/sites-available/order-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Docker 部署（可选）

### 1. 创建 Dockerfile

**backend/Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: order_system
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    environment:
      DB_HOST: mysql
      REDIS_HOST: redis

volumes:
  mysql_data:
```

### 3. 启动服务

```bash
docker-compose up -d
```

---

## 常见问题

### 1. MySQL 连接失败

检查MySQL是否启动:
```bash
sudo systemctl status mysql
```

检查密码是否正确:
```bash
mysql -u root -p
```

### 2. Redis 连接失败

检查Redis是否启动:
```bash
sudo systemctl status redis
```

测试连接:
```bash
redis-cli ping
```

### 3. 端口被占用

查看端口占用:
```bash
# Linux/macOS
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### 4. 前端API请求失败

检查后端服务是否启动:
```bash
curl http://localhost:3000/health
```

检查 CORS 配置是否正确

### 5. 图片上传失败

检查 `backend/uploads` 目录权限:
```bash
chmod 755 backend/uploads
```

---

## 性能优化

### 1. 数据库优化

- 定期清理过期数据
- 为常用查询添加索引
- 使用连接池

### 2. Redis 缓存

- 缓存热点数据
- 设置合理的过期时间
- 使用Redis集群

### 3. 前端优化

- 启用 Gzip 压缩
- 使用 CDN
- 图片懒加载
- 代码分割

### 4. 负载均衡

使用 Nginx 进行负载均衡:
```nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## 监控和日志

### 1. 日志查看

后端日志:
```bash
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

PM2 日志:
```bash
pm2 logs order-system-backend
```

### 2. 性能监控

使用 PM2 监控:
```bash
pm2 monit
```

---

## 备份策略

### 1. 数据库备份

每日备份:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
mysqldump -u root -p order_system > backup_$DATE.sql
```

### 2. 文件备份

备份上传文件:
```bash
tar -czf uploads_backup.tar.gz backend/uploads/
```

---

## 安全建议

1. **修改默认密码**: 部署前修改所有默认密码
2. **使用 HTTPS**: 生产环境必须使用 HTTPS
3. **防火墙配置**: 只开放必要的端口
4. **定期更新**: 保持依赖包最新
5. **SQL注入防护**: 使用 ORM 参数化查询
6. **XSS防护**: 对用户输入进行转义
7. **限流**: 使用 rate-limit 防止 DDoS

---

## 支持

如有问题，请提交 Issue:
https://github.com/123-ding/order-system/issues
