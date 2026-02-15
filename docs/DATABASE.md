# 数据库设计文档

## 数据库概述

- **数据库名称**: order_system
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **存储引擎**: InnoDB

## ER图关系

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│  users  │──┬──>│  orders  │──┬──>│order_   │
└─────────┘  │   └──────────┘  │   │items    │
             │                  │   └─────────┘
             │                  │        │
             │   ┌──────────┐   │        │
             ├──>│ reviews  │<──┘        │
             │   └──────────┘            │
             │        │                  │
             │   ┌──────────┐            │
             └──>│addresses │            │
                 └──────────┘            │
                                         │
┌───────────┐                            │
│categories │                            │
└───────────┘                            │
      │                                  │
      │      ┌────────┐                 │
      └─────>│ dishes │<────────────────┘
             └────────┘

┌────────┐
│ admins │
└────────┘
```

## 数据表详细设计

### 1. users (用户表)

存储微信用户信息。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| openid | VARCHAR | 100 | 是 | - | UNIQUE | 微信openid |
| nickname | VARCHAR | 100 | 否 | NULL | - | 昵称 |
| avatar | VARCHAR | 255 | 否 | NULL | - | 头像URL |
| phone | VARCHAR | 20 | 否 | NULL | INDEX | 手机号 |
| status | TINYINT | - | 否 | 1 | INDEX | 状态: 1正常 0禁用 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

**关联关系**:
- 一对多: orders (用户的订单)
- 一对多: reviews (用户的评价)
- 一对多: addresses (用户的地址)

### 2. admins (管理员表)

存储后台管理员账号。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| username | VARCHAR | 50 | 是 | - | UNIQUE | 用户名 |
| password | VARCHAR | 255 | 是 | - | - | 密码hash |
| nickname | VARCHAR | 100 | 否 | NULL | - | 昵称 |
| status | TINYINT | - | 否 | 1 | INDEX | 状态: 1正常 0禁用 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

### 3. categories (分类表)

菜品分类，支持多级分类。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| name | VARCHAR | 50 | 是 | - | - | 分类名称 |
| icon | VARCHAR | 255 | 否 | NULL | - | 图标URL |
| sort | INT | - | 否 | 0 | INDEX | 排序 |
| parent_id | INT UNSIGNED | - | 否 | 0 | INDEX | 父分类ID, 0表示顶级 |
| status | TINYINT | - | 否 | 1 | INDEX | 状态: 1启用 0禁用 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

**关联关系**:
- 一对多: dishes (分类下的菜品)

### 4. dishes (菜品表)

菜品信息，支持软删除。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| name | VARCHAR | 100 | 是 | - | - | 菜品名称 |
| category_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 分类ID |
| price | DECIMAL | 10,2 | 是 | - | - | 价格 |
| description | TEXT | - | 否 | NULL | - | 描述 |
| images | JSON | - | 否 | NULL | - | 图片JSON数组 |
| stock | INT | - | 否 | 999 | - | 库存 |
| sales | INT | - | 否 | 0 | - | 销量 |
| rating | DECIMAL | 3,2 | 否 | 5.00 | - | 平均评分 |
| status | TINYINT | - | 否 | 1 | INDEX | 状态: 1上架 0下架 |
| is_recommended | TINYINT | - | 否 | 0 | INDEX | 是否推荐: 1是 0否 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | TIMESTAMP | - | 否 | NULL | INDEX | 软删除时间 |

**关联关系**:
- 多对一: category (所属分类)
- 一对多: order_items (订单详情)
- 一对多: reviews (菜品评价)

### 5. orders (订单表)

用户订单主表。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| order_no | VARCHAR | 32 | 是 | - | UNIQUE | 订单号 |
| user_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 用户ID |
| total_amount | DECIMAL | 10,2 | 是 | - | - | 总金额 |
| delivery_date | DATE | - | 是 | - | INDEX | 配送日期 |
| delivery_address | TEXT | - | 否 | NULL | - | 配送地址 |
| status | TINYINT | - | 否 | 1 | INDEX | 订单状态 |
| remark | TEXT | - | 否 | NULL | - | 备注 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | INDEX | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

**订单状态枚举**:
- 1: 待处理
- 2: 已接单
- 3: 配送中
- 4: 已完成
- 5: 已取消

**关联关系**:
- 多对一: user (订单所属用户)
- 一对多: order_items (订单详情)
- 一对多: reviews (订单评价)

### 6. order_items (订单详情表)

订单中的具体菜品项。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| order_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 订单ID |
| dish_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 菜品ID |
| dish_name | VARCHAR | 100 | 是 | - | - | 菜品名称快照 |
| price | DECIMAL | 10,2 | 是 | - | - | 价格快照 |
| quantity | INT | - | 是 | - | - | 数量 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |

**关联关系**:
- 多对一: order (所属订单)
- 多对一: dish (关联菜品)

### 7. reviews (评价表)

用户对菜品的评价。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| user_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 用户ID |
| dish_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 菜品ID |
| order_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 订单ID |
| rating | TINYINT | - | 是 | - | - | 评分 1-5 |
| content | TEXT | - | 否 | NULL | - | 评价内容 |
| images | JSON | - | 否 | NULL | - | 图片JSON数组 |
| reply | TEXT | - | 否 | NULL | - | 商家回复 |
| likes | INT | - | 否 | 0 | - | 点赞数 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | INDEX | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

**关联关系**:
- 多对一: user (评价用户)
- 多对一: dish (评价菜品)
- 多对一: order (关联订单)

### 8. addresses (收货地址表)

用户收货地址。

| 字段名 | 类型 | 长度 | 必填 | 默认值 | 索引 | 说明 |
|--------|------|------|------|--------|------|------|
| id | INT UNSIGNED | - | 是 | AUTO_INCREMENT | PRIMARY | 主键 |
| user_id | INT UNSIGNED | - | 是 | - | INDEX, FK | 用户ID |
| name | VARCHAR | 50 | 是 | - | - | 联系人 |
| phone | VARCHAR | 20 | 是 | - | - | 电话 |
| address | TEXT | - | 是 | - | - | 详细地址 |
| is_default | TINYINT | - | 否 | 0 | INDEX | 是否默认: 1是 0否 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

**关联关系**:
- 多对一: user (地址所属用户)

## 索引说明

### 主键索引
所有表都有自增主键 `id`

### 唯一索引
- `users.openid` - 保证微信用户唯一性
- `admins.username` - 保证管理员用户名唯一性
- `orders.order_no` - 保证订单号唯一性

### 普通索引
- `users`: openid, phone, status
- `admins`: username, status
- `categories`: parent_id, status, sort
- `dishes`: category_id, status, is_recommended, deleted_at
- `orders`: order_no, user_id, status, delivery_date, created_at
- `order_items`: order_id, dish_id
- `reviews`: user_id, dish_id, order_id, created_at
- `addresses`: user_id, is_default

### 外键约束
- `dishes.category_id` -> `categories.id` (CASCADE)
- `orders.user_id` -> `users.id` (CASCADE)
- `order_items.order_id` -> `orders.id` (CASCADE)
- `order_items.dish_id` -> `dishes.id` (CASCADE)
- `reviews.user_id` -> `users.id` (CASCADE)
- `reviews.dish_id` -> `dishes.id` (CASCADE)
- `reviews.order_id` -> `orders.id` (CASCADE)
- `addresses.user_id` -> `users.id` (CASCADE)

## 数据安全

### 软删除
- `dishes` 表使用软删除机制，通过 `deleted_at` 字段标记删除

### 密码加密
- `admins.password` 使用 BCrypt 加密存储

### 数据快照
- `order_items` 保存菜品名称和价格快照，防止菜品修改影响历史订单

## 性能优化

1. **适当的索引**: 为常用查询字段添加索引
2. **JSON字段**: images 使用JSON存储，便于扩展
3. **数据分离**: 订单详情独立表，避免主表过大
4. **级联删除**: 使用外键级联删除保证数据一致性

## 初始化脚本

建表脚本位置: `/database/migrations/001_create_tables.sql`
测试数据位置: `/database/seeds/001_test_data.sql`

执行顺序:
1. 先执行建表脚本创建所有表
2. 再执行种子数据脚本插入测试数据
