-- ============================================================
-- 海上物流配送平台 数据库结构
-- Database: maritime_logistics
-- ============================================================

CREATE DATABASE IF NOT EXISTS maritime_logistics
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE maritime_logistics;

-- ------------------------------------------------------------
-- 用户表
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT           PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  email         VARCHAR(100)  UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20),
  role          ENUM('admin', 'operator', 'customer') DEFAULT 'customer',
  status        ENUM('active', 'inactive')            DEFAULT 'active',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 船舶表
-- ------------------------------------------------------------
CREATE TABLE vessels (
  id                INT           PRIMARY KEY AUTO_INCREMENT,
  vessel_name       VARCHAR(100)  NOT NULL,
  vessel_type       ENUM('container', 'bulk_carrier', 'tanker', 'ro_ro') NOT NULL,
  registration_no   VARCHAR(50)   NOT NULL UNIQUE,
  capacity_weight   DECIMAL(10,2) COMMENT '载重吨',
  capacity_volume   DECIMAL(10,2) COMMENT '舱容m³',
  status            ENUM('available', 'in_use', 'maintenance', 'retired') DEFAULT 'available',
  current_location  VARCHAR(100),
  owner_name        VARCHAR(100),
  notes             TEXT,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 航线表
-- ------------------------------------------------------------
CREATE TABLE routes (
  id                    INT           PRIMARY KEY AUTO_INCREMENT,
  route_name            VARCHAR(100)  NOT NULL,
  origin_port           VARCHAR(100)  NOT NULL,
  destination_port      VARCHAR(100)  NOT NULL,
  distance_nm           DECIMAL(10,2) COMMENT '海里',
  estimated_days        INT,
  freight_rate_per_ton  DECIMAL(10,2) COMMENT '每吨运费（元）',
  status                ENUM('active', 'inactive') DEFAULT 'active',
  notes                 TEXT,
  created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 订单表
-- ------------------------------------------------------------
CREATE TABLE orders (
  id                   INT           PRIMARY KEY AUTO_INCREMENT,
  order_no             VARCHAR(20)   NOT NULL UNIQUE,
  customer_id          INT           NOT NULL,
  vessel_id            INT,
  route_id             INT,
  status               ENUM('pending', 'confirmed', 'loading', 'in_transit', 'arrived', 'completed', 'cancelled') DEFAULT 'pending',
  origin_port          VARCHAR(100)  NOT NULL,
  destination_port     VARCHAR(100)  NOT NULL,
  cargo_type           VARCHAR(50),
  cargo_weight         DECIMAL(10,2),
  cargo_volume         DECIMAL(10,2),
  estimated_departure  DATE,
  estimated_arrival    DATE,
  actual_departure     DATE,
  actual_arrival       DATE,
  freight_cost         DECIMAL(12,2),
  notes                TEXT,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (vessel_id)   REFERENCES vessels(id),
  FOREIGN KEY (route_id)    REFERENCES routes(id)
);

-- ------------------------------------------------------------
-- 货物表
-- ------------------------------------------------------------
CREATE TABLE cargo (
  id                   INT           PRIMARY KEY AUTO_INCREMENT,
  order_id             INT           NOT NULL,
  cargo_no             VARCHAR(20)   NOT NULL UNIQUE,
  description          VARCHAR(255),
  cargo_type           VARCHAR(50),
  weight               DECIMAL(10,2),
  volume               DECIMAL(10,2),
  quantity             INT,
  unit                 VARCHAR(20),
  packaging_type       VARCHAR(50),
  hazmat               BOOLEAN       DEFAULT FALSE,
  temperature_required BOOLEAN       DEFAULT FALSE,
  temperature_min      DECIMAL(5,2),
  temperature_max      DECIMAL(5,2),
  status               ENUM('pending', 'loaded', 'in_transit', 'unloaded', 'delivered') DEFAULT 'pending',
  notes                TEXT,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ------------------------------------------------------------
-- 索引
-- ------------------------------------------------------------
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_order_no    ON orders(order_no);
CREATE INDEX idx_cargo_order_id     ON cargo(order_id);
CREATE INDEX idx_cargo_cargo_no     ON cargo(cargo_no);
CREATE INDEX idx_vessels_status     ON vessels(status);
CREATE INDEX idx_routes_status      ON routes(status);

-- ============================================================
-- 初始数据
-- ============================================================

-- ------------------------------------------------------------
-- 用户数据
-- 密码 "123456" 对应的 bcrypt hash
-- ------------------------------------------------------------
INSERT INTO users (username, email, password_hash, phone, role, status) VALUES
('admin',    'admin@maritime.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800000001', 'admin',    'active'),
('operator1','operator1@maritime.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800000002', 'operator', 'active'),
('customer1','customer1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13900000001', 'customer', 'active'),
('customer2','customer2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13900000002', 'customer', 'active'),
('customer3','customer3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13900000003', 'customer', 'active');

-- ------------------------------------------------------------
-- 船舶数据
-- ------------------------------------------------------------
INSERT INTO vessels (vessel_name, vessel_type, registration_no, capacity_weight, capacity_volume, status, current_location, owner_name) VALUES
('东方之星',   'container',   'CN-SH-2021-001', 25000.00, 32000.00, 'available',   '上海港',   '上海远洋运输公司'),
('海上丝路',   'bulk_carrier','CN-GZ-2020-002', 50000.00, 55000.00, 'in_use',      '广州港',   '广州海运集团'),
('太平洋号',   'tanker',      'CN-TJ-2019-003', 80000.00, 90000.00, 'available',   '天津港',   '中国石化运输有限公司'),
('远洋一号',   'container',   'CN-QD-2022-004', 18000.00, 22000.00, 'maintenance', '青岛港',   '青岛国际物流集团'),
('振华轮',     'ro_ro',       'CN-NB-2020-005', 12000.00, 15000.00, 'available',   '宁波港',   '宁波舟山港运集团');

-- ------------------------------------------------------------
-- 航线数据
-- ------------------------------------------------------------
INSERT INTO routes (route_name, origin_port, destination_port, distance_nm, estimated_days, freight_rate_per_ton, status) VALUES
('沪穗线',   '上海港', '广州港', 850.00,  3, 120.00, 'active'),
('沪津线',   '上海港', '天津港', 530.00,  2, 95.00,  'active'),
('沪青线',   '上海港', '青岛港', 370.00,  1, 80.00,  'active'),
('广深线',   '广州港', '深圳港', 60.00,   1, 50.00,  'active'),
('津青线',   '天津港', '青岛港', 280.00,  1, 70.00,  'active'),
('宁沪线',   '宁波港', '上海港', 120.00,  1, 60.00,  'active');

-- ------------------------------------------------------------
-- 订单数据
-- ------------------------------------------------------------
INSERT INTO orders (order_no, customer_id, vessel_id, route_id, status, origin_port, destination_port, cargo_type, cargo_weight, cargo_volume, estimated_departure, estimated_arrival, actual_departure, actual_arrival, freight_cost) VALUES
('ORD20240101001', 3, 1, 1, 'completed',  '上海港', '广州港', '集装箱货物', 1200.00, 1500.00, '2024-01-05', '2024-01-08', '2024-01-05', '2024-01-08', 144000.00),
('ORD20240115002', 4, 2, 2, 'in_transit', '上海港', '天津港', '散装粮食',   3000.00, 3200.00, '2024-01-15', '2024-01-17', '2024-01-15', NULL,          285000.00),
('ORD20240120003', 5, 3, 3, 'confirmed',  '上海港', '青岛港', '化工原料',   5000.00, 5500.00, '2024-01-25', '2024-01-26', NULL,          NULL,          400000.00),
('ORD20240122004', 3, 5, 6, 'loading',    '宁波港', '上海港', '电子产品',    800.00,  900.00, '2024-01-23', '2024-01-24', NULL,          NULL,          48000.00),
('ORD20240125005', 4, 1, 4, 'pending',    '广州港', '深圳港', '服装纺织品',  500.00,  600.00, '2024-02-01', '2024-02-02', NULL,          NULL,          25000.00),
('ORD20240128006', 5, 2, 5, 'pending',    '天津港', '青岛港', '机械设备',   2000.00, 2200.00, '2024-02-05', '2024-02-06', NULL,          NULL,          140000.00),
('ORD20240201007', 3, 4, 1, 'cancelled',  '上海港', '广州港', '建筑材料',   4500.00, 5000.00, '2024-02-10', '2024-02-13', NULL,          NULL,          NULL),
('ORD20240205008', 4, 5, 6, 'arrived',    '宁波港', '上海港', '进口食品',    600.00,  700.00, '2024-02-05', '2024-02-06', '2024-02-05', '2024-02-06', 36000.00),
('ORD20240210009', 5, 1, 2, 'confirmed',  '上海港', '天津港', '汽车配件',   1800.00, 2000.00, '2024-02-20', '2024-02-22', NULL,          NULL,          171000.00),
('ORD20240215010', 3, 3, 3, 'pending',    '上海港', '青岛港', '石油化工',   7000.00, 8000.00, '2024-03-01', '2024-03-02', NULL,          NULL,          560000.00);

-- ------------------------------------------------------------
-- 货物数据
-- ------------------------------------------------------------
INSERT INTO cargo (order_id, cargo_no, description, cargo_type, weight, volume, quantity, unit, packaging_type, hazmat, temperature_required, status) VALUES
(1, 'CGO20240101001', '电子元件-集成电路',   '电子产品', 200.00, 250.00,  500, '箱', '木箱',   FALSE, FALSE, 'delivered'),
(1, 'CGO20240101002', '纺织品-棉布卷',       '纺织品',   400.00, 500.00,  200, '卷', '打包',   FALSE, FALSE, 'delivered'),
(1, 'CGO20240101003', '塑料制品',            '化工品',   600.00, 750.00,  300, '托', '托盘',   FALSE, FALSE, 'delivered'),
(2, 'CGO20240115001', '进口大豆',            '农产品',  2000.00,2100.00, 2000, '吨', '散装',   FALSE, FALSE, 'in_transit'),
(2, 'CGO20240115002', '玉米',                '农产品',  1000.00,1100.00, 1000, '吨', '散装',   FALSE, FALSE, 'in_transit'),
(3, 'CGO20240120001', '甲醇',                '危险品',  3000.00,3200.00,    3, '罐', '罐装',   TRUE,  FALSE, 'loaded'),
(3, 'CGO20240120002', '乙烯',                '危险品',  2000.00,2300.00,    2, '罐', '罐装',   TRUE,  FALSE, 'loaded'),
(4, 'CGO20240122001', '手机及配件',          '电子产品',  400.00, 450.00, 2000, '箱', '纸箱',   FALSE, FALSE, 'loaded'),
(4, 'CGO20240122002', '笔记本电脑',          '电子产品',  400.00, 450.00, 1000, '箱', '木箱',   FALSE, FALSE, 'loaded'),
(8, 'CGO20240205001', '进口红酒',            '食品饮料',  300.00, 350.00,  500, '箱', '木箱',   FALSE, TRUE,  'unloaded'),
(8, 'CGO20240205002', '进口奶酪',            '食品饮料',  300.00, 350.00,  300, '箱', '保温箱', FALSE, TRUE,  'unloaded');
