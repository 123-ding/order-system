# 飞行汽车运营平台 - 部署指南

## 1. 环境要求

### 1.1 开发环境
| 软件 | 版本要求 |
|------|----------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| MySQL | >= 8.0 |
| Redis | >= 6.0 |
| Docker | >= 20.10 |
| Docker Compose | >= 2.0 |

### 1.2 生产环境
| 资源 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 4 核 | 8 核 |
| 内存 | 8 GB | 16 GB |
| 磁盘 | 100 GB SSD | 500 GB SSD |
| 带宽 | 10 Mbps | 50 Mbps |

## 2. 快速开始（开发环境）

### 2.1 克隆项目

```bash
git clone https://github.com/123-ding/order-system.git
cd order-system
```

### 2.2 使用 Docker Compose 启动

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 2.3 手动启动

#### 2.3.1 启动数据库

```bash
# 启动 MySQL
mysql -u root -p < database/init.sql

# 启动 Redis
redis-server
```

#### 2.3.2 启动后端服务

```bash
cd backend
cp .env.example .env    # 复制并修改环境变量
npm install
npm run dev             # 开发模式启动
```

#### 2.3.3 启动管理后台

```bash
cd admin-frontend
npm install
npm run dev             # 默认端口 5173
```

#### 2.3.4 启动移动端

```bash
cd mobile-frontend
npm install
npm run dev             # 默认端口 5174
```

### 2.4 访问地址

| 服务 | 地址 |
|------|------|
| 后端 API | http://localhost:3000 |
| 管理后台 | http://localhost:5173 |
| 移动端 | http://localhost:5174 |
| API 文档 | http://localhost:3000/api-docs |

## 3. 环境变量配置

### 3.1 后端环境变量 (.env)

```env
# 应用配置
NODE_ENV=development
PORT=3000
APP_NAME=飞行汽车运营平台
APP_URL=http://localhost:3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=flying_car_platform
DB_USER=root
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_EXPIRES=2h
JWT_REFRESH_EXPIRES=30d

# 微信配置
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key

# 短信配置
SMS_ACCESS_KEY=your_access_key
SMS_ACCESS_SECRET=your_access_secret
SMS_SIGN_NAME=飞行汽车
SMS_TEMPLATE_CODE=SMS_000001

# 高德地图
AMAP_KEY=your_amap_key

# 对象存储
OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY=your_oss_key
OSS_ACCESS_SECRET=your_oss_secret
OSS_BUCKET=flying-car-platform

# 日志配置
LOG_LEVEL=info
LOG_DIR=logs
```

## 4. Docker 部署

### 4.1 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - backend_logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network

  admin-frontend:
    build:
      context: ./admin-frontend
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  mobile-frontend:
    build:
      context: ./mobile-frontend
      dockerfile: Dockerfile
    ports:
      - "8081:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-root123456}
      MYSQL_DATABASE: flying_car_platform
      MYSQL_CHARSET: utf8mb4
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mysql_data:
  redis_data:
  backend_logs:

networks:
  app-network:
    driver: bridge
```

### 4.2 后端 Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/app.js"]
```

### 4.3 前端 Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 5. 生产部署

### 5.1 Kubernetes 部署（推荐）

#### 5.1.1 命名空间
```bash
kubectl create namespace flying-car
```

#### 5.1.2 配置 Secret
```bash
kubectl create secret generic app-secrets \
  --namespace flying-car \
  --from-literal=db-password=your_db_password \
  --from-literal=jwt-secret=your_jwt_secret \
  --from-literal=redis-password=your_redis_password
```

#### 5.1.3 部署后端服务

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: flying-car
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: registry.example.com/flying-car/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: flying-car
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: flying-car
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 5.2 Nginx 反向代理

```nginx
upstream backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.flyingcar.example.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 限流
        limit_req zone=api burst=20 nodelay;
    }

    # WebSocket 代理
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.flyingcar.example.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    root /var/www/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 6. CI/CD 流水线

### 6.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install and test backend
        working-directory: ./backend
        run: |
          npm ci
          npm test
      - name: Build admin frontend
        working-directory: ./admin-frontend
        run: |
          npm ci
          npm run build
      - name: Build mobile frontend
        working-directory: ./mobile-frontend
        run: |
          npm ci
          npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: |
          docker build -t backend ./backend
          docker build -t admin-frontend ./admin-frontend
          docker build -t mobile-frontend ./mobile-frontend
      - name: Deploy to server
        run: echo "Deploy to production server"
```

## 7. 监控与告警

### 7.1 健康检查端点

```
GET /health     # 服务健康状态
GET /ready      # 服务就绪状态
GET /metrics    # Prometheus 指标
```

### 7.2 监控指标
- 请求响应时间 (P50, P95, P99)
- 请求错误率
- CPU / 内存使用率
- 数据库连接池状态
- Redis 连接状态
- 在线 WebSocket 连接数
- 业务指标（订单量、支付成功率等）

### 7.3 告警规则
| 告警名称 | 条件 | 级别 |
|----------|------|------|
| 服务不可用 | 健康检查失败 > 3次 | Critical |
| 高错误率 | 5xx 错误 > 5%/分钟 | Critical |
| 高延迟 | P99 > 500ms | Warning |
| 高 CPU | CPU > 80% 持续 5分钟 | Warning |
| 高内存 | 内存 > 85% | Warning |
| 数据库连接池满 | 可用连接 = 0 | Critical |
