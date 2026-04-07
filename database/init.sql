-- ============================================
-- 飞行汽车运营平台 - 数据库初始化脚本
-- Flying Car Operations Platform - Database Init
-- ============================================

CREATE DATABASE IF NOT EXISTS `flying_car_platform`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `flying_car_platform`;

-- -------------------------------------------
-- 1. 管理员表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
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

-- -------------------------------------------
-- 2. 用户表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `uuid` VARCHAR(36) NOT NULL COMMENT '用户UUID',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(200) DEFAULT NULL COMMENT '身份证号(加密存储)',
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

-- -------------------------------------------
-- 3. 用户地址表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `user_addresses` (
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

-- -------------------------------------------
-- 4. 紧急联系人表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `emergency_contacts` (
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

-- -------------------------------------------
-- 5. 飞行员表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `pilots` (
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

-- -------------------------------------------
-- 6. 飞行员排班表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `pilot_schedules` (
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

-- -------------------------------------------
-- 7. 车辆表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `vehicles` (
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

-- -------------------------------------------
-- 8. 起降点表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `vertiports` (
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
  `facilities` JSON DEFAULT NULL COMMENT '配套设施',
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

-- -------------------------------------------
-- 9. 航线表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `routes` (
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

-- -------------------------------------------
-- 10. 航班时刻表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `route_schedules` (
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

-- -------------------------------------------
-- 11. 订单表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
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

-- -------------------------------------------
-- 12. 订单乘客表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `order_passengers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  `name` VARCHAR(50) NOT NULL COMMENT '乘客姓名',
  `id_card` VARCHAR(200) NOT NULL COMMENT '身份证号(加密)',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `is_primary` TINYINT DEFAULT 0 COMMENT '是否主要乘客',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单乘客表';

-- -------------------------------------------
-- 13. 支付表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
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

-- -------------------------------------------
-- 14. 评价表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
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

-- -------------------------------------------
-- 15. 飞行日志表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `flight_logs` (
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

-- -------------------------------------------
-- 16. 维保记录表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `maintenance_records` (
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

-- -------------------------------------------
-- 17. 优惠券表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
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

-- -------------------------------------------
-- 18. 用户优惠券表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `user_coupons` (
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

-- -------------------------------------------
-- 19. 空域信息表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `airspaces` (
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

-- -------------------------------------------
-- 20. 系统通知表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
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

-- -------------------------------------------
-- 21. 操作日志表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `operation_logs` (
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

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员 (密码: admin123, 注意: 生产环境必须修改此密码)
-- 以下哈希值对应密码 'admin123'，使用 bcrypt cost=10 生成
INSERT INTO `admins` (`username`, `password_hash`, `name`, `phone`, `role`, `status`)
VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '13800000000', 'super_admin', 1);

-- 插入示例起降点
INSERT INTO `vertiports` (`uuid`, `name`, `code`, `address`, `city`, `district`, `latitude`, `longitude`, `capacity`, `available_slots`, `charging_stations`, `status`) VALUES
(UUID(), '国贸CBD起降场', 'VP001', '北京市朝阳区国贸CBD中心广场', '北京', '朝阳区', 39.9087000, 116.4605000, 8, 8, 4, 1),
(UUID(), '首都机场起降场', 'VP002', '北京市顺义区首都机场T3航站楼北侧', '北京', '顺义区', 40.0799000, 116.6031000, 10, 10, 6, 1),
(UUID(), '中关村起降场', 'VP003', '北京市海淀区中关村软件园', '北京', '海淀区', 40.0500000, 116.3000000, 6, 6, 3, 1),
(UUID(), '望京起降场', 'VP004', '北京市朝阳区望京SOHO', '北京', '朝阳区', 39.9900000, 116.4800000, 5, 5, 2, 1),
(UUID(), '大兴机场起降场', 'VP005', '北京市大兴区大兴国际机场', '北京', '大兴区', 39.5098000, 116.4105000, 12, 12, 8, 1);

-- 插入示例航线
INSERT INTO `routes` (`uuid`, `route_code`, `name`, `departure_vertiport_id`, `arrival_vertiport_id`, `distance`, `estimated_duration`, `base_price`, `status`) VALUES
(UUID(), 'RT001', '国贸CBD - 首都机场', 1, 2, 25.50, 15, 299.00, 1),
(UUID(), 'RT002', '首都机场 - 国贸CBD', 2, 1, 25.50, 15, 299.00, 1),
(UUID(), 'RT003', '国贸CBD - 中关村', 1, 3, 18.00, 12, 199.00, 1),
(UUID(), 'RT004', '中关村 - 国贸CBD', 3, 1, 18.00, 12, 199.00, 1),
(UUID(), 'RT005', '国贸CBD - 大兴机场', 1, 5, 45.00, 25, 499.00, 1),
(UUID(), 'RT006', '大兴机场 - 国贸CBD', 5, 1, 45.00, 25, 499.00, 1),
(UUID(), 'RT007', '望京 - 首都机场', 4, 2, 15.00, 10, 159.00, 1),
(UUID(), 'RT008', '首都机场 - 望京', 2, 4, 15.00, 10, 159.00, 1);

-- 插入示例航班时刻表
INSERT INTO `route_schedules` (`route_id`, `flight_no`, `departure_time`, `arrival_time`, `days_of_week`, `effective_from`, `max_passengers`, `status`) VALUES
(1, 'FC1001', '07:00:00', '07:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1002', '07:30:00', '07:45:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1003', '08:00:00', '08:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1004', '08:30:00', '08:45:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1005', '17:00:00', '17:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1006', '17:30:00', '17:45:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(1, 'FC1007', '18:00:00', '18:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(2, 'FC2001', '07:30:00', '07:45:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(2, 'FC2002', '08:00:00', '08:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(2, 'FC2003', '17:30:00', '17:45:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(2, 'FC2004', '18:00:00', '18:15:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(3, 'FC3001', '08:00:00', '08:12:00', '1,2,3,4,5', '2026-01-01', 4, 1),
(3, 'FC3002', '09:00:00', '09:12:00', '1,2,3,4,5,6,7', '2026-01-01', 4, 1),
(5, 'FC5001', '06:00:00', '06:25:00', '1,2,3,4,5,6,7', '2026-01-01', 4, 1),
(5, 'FC5002', '07:00:00', '07:25:00', '1,2,3,4,5,6,7', '2026-01-01', 4, 1);

-- 插入示例车辆
INSERT INTO `vehicles` (`uuid`, `registration_no`, `model`, `manufacturer`, `manufacture_date`, `max_passengers`, `max_payload`, `max_range`, `max_speed`, `cruise_speed`, `battery_capacity`, `current_battery`, `current_vertiport_id`, `status`) VALUES
(UUID(), '京A-FC001', 'AeroCity X1', '亿航智能', '2025-06-01', 4, 400.00, 120.00, 200.00, 150.00, 80.00, 95.00, 1, 1),
(UUID(), '京A-FC002', 'AeroCity X1', '亿航智能', '2025-06-15', 4, 400.00, 120.00, 200.00, 150.00, 80.00, 88.00, 1, 1),
(UUID(), '京A-FC003', 'SkyDrive S2', '小鹏汇天', '2025-07-01', 2, 200.00, 80.00, 180.00, 130.00, 60.00, 72.00, 2, 1),
(UUID(), '京A-FC004', 'SkyDrive S2', '小鹏汇天', '2025-07-15', 2, 200.00, 80.00, 180.00, 130.00, 60.00, 100.00, 2, 1),
(UUID(), '京A-FC005', 'AeroCity X2 Pro', '亿航智能', '2025-08-01', 6, 600.00, 150.00, 220.00, 170.00, 120.00, 65.00, 3, 1),
(UUID(), '京A-FC006', 'VoloCity', '沃飞长空', '2025-09-01', 2, 200.00, 100.00, 180.00, 140.00, 70.00, 45.00, 4, 3),
(UUID(), '京A-FC007', 'AeroCity X1', '亿航智能', '2025-10-01', 4, 400.00, 120.00, 200.00, 150.00, 80.00, 30.00, 5, 1),
(UUID(), '京A-FC008', 'SkyDrive S3', '小鹏汇天', '2025-11-01', 4, 350.00, 100.00, 190.00, 145.00, 75.00, 92.00, 5, 1);
