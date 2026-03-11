# 海上物流配送平台 部署文档

**版本**：v1.0.0

---

## 目录

1. [环境要求](#1-环境要求)
2. [数据库配置](#2-数据库配置)
3. [后端服务部署](#3-后端服务部署)
4. [前端构建与部署](#4-前端构建与部署)
5. [Nginx 配置](#5-nginx-配置)
6. [Docker Compose 部署（可选）](#6-docker-compose-部署可选)
7. [常见问题](#7-常见问题)

---

## 1. 环境要求

### 服务器推荐配置

| 资源   | 最低要求  | 推荐配置  |
|--------|-----------|-----------|
| CPU    | 2 核      | 4 核      |
| 内存   | 4 GB      | 8 GB      |
| 磁盘   | 40 GB SSD | 100 GB SSD|
| 操作系统 | CentOS 7+ / Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### 软件依赖

| 软件     | 最低版本 | 推荐版本 |
|----------|----------|----------|
| Node.js  | 18.0.0   | 20.x LTS |
| MySQL    | 8.0      | 8.0.x    |
| Redis    | 6.0      | 7.x      |
| Nginx    | 1.18     | 1.24     |
| npm      | 9.0      | 10.x     |

### 安装 Node.js（Ubuntu）

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # 验证安装
```

### 安装 MySQL 8.0（Ubuntu）

```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全初始化
sudo mysql_secure_installation
```

### 安装 Redis（Ubuntu）

```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

---

## 2. 数据库配置

### 2.1 创建数据库和用户

```sql
-- 以 root 身份登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE maritime_logistics
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 创建专用数据库用户（请替换为强密码）
CREATE USER 'maritime_user'@'localhost' IDENTIFIED BY 'YourStrongPassword@2024';
GRANT ALL PRIVILEGES ON maritime_logistics.* TO 'maritime_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 导入数据库结构和初始数据

```bash
mysql -u maritime_user -p maritime_logistics < /path/to/order-system/database/schema.sql
```

### 2.3 验证数据导入

```sql
mysql -u maritime_user -p maritime_logistics

SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM vessels;
```

---

## 3. 后端服务部署

### 3.1 安装依赖

```bash
cd /path/to/order-system/backend
npm install --production
```

### 3.2 配置环境变量

复制环境变量模板并填写配置：

```bash
cp .env.example .env
vi .env
```

`.env` 文件内容示例：

```env
# 服务配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=maritime_logistics
DB_USER=maritime_user
DB_PASSWORD=YourStrongPassword@2024

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置（请使用随机强密钥）
JWT_SECRET=your_very_long_and_random_jwt_secret_key_here
JWT_EXPIRES_IN=86400

# 跨域配置
CORS_ORIGIN=https://your-domain.com
```

### 3.3 使用 PM2 启动后端服务

```bash
# 全局安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/app.js --name maritime-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status
pm2 logs maritime-backend
```

### 3.4 验证后端服务

```bash
curl http://localhost:3000/api/v1/health
# 期望响应: {"code":200,"message":"OK"}
```

---

## 4. 前端构建与部署

### 4.1 构建后台管理系统

```bash
cd /path/to/order-system/admin-frontend

# 安装依赖
npm install

# 配置生产环境变量
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_APP_TITLE=海上物流配送平台
EOF

# 生产构建
npm run build

# 构建产物位于 dist/ 目录
ls dist/
```

### 4.2 构建移动端应用

```bash
cd /path/to/order-system/mobile-frontend

# 安装依赖
npm install

# 配置生产环境变量
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_APP_TITLE=海上物流
EOF

# 生产构建
npm run build

ls dist/
```

### 4.3 部署静态文件

```bash
# 后台管理
sudo mkdir -p /var/www/maritime/admin
sudo cp -r /path/to/order-system/admin-frontend/dist/* /var/www/maritime/admin/

# 移动端
sudo mkdir -p /var/www/maritime/mobile
sudo cp -r /path/to/order-system/mobile-frontend/dist/* /var/www/maritime/mobile/
```

---

## 5. Nginx 配置

### 5.1 安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 配置文件

创建站点配置文件 `/etc/nginx/sites-available/maritime`：

```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

# 主服务配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书（使用 Let's Encrypt 或其他证书）
    ssl_certificate     /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    # 安全响应头
    add_header X-Frame-Options        SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection       "1; mode=block";

    # 后台管理系统
    location /admin {
        alias /var/www/maritime/admin;
        try_files $uri $uri/ /admin/index.html;
        index index.html;
    }

    # 移动端应用
    location / {
        root /var/www/maritime/mobile;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1024;
}
```

### 5.3 启用配置并重启

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/maritime /etc/nginx/sites-enabled/

# 检查配置语法
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx
```

### 5.4 申请 SSL 证书（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 6. Docker Compose 部署（可选）

### 6.1 安装 Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com | bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y
```

### 6.2 docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: maritime-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: RootPassword@2024
      MYSQL_DATABASE: maritime_logistics
      MYSQL_USER: maritime_user
      MYSQL_PASSWORD: YourStrongPassword@2024
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    networks:
      - maritime-net

  redis:
    image: redis:7-alpine
    container_name: maritime-redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - maritime-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: maritime-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: maritime_logistics
      DB_USER: maritime_user
      DB_PASSWORD: YourStrongPassword@2024
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your_very_long_and_random_jwt_secret_key_here
      JWT_EXPIRES_IN: 86400
    depends_on:
      - mysql
      - redis
    ports:
      - "3000:3000"
    networks:
      - maritime-net

  nginx:
    image: nginx:alpine
    container_name: maritime-nginx
    restart: always
    volumes:
      - ./nginx/maritime.conf:/etc/nginx/conf.d/default.conf
      - ./admin-frontend/dist:/var/www/maritime/admin
      - ./mobile-frontend/dist:/var/www/maritime/mobile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - maritime-net

volumes:
  mysql_data:
  redis_data:

networks:
  maritime-net:
    driver: bridge
```

### 6.3 启动服务

```bash
# 先构建前端
cd admin-frontend && npm install && npm run build && cd ..
cd mobile-frontend && npm install && npm run build && cd ..

# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps
docker compose logs -f backend
```

### 6.4 停止与更新

```bash
# 停止服务
docker compose down

# 更新并重启
docker compose pull
docker compose up -d --build
```

---

## 7. 常见问题

### Q1：后端服务启动失败，提示数据库连接错误

检查以下配置：
- `.env` 文件中 `DB_HOST`、`DB_USER`、`DB_PASSWORD` 是否正确
- MySQL 服务是否运行：`sudo systemctl status mysql`
- 防火墙是否放开 3306 端口（仅本地访问时无需开放外网）

```bash
# 测试数据库连接
mysql -h 127.0.0.1 -u maritime_user -p maritime_logistics -e "SELECT 1;"
```

### Q2：前端页面空白或 API 请求失败

- 检查 `VITE_API_BASE_URL` 环境变量是否正确
- 检查 Nginx 反向代理配置中的 `proxy_pass` 地址
- 查看浏览器控制台网络请求错误信息

### Q3：PM2 服务重启后自动停止

```bash
# 查看错误日志
pm2 logs maritime-backend --err

# 确认 Node.js 版本兼容
node -v
```

### Q4：上传文件大小限制

在 Nginx 配置中增加：

```nginx
client_max_body_size 50M;
```

### Q5：如何备份数据库

```bash
# 全量备份
mysqldump -u maritime_user -p maritime_logistics > backup_$(date +%Y%m%d).sql

# 定时备份（crontab）
# 每天凌晨2点执行备份
0 2 * * * mysqldump -u maritime_user -pYourPassword maritime_logistics > /backup/maritime_$(date +\%Y\%m\%d).sql
```
