# 海上物流配送平台 API 接口文档

**版本**：v1.0.0  
**基础路径**：`/api/v1`  
**数据格式**：JSON  
**字符编码**：UTF-8

---

## 目录

1. [认证接口](#1-认证接口)
2. [订单接口](#2-订单接口)
3. [船舶接口](#3-船舶接口)
4. [航线接口](#4-航线接口)
5. [货物接口](#5-货物接口)
6. [用户接口](#6-用户接口)
7. [通用说明](#7-通用说明)

---

## 7. 通用说明

### 认证方式

受保护的接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

### 统一响应格式

**成功响应**

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**失败响应**

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 通用错误码

| 错误码 | 说明 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未授权（Token 无效或过期） |
| 403    | 权限不足 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |

### 分页参数

分页接口统一使用以下查询参数：

| 参数     | 类型 | 默认值 | 说明 |
|----------|------|--------|------|
| page     | int  | 1      | 页码 |
| pageSize | int  | 10     | 每页条数（最大 100） |

---

## 1. 认证接口

### 1.1 用户登录

**POST** `/api/v1/auth/login`

**请求体**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@maritime.com",
      "role": "admin",
      "phone": "13800000001"
    }
  }
}
```

**错误示例**

```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

### 1.2 刷新 Token

**POST** `/api/v1/auth/refresh`

**请求头**：需携带有效 Token

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

### 1.3 退出登录

**POST** `/api/v1/auth/logout`

**请求头**：需携带有效 Token

**响应示例**

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

## 2. 订单接口

### 2.1 获取订单列表

**GET** `/api/v1/orders`

**权限**：admin / operator 可查看全部；customer 仅查看自己的订单

**查询参数**

| 参数        | 类型   | 必填 | 说明 |
|-------------|--------|------|------|
| page        | int    | 否   | 页码，默认 1 |
| pageSize    | int    | 否   | 每页条数，默认 10 |
| status      | string | 否   | 订单状态筛选 |
| order_no    | string | 否   | 订单号模糊搜索 |
| origin_port | string | 否   | 起运港筛选 |
| dest_port   | string | 否   | 目的港筛选 |
| start_date  | string | 否   | 创建时间起（YYYY-MM-DD） |
| end_date    | string | 否   | 创建时间止（YYYY-MM-DD） |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 128,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "order_no": "ORD20240101001",
        "status": "completed",
        "origin_port": "上海港",
        "destination_port": "广州港",
        "cargo_type": "集装箱货物",
        "cargo_weight": 1200.00,
        "freight_cost": 144000.00,
        "estimated_departure": "2024-01-05",
        "estimated_arrival": "2024-01-08",
        "customer": {
          "id": 3,
          "username": "customer1"
        },
        "vessel": {
          "id": 1,
          "vessel_name": "东方之星"
        },
        "created_at": "2024-01-01T08:00:00Z"
      }
    ]
  }
}
```

---

### 2.2 获取订单详情

**GET** `/api/v1/orders/:id`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id   | int  | 订单 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "ORD20240101001",
    "status": "completed",
    "origin_port": "上海港",
    "destination_port": "广州港",
    "cargo_type": "集装箱货物",
    "cargo_weight": 1200.00,
    "cargo_volume": 1500.00,
    "freight_cost": 144000.00,
    "estimated_departure": "2024-01-05",
    "estimated_arrival": "2024-01-08",
    "actual_departure": "2024-01-05",
    "actual_arrival": "2024-01-08",
    "notes": "",
    "customer": {
      "id": 3,
      "username": "customer1",
      "phone": "13900000001"
    },
    "vessel": {
      "id": 1,
      "vessel_name": "东方之星",
      "vessel_type": "container"
    },
    "route": {
      "id": 1,
      "route_name": "沪穗线"
    },
    "cargo_list": [
      {
        "id": 1,
        "cargo_no": "CGO20240101001",
        "description": "电子元件-集成电路",
        "weight": 200.00,
        "status": "delivered"
      }
    ],
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": "2024-01-08T18:30:00Z"
  }
}
```

---

### 2.3 创建订单

**POST** `/api/v1/orders`

**权限**：operator / customer

**请求体**

```json
{
  "vessel_id": 1,
  "route_id": 1,
  "origin_port": "上海港",
  "destination_port": "广州港",
  "cargo_type": "集装箱货物",
  "cargo_weight": 1200.00,
  "cargo_volume": 1500.00,
  "estimated_departure": "2024-03-10",
  "estimated_arrival": "2024-03-13",
  "notes": "易碎品，请轻拿轻放"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "id": 11,
    "order_no": "ORD20240310011",
    "status": "pending",
    "freight_cost": 144000.00
  }
}
```

---

### 2.4 更新订单

**PUT** `/api/v1/orders/:id`

**权限**：admin / operator

**请求体**（仅传需要修改的字段）

```json
{
  "status": "confirmed",
  "vessel_id": 2,
  "freight_cost": 150000.00
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "订单更新成功",
  "data": {
    "id": 11,
    "status": "confirmed"
  }
}
```

---

### 2.5 取消订单

**POST** `/api/v1/orders/:id/cancel`

**权限**：admin / operator / 订单所属 customer（仅 pending 状态可取消）

**请求体**

```json
{
  "reason": "客户主动取消"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "订单已取消",
  "data": null
}
```

---

### 2.6 删除订单

**DELETE** `/api/v1/orders/:id`

**权限**：admin

**响应示例**

```json
{
  "code": 200,
  "message": "订单已删除",
  "data": null
}
```

---

## 3. 船舶接口

### 3.1 获取船舶列表

**GET** `/api/v1/vessels`

**查询参数**

| 参数        | 类型   | 必填 | 说明 |
|-------------|--------|------|------|
| page        | int    | 否   | 页码 |
| pageSize    | int    | 否   | 每页条数 |
| status      | string | 否   | 船舶状态（available/in_use/maintenance/retired） |
| vessel_type | string | 否   | 船舶类型 |
| keyword     | string | 否   | 船名/船号关键词搜索 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "vessel_name": "东方之星",
        "vessel_type": "container",
        "registration_no": "CN-SH-2021-001",
        "capacity_weight": 25000.00,
        "capacity_volume": 32000.00,
        "status": "available",
        "current_location": "上海港",
        "owner_name": "上海远洋运输公司"
      }
    ]
  }
}
```

---

### 3.2 获取船舶详情

**GET** `/api/v1/vessels/:id`

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "vessel_name": "东方之星",
    "vessel_type": "container",
    "registration_no": "CN-SH-2021-001",
    "capacity_weight": 25000.00,
    "capacity_volume": 32000.00,
    "status": "available",
    "current_location": "上海港",
    "owner_name": "上海远洋运输公司",
    "notes": "",
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": "2024-01-01T08:00:00Z"
  }
}
```

---

### 3.3 创建船舶

**POST** `/api/v1/vessels`

**权限**：admin / operator

**请求体**

```json
{
  "vessel_name": "新海轮",
  "vessel_type": "container",
  "registration_no": "CN-SH-2024-010",
  "capacity_weight": 30000.00,
  "capacity_volume": 38000.00,
  "current_location": "上海港",
  "owner_name": "上海航运有限公司",
  "notes": ""
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "船舶添加成功",
  "data": {
    "id": 6,
    "vessel_name": "新海轮",
    "registration_no": "CN-SH-2024-010"
  }
}
```

---

### 3.4 更新船舶信息

**PUT** `/api/v1/vessels/:id`

**权限**：admin / operator

**请求体**（仅传需要修改的字段）

```json
{
  "status": "maintenance",
  "current_location": "青岛港",
  "notes": "发动机大修，预计2024-03-01完成"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "船舶信息更新成功",
  "data": {
    "id": 1,
    "status": "maintenance"
  }
}
```

---

### 3.5 删除船舶

**DELETE** `/api/v1/vessels/:id`

**权限**：admin

> 存在关联订单的船舶不可删除，需先处理关联订单。

**响应示例**

```json
{
  "code": 200,
  "message": "船舶已删除",
  "data": null
}
```

---

## 4. 航线接口

### 4.1 获取航线列表

**GET** `/api/v1/routes`

**查询参数**

| 参数             | 类型   | 必填 | 说明 |
|------------------|--------|------|------|
| page             | int    | 否   | 页码 |
| pageSize         | int    | 否   | 每页条数 |
| status           | string | 否   | 航线状态（active/inactive） |
| origin_port      | string | 否   | 起运港筛选 |
| destination_port | string | 否   | 目的港筛选 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 6,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "route_name": "沪穗线",
        "origin_port": "上海港",
        "destination_port": "广州港",
        "distance_nm": 850.00,
        "estimated_days": 3,
        "freight_rate_per_ton": 120.00,
        "status": "active"
      }
    ]
  }
}
```

---

### 4.2 获取航线详情

**GET** `/api/v1/routes/:id`

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "route_name": "沪穗线",
    "origin_port": "上海港",
    "destination_port": "广州港",
    "distance_nm": 850.00,
    "estimated_days": 3,
    "freight_rate_per_ton": 120.00,
    "status": "active",
    "notes": "",
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": "2024-01-01T08:00:00Z"
  }
}
```

---

### 4.3 创建航线

**POST** `/api/v1/routes`

**权限**：admin / operator

**请求体**

```json
{
  "route_name": "沪厦线",
  "origin_port": "上海港",
  "destination_port": "厦门港",
  "distance_nm": 620.00,
  "estimated_days": 2,
  "freight_rate_per_ton": 100.00,
  "notes": ""
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "航线创建成功",
  "data": {
    "id": 7,
    "route_name": "沪厦线"
  }
}
```

---

### 4.4 更新航线

**PUT** `/api/v1/routes/:id`

**权限**：admin / operator

**请求体**（仅传需要修改的字段）

```json
{
  "freight_rate_per_ton": 130.00,
  "status": "inactive"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "航线更新成功",
  "data": {
    "id": 1,
    "freight_rate_per_ton": 130.00
  }
}
```

---

### 4.5 删除航线

**DELETE** `/api/v1/routes/:id`

**权限**：admin

**响应示例**

```json
{
  "code": 200,
  "message": "航线已删除",
  "data": null
}
```

---

## 5. 货物接口

### 5.1 获取货物列表

**GET** `/api/v1/cargo`

**查询参数**

| 参数       | 类型   | 必填 | 说明 |
|------------|--------|------|------|
| page       | int    | 否   | 页码 |
| pageSize   | int    | 否   | 每页条数 |
| order_id   | int    | 否   | 按订单 ID 筛选 |
| status     | string | 否   | 货物状态 |
| cargo_no   | string | 否   | 货物编号模糊搜索 |
| hazmat     | bool   | 否   | 是否危险品 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 11,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "cargo_no": "CGO20240101001",
        "order_id": 1,
        "order_no": "ORD20240101001",
        "description": "电子元件-集成电路",
        "cargo_type": "电子产品",
        "weight": 200.00,
        "volume": 250.00,
        "quantity": 500,
        "unit": "箱",
        "hazmat": false,
        "status": "delivered"
      }
    ]
  }
}
```

---

### 5.2 获取货物详情

**GET** `/api/v1/cargo/:id`

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "cargo_no": "CGO20240101001",
    "order_id": 1,
    "order_no": "ORD20240101001",
    "description": "电子元件-集成电路",
    "cargo_type": "电子产品",
    "weight": 200.00,
    "volume": 250.00,
    "quantity": 500,
    "unit": "箱",
    "packaging_type": "木箱",
    "hazmat": false,
    "temperature_required": false,
    "temperature_min": null,
    "temperature_max": null,
    "status": "delivered",
    "notes": "",
    "created_at": "2024-01-01T08:00:00Z"
  }
}
```

---

### 5.3 添加货物

**POST** `/api/v1/cargo`

**权限**：admin / operator

**请求体**

```json
{
  "order_id": 5,
  "description": "服装-男装T恤",
  "cargo_type": "纺织品",
  "weight": 300.00,
  "volume": 350.00,
  "quantity": 1000,
  "unit": "件",
  "packaging_type": "纸箱",
  "hazmat": false,
  "temperature_required": false,
  "notes": ""
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "货物添加成功",
  "data": {
    "id": 12,
    "cargo_no": "CGO20240125001"
  }
}
```

---

### 5.4 更新货物信息

**PUT** `/api/v1/cargo/:id`

**权限**：admin / operator

**请求体**（仅传需要修改的字段）

```json
{
  "status": "loaded",
  "notes": "已于2024-02-01完成装载"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "货物信息更新成功",
  "data": {
    "id": 12,
    "status": "loaded"
  }
}
```

---

### 5.5 删除货物

**DELETE** `/api/v1/cargo/:id`

**权限**：admin

**响应示例**

```json
{
  "code": 200,
  "message": "货物已删除",
  "data": null
}
```

---

## 6. 用户接口

### 6.1 获取用户列表

**GET** `/api/v1/users`

**权限**：admin

**查询参数**

| 参数     | 类型   | 必填 | 说明 |
|----------|--------|------|------|
| page     | int    | 否   | 页码 |
| pageSize | int    | 否   | 每页条数 |
| role     | string | 否   | 角色筛选（admin/operator/customer） |
| status   | string | 否   | 状态筛选（active/inactive） |
| keyword  | string | 否   | 用户名/邮箱/手机号关键词 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@maritime.com",
        "phone": "13800000001",
        "role": "admin",
        "status": "active",
        "created_at": "2024-01-01T08:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 获取用户详情

**GET** `/api/v1/users/:id`

**权限**：admin 或用户本人

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 3,
    "username": "customer1",
    "email": "customer1@example.com",
    "phone": "13900000001",
    "role": "customer",
    "status": "active",
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": "2024-01-01T08:00:00Z"
  }
}
```

---

### 6.3 创建用户

**POST** `/api/v1/users`

**权限**：admin

**请求体**

```json
{
  "username": "customer4",
  "email": "customer4@example.com",
  "password": "Secure@2024",
  "phone": "13900000004",
  "role": "customer"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": 6,
    "username": "customer4"
  }
}
```

---

### 6.4 更新用户信息

**PUT** `/api/v1/users/:id`

**权限**：admin 或用户本人（用户本人不可修改 role）

**请求体**（仅传需要修改的字段）

```json
{
  "email": "newemail@example.com",
  "phone": "13900000099"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "id": 3,
    "email": "newemail@example.com"
  }
}
```

---

### 6.5 修改密码

**POST** `/api/v1/users/:id/change-password`

**权限**：admin 或用户本人

**请求体**

```json
{
  "old_password": "123456",
  "new_password": "NewSecure@2024"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

### 6.6 禁用/启用用户

**POST** `/api/v1/users/:id/toggle-status`

**权限**：admin

**响应示例**

```json
{
  "code": 200,
  "message": "用户状态已更新",
  "data": {
    "id": 3,
    "status": "inactive"
  }
}
```

---

### 6.7 删除用户

**DELETE** `/api/v1/users/:id`

**权限**：admin

> 存在关联订单的用户不可删除。

**响应示例**

```json
{
  "code": 200,
  "message": "用户已删除",
  "data": null
}
```
