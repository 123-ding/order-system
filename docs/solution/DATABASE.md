# 飞行汽车运营平台 - 数据库设计文档

## 1. 设计原则

- 使用 MySQL 8.0 InnoDB 存储引擎
- 所有表使用 UTF-8mb4 字符集
- 主键使用自增 BIGINT 类型
- 所有表包含 `created_at`、`updated_at` 时间戳字段
- 使用软删除（`deleted_at`）
- 金额字段使用 DECIMAL(10,2)
- 经纬度使用 DECIMAL(10,7)

## 2. ER 关系图

```
users ──1:N──> orders ──1:1──> payments
  │                │
  │                └──1:1──> reviews
  │
  └──1:N──> user_addresses

pilots ──1:N──> flight_logs
  │
  └──1:N──> pilot_schedules

vehicles ──1:N──> flight_logs
  │
  └──1:N──> maintenance_records

routes ──1:N──> route_schedules
  │
  └──1:N──> orders

vertiports ──1:N──> routes (departure)
  │
  └──1:N──> routes (arrival)
```

## 3. 表结构设计

### 3.1 用户表 (users)

```sql
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT '用户UUID',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(50) DEFAULT NULL COMMENT '身份证号(加密存储)',
  `id_verified` TINYINT DEFAULT 0 COMMENT '实名认证状态 0-未认证 1-已认证',
  `wx_openid` VARCHAR(100) DEFAULT NULL COMMENT '微信OpenID',
  `wx_unionid` VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
  `member_level` TINYINT DEFAULT 1 COMMENT '会员等级 1-普通 2-金卡 3-白金 4-钻石',
  `total_mileage` DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计飞行里程(km)',
  `total_flights` INT DEFAULT 0 COMMENT '累计飞行次数',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常 2-黑名单',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_wx_openid` (`wx_openid`),
  KEY `idx_status` (`status`),
  KEY `idx_member_level` (`member_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 3.2 用户地址表 (user_addresses)

```sql
CREATE TABLE `user_addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '地址名称',
  `vertiport_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联起降点ID',
  `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户常用地址表';
```

### 3.3 紧急联系人表 (emergency_contacts)

```sql
CREATE TABLE `emergency_contacts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `relationship` VARCHAR(20) NOT NULL COMMENT '关系',
  `is_primary` TINYINT DEFAULT 0 COMMENT '是否主要联系人',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='紧急联系人表';
```

### 3.4 飞行员表 (pilots)

```sql
CREATE TABLE `pilots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '飞行员ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
  `license_no` VARCHAR(50) NOT NULL COMMENT '飞行执照号',
  `license_type` VARCHAR(20) NOT NULL COMMENT '执照类型',
  `license_expiry` DATE NOT NULL COMMENT '执照有效期',
  `medical_cert_expiry` DATE NOT NULL COMMENT '体检证有效期',
  `total_flight_hours` DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计飞行小时数',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '综合评分',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-待审核 1-在线 2-离线 3-飞行中 4-休息 5-停飞',
  `hire_date` DATE DEFAULT NULL COMMENT '入职日期',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_license_no` (`license_no`),
  KEY `idx_status` (`status`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='飞行员表';
```

### 3.5 飞行员排班表 (pilot_schedules)

```sql
CREATE TABLE `pilot_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pilot_id` BIGINT UNSIGNED NOT NULL COMMENT '飞行员ID',
  `schedule_date` DATE NOT NULL COMMENT '排班日期',
  `shift_start` TIME NOT NULL COMMENT '班次开始时间',
  `shift_end` TIME NOT NULL COMMENT '班次结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-请假 3-调班',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pilot_date` (`pilot_id`, `schedule_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='飞行员排班表';
```

### 3.6 车辆表 (vehicles)

```sql
CREATE TABLE `vehicles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '车辆ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `registration_no` VARCHAR(30) NOT NULL COMMENT '注册号/车牌',
  `model` VARCHAR(50) NOT NULL COMMENT '车型',
  `manufacturer` VARCHAR(50) NOT NULL COMMENT '制造商',
  `manufacture_date` DATE NOT NULL COMMENT '制造日期',
  `max_passengers` TINYINT NOT NULL DEFAULT 4 COMMENT '最大载客数',
  `max_payload` DECIMAL(8,2) NOT NULL COMMENT '最大载重(kg)',
  `max_range` DECIMAL(8,2) NOT NULL COMMENT '最大航程(km)',
  `max_speed` DECIMAL(8,2) NOT NULL COMMENT '最大速度(km/h)',
  `cruise_speed` DECIMAL(8,2) NOT NULL COMMENT '巡航速度(km/h)',
  `battery_capacity` DECIMAL(8,2) NOT NULL COMMENT '电池容量(kWh)',
  `current_battery` DECIMAL(5,2) DEFAULT 100.00 COMMENT '当前电量百分比',
  `total_flight_hours` DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计飞行小时',
  `total_flights` INT DEFAULT 0 COMMENT '累计飞行次数',
  `current_vertiport_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '当前所在起降点',
  `current_latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '当前纬度',
  `current_longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '当前经度',
  `current_altitude` DECIMAL(8,2) DEFAULT NULL COMMENT '当前高度(m)',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-可用 2-飞行中 3-充电中 4-维护中 5-停用',
  `next_maintenance_date` DATE DEFAULT NULL COMMENT '下次维保日期',
  `insurance_expiry` DATE DEFAULT NULL COMMENT '保险到期日',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '车辆图片',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_registration_no` (`registration_no`),
  KEY `idx_status` (`status`),
  KEY `idx_current_vertiport` (`current_vertiport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='飞行汽车车辆表';
```

### 3.7 起降点表 (vertiports)

```sql
CREATE TABLE `vertiports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '起降点ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '起降点名称',
  `code` VARCHAR(10) NOT NULL COMMENT '起降点代码(如 VP001)',
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `district` VARCHAR(50) DEFAULT NULL COMMENT '所在区域',
  `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
  `altitude` DECIMAL(8,2) DEFAULT 0 COMMENT '海拔高度(m)',
  `capacity` INT NOT NULL DEFAULT 5 COMMENT '最大停机位数',
  `available_slots` INT NOT NULL DEFAULT 5 COMMENT '当前可用停机位',
  `charging_stations` INT DEFAULT 0 COMMENT '充电桩数量',
  `facilities` JSON DEFAULT NULL COMMENT '配套设施(休息区/卫生间/商店等)',
  `operating_hours_start` TIME DEFAULT '06:00:00' COMMENT '运营开始时间',
  `operating_hours_end` TIME DEFAULT '22:00:00' COMMENT '运营结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-运营中 2-暂停 3-关闭',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '图片',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_city` (`city`),
  KEY `idx_status` (`status`),
  KEY `idx_location` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='起降点(Vertiport)表';
```

### 3.8 航线表 (routes)

```sql
CREATE TABLE `routes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '航线ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT 'UUID',
  `route_code` VARCHAR(20) NOT NULL COMMENT '航线代码(如 RT001)',
  `name` VARCHAR(100) NOT NULL COMMENT '航线名称',
  `departure_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '出发起降点ID',
  `arrival_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '到达起降点ID',
  `distance` DECIMAL(8,2) NOT NULL COMMENT '飞行距离(km)',
  `estimated_duration` INT NOT NULL COMMENT '预估飞行时间(分钟)',
  `waypoints` JSON DEFAULT NULL COMMENT '航路点坐标列表',
  `min_altitude` DECIMAL(8,2) DEFAULT 100 COMMENT '最低飞行高度(m)',
  `max_altitude` DECIMAL(8,2) DEFAULT 500 COMMENT '最高飞行高度(m)',
  `base_price` DECIMAL(10,2) NOT NULL COMMENT '基础票价(元)',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-运营中 2-暂停 3-停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_route_code` (`route_code`),
  KEY `idx_departure` (`departure_vertiport_id`),
  KEY `idx_arrival` (`arrival_vertiport_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='航线表';
```

### 3.9 航班时刻表 (route_schedules)

```sql
CREATE TABLE `route_schedules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` BIGINT UNSIGNED NOT NULL COMMENT '航线ID',
  `flight_no` VARCHAR(20) NOT NULL COMMENT '航班号(如 FC1001)',
  `departure_time` TIME NOT NULL COMMENT '计划出发时间',
  `arrival_time` TIME NOT NULL COMMENT '计划到达时间',
  `days_of_week` VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5,6,7' COMMENT '运营日(1=周一)',
  `effective_from` DATE NOT NULL COMMENT '生效开始日期',
  `effective_to` DATE DEFAULT NULL COMMENT '生效结束日期',
  `max_passengers` TINYINT DEFAULT 4 COMMENT '最大订座数',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-有效 2-暂停',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_route_id` (`route_id`),
  KEY `idx_flight_no` (`flight_no`),
  KEY `idx_departure_time` (`departure_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='航班时刻表';
```

### 3.10 订单表 (orders)

```sql
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `route_id` BIGINT UNSIGNED NOT NULL COMMENT '航线ID',
  `schedule_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '航班时刻ID',
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分配的车辆ID',
  `pilot_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分配的飞行员ID',
  `departure_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '出发起降点',
  `arrival_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '到达起降点',
  `flight_date` DATE NOT NULL COMMENT '飞行日期',
  `scheduled_departure` DATETIME NOT NULL COMMENT '计划出发时间',
  `scheduled_arrival` DATETIME NOT NULL COMMENT '计划到达时间',
  `actual_departure` DATETIME DEFAULT NULL COMMENT '实际出发时间',
  `actual_arrival` DATETIME DEFAULT NULL COMMENT '实际到达时间',
  `passenger_count` TINYINT NOT NULL DEFAULT 1 COMMENT '乘客人数',
  `luggage_weight` DECIMAL(5,2) DEFAULT 0.00 COMMENT '行李重量(kg)',
  `seat_preference` VARCHAR(20) DEFAULT NULL COMMENT '座位偏好',
  `special_requirements` VARCHAR(500) DEFAULT NULL COMMENT '特殊需求',
  `base_price` DECIMAL(10,2) NOT NULL COMMENT '基础票价',
  `surge_rate` DECIMAL(3,2) DEFAULT 1.00 COMMENT '动态调价系数',
  `insurance_fee` DECIMAL(10,2) DEFAULT 10.00 COMMENT '保险费',
  `service_fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '服务费',
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '总价',
  `coupon_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '优惠券ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 1-待确认 2-已确认 3-待上车 4-飞行中 5-已到达 6-待支付 7-已完成 8-已取消 9-异常',
  `cancel_reason` VARCHAR(200) DEFAULT NULL COMMENT '取消原因',
  `cancel_by` VARCHAR(20) DEFAULT NULL COMMENT '取消方(user/pilot/system)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_route_id` (`route_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_pilot_id` (`pilot_id`),
  KEY `idx_flight_date` (`flight_date`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

### 3.11 订单乘客表 (order_passengers)

```sql
CREATE TABLE `order_passengers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `name` VARCHAR(50) NOT NULL COMMENT '乘客姓名',
  `id_card` VARCHAR(50) NOT NULL COMMENT '身份证号(加密)',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `is_primary` TINYINT DEFAULT 0 COMMENT '是否主要乘客',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单乘客表';
```

### 3.12 支付表 (payments)

```sql
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '支付ID',
  `payment_no` VARCHAR(32) NOT NULL COMMENT '支付流水号',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `payment_method` VARCHAR(20) NOT NULL COMMENT '支付方式(wechat/alipay/bank)',
  `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0-待支付 1-已支付 2-退款中 3-已退款 4-支付失败',
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
  `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '退款金额',
  `refund_reason` VARCHAR(200) DEFAULT NULL COMMENT '退款原因',
  `refunded_at` DATETIME DEFAULT NULL COMMENT '退款时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付表';
```

### 3.13 评价表 (reviews)

```sql
CREATE TABLE `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `pilot_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '飞行员ID',
  `vehicle_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '车辆ID',
  `overall_rating` TINYINT NOT NULL COMMENT '总体评分 1-5',
  `safety_rating` TINYINT DEFAULT NULL COMMENT '安全评分 1-5',
  `comfort_rating` TINYINT DEFAULT NULL COMMENT '舒适评分 1-5',
  `punctuality_rating` TINYINT DEFAULT NULL COMMENT '准时评分 1-5',
  `service_rating` TINYINT DEFAULT NULL COMMENT '服务评分 1-5',
  `content` VARCHAR(500) DEFAULT NULL COMMENT '评价内容',
  `images` JSON DEFAULT NULL COMMENT '评价图片URL列表',
  `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名',
  `reply` VARCHAR(500) DEFAULT NULL COMMENT '商家回复',
  `replied_at` DATETIME DEFAULT NULL COMMENT '回复时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-隐藏',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pilot_id` (`pilot_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_overall_rating` (`overall_rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';
```

### 3.14 飞行日志表 (flight_logs)

```sql
CREATE TABLE `flight_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
  `vehicle_id` BIGINT UNSIGNED NOT NULL COMMENT '车辆ID',
  `pilot_id` BIGINT UNSIGNED NOT NULL COMMENT '飞行员ID',
  `route_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '航线ID',
  `departure_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '出发起降点',
  `arrival_vertiport_id` BIGINT UNSIGNED NOT NULL COMMENT '到达起降点',
  `departure_time` DATETIME NOT NULL COMMENT '起飞时间',
  `arrival_time` DATETIME DEFAULT NULL COMMENT '降落时间',
  `flight_duration` INT DEFAULT NULL COMMENT '飞行时长(秒)',
  `distance` DECIMAL(8,2) DEFAULT NULL COMMENT '实际飞行距离(km)',
  `max_altitude` DECIMAL(8,2) DEFAULT NULL COMMENT '最高飞行高度(m)',
  `max_speed` DECIMAL(8,2) DEFAULT NULL COMMENT '最高速度(km/h)',
  `avg_speed` DECIMAL(8,2) DEFAULT NULL COMMENT '平均速度(km/h)',
  `battery_start` DECIMAL(5,2) DEFAULT NULL COMMENT '起飞电量(%)',
  `battery_end` DECIMAL(5,2) DEFAULT NULL COMMENT '降落电量(%)',
  `weather_condition` VARCHAR(50) DEFAULT NULL COMMENT '天气状况',
  `trajectory` JSON DEFAULT NULL COMMENT '飞行轨迹(坐标点列表)',
  `anomalies` JSON DEFAULT NULL COMMENT '异常事件记录',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-正常完成 2-异常终止 3-紧急降落',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_pilot_id` (`pilot_id`),
  KEY `idx_departure_time` (`departure_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='飞行日志表';
```

### 3.15 维保记录表 (maintenance_records)

```sql
CREATE TABLE `maintenance_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` BIGINT UNSIGNED NOT NULL COMMENT '车辆ID',
  `type` TINYINT NOT NULL COMMENT '类型 1-日常检查 2-定期维保 3-故障维修 4-紧急维修',
  `description` TEXT NOT NULL COMMENT '维保描述',
  `parts_replaced` JSON DEFAULT NULL COMMENT '更换配件列表',
  `cost` DECIMAL(10,2) DEFAULT 0.00 COMMENT '维保费用',
  `technician_name` VARCHAR(50) NOT NULL COMMENT '技术人员姓名',
  `started_at` DATETIME NOT NULL COMMENT '开始时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `next_maintenance_date` DATE DEFAULT NULL COMMENT '下次维保日期',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-进行中 2-已完成 3-待审核',
  `images` JSON DEFAULT NULL COMMENT '维保图片',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_type` (`type`),
  KEY `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维保记录表';
```

### 3.16 优惠券表 (coupons)

```sql
CREATE TABLE `coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `type` TINYINT NOT NULL COMMENT '类型 1-满减 2-折扣 3-固定金额',
  `value` DECIMAL(10,2) NOT NULL COMMENT '优惠值(金额或折扣率)',
  `min_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低使用金额',
  `max_discount` DECIMAL(10,2) DEFAULT NULL COMMENT '最大优惠金额(折扣券)',
  `total_count` INT NOT NULL COMMENT '发行总量',
  `used_count` INT DEFAULT 0 COMMENT '已使用数量',
  `effective_from` DATETIME NOT NULL COMMENT '生效开始时间',
  `effective_to` DATETIME NOT NULL COMMENT '生效结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-有效 2-已停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_effective` (`effective_from`, `effective_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';
```

### 3.17 用户优惠券表 (user_coupons)

```sql
CREATE TABLE `user_coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `coupon_id` BIGINT UNSIGNED NOT NULL COMMENT '优惠券ID',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用的订单ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-未使用 2-已使用 3-已过期',
  `used_at` DATETIME DEFAULT NULL COMMENT '使用时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';
```

### 3.18 空域信息表 (airspaces)

```sql
CREATE TABLE `airspaces` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '空域名称',
  `type` TINYINT NOT NULL COMMENT '类型 1-可飞行 2-限制区 3-禁飞区',
  `boundary` JSON NOT NULL COMMENT '空域边界(多边形坐标)',
  `min_altitude` DECIMAL(8,2) DEFAULT NULL COMMENT '最低高度(m)',
  `max_altitude` DECIMAL(8,2) DEFAULT NULL COMMENT '最高高度(m)',
  `restriction_reason` VARCHAR(200) DEFAULT NULL COMMENT '限制原因',
  `effective_from` DATETIME DEFAULT NULL COMMENT '生效开始时间',
  `effective_to` DATETIME DEFAULT NULL COMMENT '生效结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1-有效 2-无效',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空域信息表';
```

### 3.19 系统通知表 (notifications)

```sql
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '目标用户ID(NULL=全局)',
  `type` VARCHAR(30) NOT NULL COMMENT '通知类型(order/system/promotion/alert)',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `data` JSON DEFAULT NULL COMMENT '附加数据',
  `channel` VARCHAR(20) DEFAULT 'app' COMMENT '通知渠道(app/sms/wechat/email)',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';
```

### 3.20 操作日志表 (operation_logs)

```sql
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `operator_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
  `operator_type` VARCHAR(20) NOT NULL COMMENT '操作人类型(admin/pilot/user)',
  `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
  `action` VARCHAR(50) NOT NULL COMMENT '操作动作',
  `target_type` VARCHAR(50) DEFAULT NULL COMMENT '目标类型',
  `target_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '目标ID',
  `detail` JSON DEFAULT NULL COMMENT '操作详情',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT '操作IP',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT 'UserAgent',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_operator` (`operator_id`, `operator_type`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

### 3.21 管理员表 (admins)

```sql
CREATE TABLE `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
  `role` VARCHAR(20) NOT NULL DEFAULT 'operator' COMMENT '角色(super_admin/admin/operator/viewer)',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';
```

## 4. 索引策略

### 4.1 核心查询索引
- 订单查询：`idx_user_id` + `idx_status` + `idx_flight_date` 联合查询
- 车辆查询：`idx_status` + `idx_current_vertiport` 查找可用车辆
- 航线搜索：`idx_departure` + `idx_arrival` + `idx_status` 查找航线
- 飞行日志：`idx_vehicle_id` + `idx_departure_time` 时间范围查询

### 4.2 读写分离策略
- **主库**：处理所有写操作和实时性要求高的读操作
- **从库**：处理报表查询、历史数据分析等读操作
- **缓存**：Redis 缓存热门航线、起降点信息、用户会话

## 5. 数据安全

### 5.1 敏感数据处理
| 数据类型 | 存储方式 |
|----------|----------|
| 身份证号 | AES-256 加密存储 |
| 手机号 | 展示时脱敏处理 |
| 密码 | bcrypt 哈希 |
| 支付信息 | 不存储银行卡号，使用令牌化 |
| 飞行轨迹 | 加密存储，按权限访问 |

### 5.2 数据备份策略
- 全量备份：每日凌晨 3:00
- 增量备份：每小时
- 备份保留：30 天
- 异地备份：跨区域存储
