# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **返回格式**: JSON

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "errors": []
}
```

---

## 管理员API

### 认证相关

#### 1. 管理员登录
- **URL**: `/admin/login`
- **Method**: `POST`
- **Auth**: 否

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "nickname": "系统管理员"
    }
  }
}
```

#### 2. 退出登录
- **URL**: `/admin/logout`
- **Method**: `POST`
- **Auth**: 是

#### 3. 获取当前管理员信息
- **URL**: `/admin/profile`
- **Method**: `GET`
- **Auth**: 是

---

### 菜品管理

#### 1. 获取菜品列表
- **URL**: `/admin/dishes`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认10)
- `category_id`: 分类ID
- `keyword`: 搜索关键词
- `status`: 状态 (1上架/0下架)

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "宫保鸡丁",
        "category_id": 1,
        "price": "28.00",
        "description": "经典川菜",
        "images": ["/images/dishes/gongbao.jpg"],
        "stock": 100,
        "sales": 156,
        "rating": "4.80",
        "status": 1,
        "is_recommended": 1,
        "category": {
          "id": 1,
          "name": "热菜"
        }
      }
    ],
    "total": 16,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 2. 获取菜品详情
- **URL**: `/admin/dishes/:id`
- **Method**: `GET`
- **Auth**: 是

#### 3. 创建菜品
- **URL**: `/admin/dishes`
- **Method**: `POST`
- **Auth**: 是

**请求参数**:
```json
{
  "name": "新菜品",
  "category_id": 1,
  "price": 28.00,
  "description": "菜品描述",
  "images": ["/uploads/image1.jpg"],
  "stock": 100,
  "status": 1,
  "is_recommended": 0
}
```

#### 4. 更新菜品
- **URL**: `/admin/dishes/:id`
- **Method**: `PUT`
- **Auth**: 是

#### 5. 删除菜品
- **URL**: `/admin/dishes/:id`
- **Method**: `DELETE`
- **Auth**: 是

#### 6. 批量更新菜品状态
- **URL**: `/admin/dishes/batch/status`
- **Method**: `POST`
- **Auth**: 是

**请求参数**:
```json
{
  "ids": [1, 2, 3],
  "status": 1
}
```

---

### 分类管理

#### 1. 获取分类列表
- **URL**: `/admin/categories`
- **Method**: `GET`
- **Auth**: 是

#### 2. 创建分类
- **URL**: `/admin/categories`
- **Method**: `POST`
- **Auth**: 是

**请求参数**:
```json
{
  "name": "新分类",
  "icon": "/icons/category.png",
  "sort": 1,
  "parent_id": 0
}
```

#### 3. 更新分类
- **URL**: `/admin/categories/:id`
- **Method**: `PUT`
- **Auth**: 是

#### 4. 删除分类
- **URL**: `/admin/categories/:id`
- **Method**: `DELETE`
- **Auth**: 是

---

### 订单管理

#### 1. 获取订单列表
- **URL**: `/admin/orders`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 订单状态
- `startDate`: 开始日期
- `endDate`: 结束日期

**订单状态**:
- 1: 待处理
- 2: 已接单
- 3: 配送中
- 4: 已完成
- 5: 已取消

#### 2. 获取订单详情
- **URL**: `/admin/orders/:id`
- **Method**: `GET`
- **Auth**: 是

#### 3. 更新订单状态
- **URL**: `/admin/orders/:id/status`
- **Method**: `PUT`
- **Auth**: 是

**请求参数**:
```json
{
  "status": 2
}
```

---

### 评价管理

#### 1. 获取评价列表
- **URL**: `/admin/reviews`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `dish_id`: 菜品ID

#### 2. 回复评价
- **URL**: `/admin/reviews/:id/reply`
- **Method**: `PUT`
- **Auth**: 是

**请求参数**:
```json
{
  "reply": "感谢您的反馈！"
}
```

#### 3. 删除评价
- **URL**: `/admin/reviews/:id`
- **Method**: `DELETE`
- **Auth**: 是

---

### 用户管理

#### 1. 获取用户列表
- **URL**: `/admin/users`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `keyword`: 搜索关键词

#### 2. 获取用户详情
- **URL**: `/admin/users/:id`
- **Method**: `GET`
- **Auth**: 是

#### 3. 更新用户状态
- **URL**: `/admin/users/:id/status`
- **Method**: `PUT`
- **Auth**: 是

**请求参数**:
```json
{
  "status": 1
}
```

---

### 数据统计

#### 1. 概览统计
- **URL**: `/admin/statistics/overview`
- **Method**: `GET`
- **Auth**: 是

**成功响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "todayOrders": 25,
    "todaySales": 1580.00,
    "totalUsers": 358,
    "totalDishes": 45
  }
}
```

#### 2. 销售统计
- **URL**: `/admin/statistics/sales`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `days`: 统计天数 (默认7天)

---

### 文件上传

#### 1. 上传单张图片
- **URL**: `/admin/upload/image`
- **Method**: `POST`
- **Auth**: 是
- **Content-Type**: `multipart/form-data`

**请求参数**:
- `image`: 图片文件

**成功响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/image-1234567890.jpg",
    "filename": "image-1234567890.jpg"
  }
}
```

#### 2. 上传多张图片
- **URL**: `/admin/upload/images`
- **Method**: `POST`
- **Auth**: 是
- **Content-Type**: `multipart/form-data`

**请求参数**:
- `images`: 图片文件数组 (最多5张)

---

## 移动端API

### 认证相关

#### 1. 微信登录
- **URL**: `/mobile/auth/wechat`
- **Method**: `POST`
- **Auth**: 否

**请求参数**:
```json
{
  "code": "微信授权code"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://..."
    }
  }
}
```

#### 2. 获取用户信息
- **URL**: `/mobile/user/info`
- **Method**: `GET`
- **Auth**: 是

#### 3. 更新用户信息
- **URL**: `/mobile/user/info`
- **Method**: `PUT`
- **Auth**: 是

---

### 菜品相关

#### 1. 获取菜品列表
- **URL**: `/mobile/dishes`
- **Method**: `GET`
- **Auth**: 否

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `category_id`: 分类ID
- `keyword`: 搜索关键词
- `is_recommended`: 是否推荐 (1/0)

#### 2. 获取菜品详情
- **URL**: `/mobile/dishes/:id`
- **Method**: `GET`
- **Auth**: 否

#### 3. 获取分类列表
- **URL**: `/mobile/categories`
- **Method**: `GET`
- **Auth**: 否

---

### 订单相关

#### 1. 创建订单
- **URL**: `/mobile/orders`
- **Method**: `POST`
- **Auth**: 是

**请求参数**:
```json
{
  "items": [
    {
      "dish_id": 1,
      "quantity": 2
    },
    {
      "dish_id": 2,
      "quantity": 1
    }
  ],
  "delivery_date": "2024-02-20",
  "delivery_address": "北京市朝阳区xxx",
  "remark": "多加辣"
}
```

**成功响应**:
```json
{
  "code": 201,
  "message": "下单成功",
  "data": {
    "order_id": 123,
    "order_no": "ORD1708012345678"
  }
}
```

#### 2. 获取我的订单
- **URL**: `/mobile/orders`
- **Method**: `GET`
- **Auth**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 订单状态

#### 3. 获取订单详情
- **URL**: `/mobile/orders/:id`
- **Method**: `GET`
- **Auth**: 是

#### 4. 取消订单
- **URL**: `/mobile/orders/:id/cancel`
- **Method**: `PUT`
- **Auth**: 是

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证说明

需要认证的接口需要在请求头中携带JWT token:

```
Authorization: Bearer <token>
```

Token在登录成功后获取，有效期7天。

---

## 测试账号

**管理员账号**:
- 用户名: admin
- 密码: admin123

**移动端用户**:
通过微信授权登录自动创建
