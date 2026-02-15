-- 点菜系统数据库建表SQL
-- 创建数据库
CREATE DATABASE IF NOT EXISTS order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE order_system;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
    nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码hash',
    nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    status TINYINT DEFAULT 1 COMMENT '状态: 1正常 0禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 3. 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(255) DEFAULT NULL COMMENT '图标URL',
    sort INT DEFAULT 0 COMMENT '排序',
    parent_id INT UNSIGNED DEFAULT 0 COMMENT '父分类ID, 0表示顶级分类',
    status TINYINT DEFAULT 1 COMMENT '状态: 1启用 0禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 4. 菜品表
CREATE TABLE IF NOT EXISTS dishes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    description TEXT DEFAULT NULL COMMENT '描述',
    images JSON DEFAULT NULL COMMENT '图片JSON数组',
    stock INT DEFAULT 999 COMMENT '库存',
    sales INT DEFAULT 0 COMMENT '销量',
    rating DECIMAL(3, 2) DEFAULT 5.00 COMMENT '平均评分',
    status TINYINT DEFAULT 1 COMMENT '状态: 1上架 0下架',
    is_recommended TINYINT DEFAULT 0 COMMENT '是否推荐: 1是 0否',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '软删除时间',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_is_recommended (is_recommended),
    INDEX idx_deleted_at (deleted_at),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜品表';

-- 5. 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '总金额',
    delivery_date DATE NOT NULL COMMENT '配送日期',
    delivery_address TEXT DEFAULT NULL COMMENT '配送地址',
    status TINYINT DEFAULT 1 COMMENT '状态: 1待处理 2已接单 3配送中 4已完成 5已取消',
    remark TEXT DEFAULT NULL COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 6. 订单详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL COMMENT '订单ID',
    dish_id INT UNSIGNED NOT NULL COMMENT '菜品ID',
    dish_name VARCHAR(100) NOT NULL COMMENT '菜品名称快照',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格快照',
    quantity INT NOT NULL COMMENT '数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_dish_id (dish_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单详情表';

-- 7. 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    dish_id INT UNSIGNED NOT NULL COMMENT '菜品ID',
    order_id INT UNSIGNED NOT NULL COMMENT '订单ID',
    rating TINYINT NOT NULL COMMENT '评分 1-5',
    content TEXT DEFAULT NULL COMMENT '评价内容',
    images JSON DEFAULT NULL COMMENT '图片JSON数组',
    reply TEXT DEFAULT NULL COMMENT '商家回复',
    likes INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_dish_id (dish_id),
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 8. 收货地址表
CREATE TABLE IF NOT EXISTS addresses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '联系人',
    phone VARCHAR(20) NOT NULL COMMENT '电话',
    address TEXT NOT NULL COMMENT '详细地址',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认: 1是 0否',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';
