-- 测试数据
USE order_system;

-- 1. 插入管理员测试账号
-- 密码: admin123 (BCrypt hash)
INSERT INTO admins (username, password, nickname, status) VALUES
('admin', '$2b$10$YourBcryptHashHere', '系统管理员', 1);

-- 2. 插入分类数据
INSERT INTO categories (name, icon, sort, parent_id, status) VALUES
('热菜', '/icons/hot-dish.png', 1, 0, 1),
('凉菜', '/icons/cold-dish.png', 2, 0, 1),
('主食', '/icons/staple.png', 3, 0, 1),
('汤品', '/icons/soup.png', 4, 0, 1),
('饮品', '/icons/drink.png', 5, 0, 1);

-- 3. 插入菜品数据
INSERT INTO dishes (name, category_id, price, description, images, stock, sales, rating, status, is_recommended) VALUES
('宫保鸡丁', 1, 28.00, '经典川菜，鸡肉鲜嫩，花生香脆', JSON_ARRAY('/images/dishes/gongbao.jpg'), 100, 156, 4.8, 1, 1),
('鱼香肉丝', 1, 26.00, '酸甜可口，色泽红亮', JSON_ARRAY('/images/dishes/yuxiang.jpg'), 100, 143, 4.7, 1, 1),
('麻婆豆腐', 1, 22.00, '麻辣鲜香，豆腐嫩滑', JSON_ARRAY('/images/dishes/mapo.jpg'), 100, 189, 4.9, 1, 1),
('糖醋里脊', 1, 32.00, '外酥里嫩，酸甜适中', JSON_ARRAY('/images/dishes/tangcu.jpg'), 100, 98, 4.6, 1, 0),
('回锅肉', 1, 35.00, '肥而不腻，香辣下饭', JSON_ARRAY('/images/dishes/huiguo.jpg'), 100, 167, 4.8, 1, 1),

('凉拌黄瓜', 2, 12.00, '清爽开胃，夏日必备', JSON_ARRAY('/images/dishes/huangua.jpg'), 100, 234, 4.7, 1, 0),
('拍黄瓜', 2, 10.00, '简单美味，爽口解腻', JSON_ARRAY('/images/dishes/paihuangua.jpg'), 100, 198, 4.6, 1, 0),
('凉拌木耳', 2, 15.00, '营养丰富，清脆可口', JSON_ARRAY('/images/dishes/muer.jpg'), 100, 145, 4.5, 1, 0),

('米饭', 3, 2.00, '精选东北大米', JSON_ARRAY('/images/dishes/rice.jpg'), 500, 567, 4.9, 1, 0),
('炒饭', 3, 18.00, '粒粒分明，香气扑鼻', JSON_ARRAY('/images/dishes/chaofan.jpg'), 100, 234, 4.7, 1, 0),
('面条', 3, 15.00, '劲道爽滑', JSON_ARRAY('/images/dishes/noodles.jpg'), 100, 178, 4.6, 1, 0),

('紫菜蛋花汤', 4, 8.00, '清淡营养', JSON_ARRAY('/images/dishes/zicaitang.jpg'), 100, 289, 4.8, 1, 0),
('西红柿鸡蛋汤', 4, 10.00, '酸甜可口', JSON_ARRAY('/images/dishes/xihongshi.jpg'), 100, 267, 4.7, 1, 0),

('可乐', 5, 5.00, '冰镇可乐', JSON_ARRAY('/images/dishes/cola.jpg'), 200, 345, 4.8, 1, 0),
('雪碧', 5, 5.00, '冰镇雪碧', JSON_ARRAY('/images/dishes/sprite.jpg'), 200, 312, 4.8, 1, 0),
('橙汁', 5, 8.00, '鲜榨橙汁', JSON_ARRAY('/images/dishes/orange.jpg'), 100, 198, 4.9, 1, 1);

-- 4. 插入测试用户
INSERT INTO users (openid, nickname, avatar, phone, status) VALUES
('test_openid_001', '张三', 'https://thirdwx.qlogo.cn/mmopen/001.jpg', '13800138000', 1),
('test_openid_002', '李四', 'https://thirdwx.qlogo.cn/mmopen/002.jpg', '13800138001', 1),
('test_openid_003', '王五', 'https://thirdwx.qlogo.cn/mmopen/003.jpg', '13800138002', 1);

-- 5. 插入测试订单
INSERT INTO orders (order_no, user_id, total_amount, delivery_date, delivery_address, status, remark) VALUES
('ORD202402150001', 1, 78.00, '2024-02-16', '北京市朝阳区xxx小区1号楼101', 4, '多加辣'),
('ORD202402150002', 1, 56.00, '2024-02-17', '北京市朝阳区xxx小区1号楼101', 2, ''),
('ORD202402150003', 2, 92.00, '2024-02-16', '北京市海淀区xxx大厦801', 4, '');

-- 6. 插入订单详情
INSERT INTO order_items (order_id, dish_id, dish_name, price, quantity) VALUES
(1, 1, '宫保鸡丁', 28.00, 1),
(1, 3, '麻婆豆腐', 22.00, 1),
(1, 1, '宫保鸡丁', 28.00, 1),
(2, 2, '鱼香肉丝', 26.00, 1),
(2, 6, '凉拌黄瓜', 12.00, 1),
(2, 10, '炒饭', 18.00, 1),
(3, 5, '回锅肉', 35.00, 1),
(3, 1, '宫保鸡丁', 28.00, 1),
(3, 9, '米饭', 2.00, 2),
(3, 12, '紫菜蛋花汤', 8.00, 1),
(3, 16, '橙汁', 8.00, 2);

-- 7. 插入评价数据
INSERT INTO reviews (user_id, dish_id, order_id, rating, content, images, reply, likes) VALUES
(1, 1, 1, 5, '非常好吃，鸡肉很嫩，花生很香脆！', JSON_ARRAY('/images/reviews/r1.jpg'), '感谢您的好评！', 12),
(1, 3, 1, 5, '麻婆豆腐超级好吃，麻辣适中', NULL, '谢谢支持！', 8),
(2, 5, 3, 5, '回锅肉做得很正宗，肥而不腻', JSON_ARRAY('/images/reviews/r2.jpg', '/images/reviews/r3.jpg'), NULL, 15),
(2, 1, 3, 4, '味道不错，但是有点咸', NULL, '我们会注意改进，感谢反馈！', 5);

-- 8. 插入收货地址
INSERT INTO addresses (user_id, name, phone, address, is_default) VALUES
(1, '张三', '13800138000', '北京市朝阳区xxx小区1号楼101', 1),
(1, '张三', '13800138000', '北京市朝阳区工作单位xxx大厦5楼', 0),
(2, '李四', '13800138001', '北京市海淀区xxx大厦801', 1);
