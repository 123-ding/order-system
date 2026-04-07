# 飞行汽车运营平台 - API 接口设计文档

## 1. API 设计规范

### 1.1 基础规范
- **协议**: HTTPS
- **基础路径**: `/api/v1`
- **数据格式**: JSON
- **认证方式**: JWT Bearer Token
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### 1.2 统一响应格式

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": "2026-04-07T02:26:00.000Z"
}
```

**分页响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": "2026-04-07T02:26:00.000Z"
}
```

**错误响应：**
```json
{
  "code": 40001,
  "message": "参数错误：手机号格式不正确",
  "errors": [
    { "field": "phone", "message": "手机号格式不正确" }
  ],
  "timestamp": "2026-04-07T02:26:00.000Z"
}
```

### 1.3 错误码定义

| 错误码范围 | 说明 |
|-----------|------|
| 0 | 成功 |
| 40000-40099 | 参数错误 |
| 40100-40199 | 认证错误 |
| 40300-40399 | 权限错误 |
| 40400-40499 | 资源不存在 |
| 40900-40999 | 业务冲突 |
| 50000-50099 | 服务器错误 |

### 1.4 认证说明

**获取 Token：**
登录成功后返回 `accessToken` 和 `refreshToken`。

**使用 Token：**
```
Authorization: Bearer <accessToken>
```

**刷新 Token：**
`accessToken` 有效期 2 小时，`refreshToken` 有效期 30 天。

---

## 2. 乘客端 API

### 2.1 认证模块

#### 2.1.1 发送短信验证码
```
POST /api/v1/auth/sms/send
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "type": "login"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expireIn": 300
  }
}
```

#### 2.1.2 手机号登录/注册
```
POST /api/v1/auth/phone/login
```

**请求参数：**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 7200,
    "user": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "138****8000",
      "nickname": "用户001",
      "avatar": null,
      "idVerified": false,
      "memberLevel": 1
    }
  }
}
```

#### 2.1.3 微信登录
```
POST /api/v1/auth/wechat/login
```

**请求参数：**
```json
{
  "code": "wx_auth_code_xxx"
}
```

#### 2.1.4 刷新 Token
```
POST /api/v1/auth/token/refresh
```

**请求参数：**
```json
{
  "refreshToken": "eyJ..."
}
```

#### 2.1.5 实名认证
```
POST /api/v1/auth/verify/identity
```

**请求参数：**
```json
{
  "realName": "张三",
  "idCard": "110101199001011234",
  "faceImage": "base64_encoded_image"
}
```

### 2.2 航线模块

#### 2.2.1 获取附近起降点
```
GET /api/v1/vertiports/nearby?latitude=39.9042&longitude=116.4074&radius=10
```

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "国贸CBD起降场",
      "code": "VP001",
      "address": "北京市朝阳区国贸CBD",
      "latitude": 39.9087,
      "longitude": 116.4605,
      "distance": 5.2,
      "availableSlots": 3,
      "status": 1,
      "imageUrl": "https://oss.example.com/vertiports/vp001.jpg"
    }
  ]
}
```

#### 2.2.2 搜索航线
```
GET /api/v1/routes/search?departureId=1&arrivalId=2&date=2026-04-08
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "route": {
      "id": 1,
      "routeCode": "RT001",
      "name": "国贸CBD - 首都机场",
      "distance": 25.5,
      "estimatedDuration": 15,
      "basePrice": 299.00,
      "departure": {
        "id": 1,
        "name": "国贸CBD起降场",
        "latitude": 39.9087,
        "longitude": 116.4605
      },
      "arrival": {
        "id": 2,
        "name": "首都机场起降场",
        "latitude": 40.0799,
        "longitude": 116.6031
      }
    },
    "schedules": [
      {
        "id": 1,
        "flightNo": "FC1001",
        "departureTime": "08:00",
        "arrivalTime": "08:15",
        "availableSeats": 3,
        "price": 299.00,
        "surgeRate": 1.0
      },
      {
        "id": 2,
        "flightNo": "FC1002",
        "departureTime": "08:30",
        "arrivalTime": "08:45",
        "availableSeats": 1,
        "price": 359.00,
        "surgeRate": 1.2
      }
    ]
  }
}
```

#### 2.2.3 获取航线详情
```
GET /api/v1/routes/:routeId
```

#### 2.2.4 获取热门航线
```
GET /api/v1/routes/popular?city=北京&limit=10
```

### 2.3 订单模块

#### 2.3.1 创建订单
```
POST /api/v1/orders
```

**请求参数：**
```json
{
  "routeId": 1,
  "scheduleId": 1,
  "flightDate": "2026-04-08",
  "passengerCount": 2,
  "passengers": [
    {
      "name": "张三",
      "idCard": "110101199001011234",
      "phone": "13800138000",
      "isPrimary": true
    },
    {
      "name": "李四",
      "idCard": "110101199002022345",
      "phone": "13900139000",
      "isPrimary": false
    }
  ],
  "luggageWeight": 5.0,
  "seatPreference": "window",
  "specialRequirements": "需要儿童座椅",
  "couponId": null
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "orderId": 1001,
    "orderNo": "FC20260408001001",
    "status": 1,
    "statusText": "待确认",
    "route": {
      "name": "国贸CBD - 首都机场",
      "departure": "国贸CBD起降场",
      "arrival": "首都机场起降场"
    },
    "flightDate": "2026-04-08",
    "scheduledDeparture": "2026-04-08T08:00:00+08:00",
    "scheduledArrival": "2026-04-08T08:15:00+08:00",
    "priceDetail": {
      "basePrice": 598.00,
      "surgeAmount": 0,
      "insuranceFee": 20.00,
      "serviceFee": 29.90,
      "discountAmount": 0,
      "totalPrice": 647.90
    },
    "paymentDeadline": "2026-04-08T07:30:00+08:00"
  }
}
```

#### 2.3.2 获取订单列表
```
GET /api/v1/orders?status=all&page=1&pageSize=20
```

#### 2.3.3 获取订单详情
```
GET /api/v1/orders/:orderId
```

#### 2.3.4 取消订单
```
POST /api/v1/orders/:orderId/cancel
```

**请求参数：**
```json
{
  "reason": "行程变更"
}
```

#### 2.3.5 实时追踪航班
```
GET /api/v1/orders/:orderId/tracking
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "orderId": 1001,
    "status": 4,
    "statusText": "飞行中",
    "vehicle": {
      "registrationNo": "京A-FC001",
      "model": "AeroCity X1"
    },
    "pilot": {
      "name": "王飞行员",
      "rating": 4.9
    },
    "currentPosition": {
      "latitude": 39.9500,
      "longitude": 116.5200,
      "altitude": 300,
      "speed": 180,
      "heading": 35
    },
    "progress": 65,
    "estimatedArrival": "2026-04-08T08:13:00+08:00",
    "remainingDistance": 8.9,
    "remainingTime": 3
  }
}
```

### 2.4 支付模块

#### 2.4.1 创建支付
```
POST /api/v1/payments/create
```

**请求参数：**
```json
{
  "orderId": 1001,
  "paymentMethod": "wechat"
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "paymentNo": "PAY20260408001001",
    "amount": 647.90,
    "wechatPayParams": {
      "appId": "wx...",
      "timeStamp": "1712455200",
      "nonceStr": "xxx",
      "package": "prepay_id=xxx",
      "signType": "RSA",
      "paySign": "xxx"
    }
  }
}
```

#### 2.4.2 支付回调 (微信)
```
POST /api/v1/payments/wechat/callback
```

#### 2.4.3 查询支付状态
```
GET /api/v1/payments/:paymentNo/status
```

#### 2.4.4 申请退款
```
POST /api/v1/payments/:paymentNo/refund
```

### 2.5 评价模块

#### 2.5.1 提交评价
```
POST /api/v1/reviews
```

**请求参数：**
```json
{
  "orderId": 1001,
  "overallRating": 5,
  "safetyRating": 5,
  "comfortRating": 4,
  "punctualityRating": 5,
  "serviceRating": 4,
  "content": "飞行很平稳，服务很好！",
  "images": ["base64_image1", "base64_image2"],
  "isAnonymous": false
}
```

#### 2.5.2 获取航线评价
```
GET /api/v1/reviews/route/:routeId?page=1&pageSize=20
```

### 2.6 用户模块

#### 2.6.1 获取用户信息
```
GET /api/v1/user/profile
```

#### 2.6.2 更新用户信息
```
PUT /api/v1/user/profile
```

#### 2.6.3 管理常用地址
```
GET /api/v1/user/addresses
POST /api/v1/user/addresses
PUT /api/v1/user/addresses/:addressId
DELETE /api/v1/user/addresses/:addressId
```

#### 2.6.4 管理紧急联系人
```
GET /api/v1/user/emergency-contacts
POST /api/v1/user/emergency-contacts
PUT /api/v1/user/emergency-contacts/:contactId
DELETE /api/v1/user/emergency-contacts/:contactId
```

#### 2.6.5 获取用户优惠券
```
GET /api/v1/user/coupons?status=1
```

#### 2.6.6 飞行里程与统计
```
GET /api/v1/user/flight-stats
```

#### 2.6.7 消息通知
```
GET /api/v1/user/notifications?page=1&pageSize=20
PUT /api/v1/user/notifications/:notificationId/read
PUT /api/v1/user/notifications/read-all
```

---

## 3. 飞行员端 API

### 3.1 飞行员认证

#### 3.1.1 飞行员登录
```
POST /api/v1/pilot/auth/login
```

**请求参数：**
```json
{
  "phone": "13800138001",
  "password": "hashed_password"
}
```

### 3.2 任务管理

#### 3.2.1 获取今日任务列表
```
GET /api/v1/pilot/tasks/today
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "tasks": [
      {
        "orderId": 1001,
        "orderNo": "FC20260408001001",
        "flightNo": "FC1001",
        "route": {
          "departure": "国贸CBD起降场",
          "arrival": "首都机场起降场"
        },
        "scheduledDeparture": "2026-04-08T08:00:00+08:00",
        "passengerCount": 2,
        "vehicle": {
          "registrationNo": "京A-FC001",
          "model": "AeroCity X1",
          "battery": 95
        },
        "status": "pending"
      }
    ],
    "summary": {
      "totalTasks": 8,
      "completedTasks": 3,
      "remainingTasks": 5,
      "totalFlightHours": 2.5
    }
  }
}
```

#### 3.2.2 接受/拒绝任务
```
POST /api/v1/pilot/tasks/:orderId/accept
POST /api/v1/pilot/tasks/:orderId/reject
```

#### 3.2.3 更新任务状态
```
POST /api/v1/pilot/tasks/:orderId/status
```

**请求参数：**
```json
{
  "status": "preflight_check_completed",
  "checklist": {
    "battery": true,
    "navigation": true,
    "communication": true,
    "structure": true,
    "weather": true
  }
}
```

#### 3.2.4 上报异常
```
POST /api/v1/pilot/tasks/:orderId/anomaly
```

**请求参数：**
```json
{
  "type": "weather",
  "severity": "warning",
  "description": "起降点附近能见度降低",
  "latitude": 39.9087,
  "longitude": 116.4605
}
```

### 3.3 飞行辅助

#### 3.3.1 获取航线导航数据
```
GET /api/v1/pilot/navigation/:routeId
```

#### 3.3.2 获取实时气象
```
GET /api/v1/pilot/weather?latitude=39.9042&longitude=116.4074
```

#### 3.3.3 上报实时位置
```
POST /api/v1/pilot/position
```

**请求参数：**
```json
{
  "orderId": 1001,
  "latitude": 39.9500,
  "longitude": 116.5200,
  "altitude": 300,
  "speed": 180,
  "heading": 35,
  "battery": 82
}
```

### 3.4 排班与收益

#### 3.4.1 获取排班信息
```
GET /api/v1/pilot/schedule?month=2026-04
```

#### 3.4.2 获取收益统计
```
GET /api/v1/pilot/earnings?period=month&date=2026-04
```

---

## 4. 管理后台 API

### 4.1 管理员认证

```
POST /api/v1/admin/auth/login
POST /api/v1/admin/auth/logout
```

### 4.2 仪表盘

#### 4.2.1 运营概览
```
GET /api/v1/admin/dashboard/overview
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "today": {
      "orders": 156,
      "revenue": 45680.00,
      "flights": 142,
      "activeVehicles": 28,
      "onlinePilots": 35,
      "activeUsers": 1256
    },
    "comparison": {
      "ordersGrowth": 12.5,
      "revenueGrowth": 8.3,
      "flightsGrowth": 10.1
    },
    "alerts": [
      {
        "level": "warning",
        "message": "车辆 京A-FC008 电量低于 20%",
        "time": "2026-04-07T14:23:00+08:00"
      }
    ]
  }
}
```

#### 4.2.2 实时车辆位置
```
GET /api/v1/admin/dashboard/vehicles/realtime
```

#### 4.2.3 趋势统计
```
GET /api/v1/admin/dashboard/trends?period=7d&metrics=orders,revenue,flights
```

### 4.3 订单管理

```
GET    /api/v1/admin/orders                     # 订单列表(支持筛选)
GET    /api/v1/admin/orders/:orderId             # 订单详情
PUT    /api/v1/admin/orders/:orderId/status      # 更新订单状态
POST   /api/v1/admin/orders/:orderId/refund      # 审批退款
GET    /api/v1/admin/orders/export               # 导出订单数据
```

### 4.4 航线管理

```
GET    /api/v1/admin/vertiports                  # 起降点列表
POST   /api/v1/admin/vertiports                  # 创建起降点
PUT    /api/v1/admin/vertiports/:id              # 更新起降点
DELETE /api/v1/admin/vertiports/:id              # 删除起降点

GET    /api/v1/admin/routes                      # 航线列表
POST   /api/v1/admin/routes                      # 创建航线
PUT    /api/v1/admin/routes/:id                  # 更新航线
DELETE /api/v1/admin/routes/:id                  # 删除航线

GET    /api/v1/admin/routes/:id/schedules        # 航班时刻表
POST   /api/v1/admin/routes/:id/schedules        # 添加时刻
PUT    /api/v1/admin/schedules/:id               # 更新时刻
DELETE /api/v1/admin/schedules/:id               # 删除时刻
```

### 4.5 车辆管理

```
GET    /api/v1/admin/vehicles                    # 车辆列表
POST   /api/v1/admin/vehicles                    # 添加车辆
GET    /api/v1/admin/vehicles/:id                # 车辆详情
PUT    /api/v1/admin/vehicles/:id                # 更新车辆
DELETE /api/v1/admin/vehicles/:id                # 删除车辆
GET    /api/v1/admin/vehicles/:id/logs           # 车辆飞行日志
GET    /api/v1/admin/vehicles/:id/maintenance    # 车辆维保记录
POST   /api/v1/admin/vehicles/:id/maintenance    # 创建维保记录
```

### 4.6 飞行员管理

```
GET    /api/v1/admin/pilots                      # 飞行员列表
POST   /api/v1/admin/pilots                      # 添加飞行员
GET    /api/v1/admin/pilots/:id                  # 飞行员详情
PUT    /api/v1/admin/pilots/:id                  # 更新飞行员
PUT    /api/v1/admin/pilots/:id/status           # 审核/状态变更
GET    /api/v1/admin/pilots/:id/schedule         # 飞行员排班
POST   /api/v1/admin/pilots/:id/schedule         # 创建排班
GET    /api/v1/admin/pilots/:id/performance      # 飞行员绩效
```

### 4.7 用户管理

```
GET    /api/v1/admin/users                       # 用户列表
GET    /api/v1/admin/users/:id                   # 用户详情
PUT    /api/v1/admin/users/:id/status            # 更新用户状态
GET    /api/v1/admin/users/:id/orders            # 用户订单
```

### 4.8 空域管理

```
GET    /api/v1/admin/airspaces                   # 空域列表
POST   /api/v1/admin/airspaces                   # 创建空域
PUT    /api/v1/admin/airspaces/:id               # 更新空域
DELETE /api/v1/admin/airspaces/:id               # 删除空域
GET    /api/v1/admin/airspaces/map               # 空域地图数据
POST   /api/v1/admin/airspaces/conflict-check    # 冲突检测
```

### 4.9 财务管理

```
GET    /api/v1/admin/finance/revenue             # 收入统计
GET    /api/v1/admin/finance/settlements          # 结算列表
POST   /api/v1/admin/finance/settlements/:id/pay # 执行结算
GET    /api/v1/admin/finance/invoices             # 发票管理
```

### 4.10 优惠券管理

```
GET    /api/v1/admin/coupons                     # 优惠券列表
POST   /api/v1/admin/coupons                     # 创建优惠券
PUT    /api/v1/admin/coupons/:id                 # 更新优惠券
POST   /api/v1/admin/coupons/:id/distribute      # 分发优惠券
```

### 4.11 评价管理

```
GET    /api/v1/admin/reviews                     # 评价列表
PUT    /api/v1/admin/reviews/:id/reply           # 回复评价
PUT    /api/v1/admin/reviews/:id/status          # 隐藏/显示评价
```

### 4.12 系统管理

```
GET    /api/v1/admin/system/admins               # 管理员列表
POST   /api/v1/admin/system/admins               # 添加管理员
PUT    /api/v1/admin/system/admins/:id           # 更新管理员
DELETE /api/v1/admin/system/admins/:id           # 删除管理员
GET    /api/v1/admin/system/logs                 # 操作日志
GET    /api/v1/admin/system/config               # 系统配置
PUT    /api/v1/admin/system/config               # 更新配置
```

---

## 5. WebSocket API

### 5.1 实时位置推送

**连接：**
```
ws://api.example.com/ws/tracking?token=<accessToken>
```

**订阅航班追踪：**
```json
{
  "event": "subscribe",
  "channel": "flight_tracking",
  "data": { "orderId": 1001 }
}
```

**位置更新推送：**
```json
{
  "event": "position_update",
  "data": {
    "orderId": 1001,
    "latitude": 39.9500,
    "longitude": 116.5200,
    "altitude": 300,
    "speed": 180,
    "heading": 35,
    "battery": 82,
    "timestamp": "2026-04-08T08:10:00+08:00"
  }
}
```

### 5.2 订单状态推送

```json
{
  "event": "order_status_changed",
  "data": {
    "orderId": 1001,
    "orderNo": "FC20260408001001",
    "oldStatus": 2,
    "newStatus": 3,
    "statusText": "待上车",
    "message": "您的飞行汽车已到达，请前往 3 号停机位",
    "timestamp": "2026-04-08T07:55:00+08:00"
  }
}
```

### 5.3 告警推送 (管理后台)

```json
{
  "event": "alert",
  "data": {
    "level": "critical",
    "type": "vehicle_low_battery",
    "vehicleId": 8,
    "registrationNo": "京A-FC008",
    "battery": 15,
    "message": "车辆 京A-FC008 电量严重不足(15%)，请立即安排降落充电",
    "timestamp": "2026-04-07T14:23:00+08:00"
  }
}
```

---

## 6. 第三方集成 API

### 6.1 微信公众号
- 微信 OAuth 2.0 授权
- 微信支付 (JSAPI)
- 模板消息推送
- 订阅消息推送

### 6.2 短信服务
- 阿里云短信 / 腾讯云短信
- 验证码发送
- 订单通知发送

### 6.3 地图服务
- 高德地图 Web API
- 逆地理编码
- 路径规划
- 天气查询

### 6.4 实名认证
- 身份证 OCR 识别
- 人脸识别比对
- 实名认证验证

### 6.5 气象数据
- 实时气象数据接口
- 航空气象 METAR/TAF 数据

---

## 7. API 安全

### 7.1 认证与授权
- JWT Token 认证，支持 Token 刷新
- RBAC 角色权限控制
- API 级别权限校验

### 7.2 安全防护
- 接口限流：单 IP 60 次/分钟，单用户 120 次/分钟
- SQL 注入防护
- XSS 防护
- CORS 跨域策略
- 请求签名验证（敏感接口）
- HTTPS 强制

### 7.3 数据安全
- 敏感数据加密传输
- 手机号/身份证脱敏返回
- 日志脱敏处理
