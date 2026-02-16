/**
 * 移动端路由
 */
const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/auth');

const authController = require('../controllers/mobile/authController');
const dishController = require('../controllers/mobile/dishController');
const orderController = require('../controllers/mobile/orderController');

// 认证相关 (无需token)
router.post('/auth/wechat', authController.wechatLogin);

// 菜品相关 (无需token)
router.get('/dishes', dishController.getDishes);
router.get('/dishes/:id', dishController.getDish);
router.get('/categories', dishController.getCategories);

// 以下路由需要认证
router.use(userAuth);

// 用户信息
router.get('/user/info', authController.getUserInfo);
router.put('/user/info', authController.updateUserInfo);

// 订单相关
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.put('/orders/:id/cancel', orderController.cancelOrder);

module.exports = router;
