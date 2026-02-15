/**
 * 管理员路由
 */
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 控制器
const authController = require('../controllers/admin/authController');
const dishController = require('../controllers/admin/dishController');
const categoryController = require('../controllers/admin/categoryController');
const orderController = require('../controllers/admin/orderController');
const reviewController = require('../controllers/admin/reviewController');
const userController = require('../controllers/admin/userController');
const statisticsController = require('../controllers/admin/statisticsController');
const uploadController = require('../controllers/admin/uploadController');

// 认证相关 (无需token)
router.post('/login', authController.login);

// 以下路由需要认证
router.use(adminAuth);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

// 菜品管理
router.get('/dishes', dishController.getDishes);
router.get('/dishes/:id', dishController.getDish);
router.post('/dishes', dishController.createDish);
router.put('/dishes/:id', dishController.updateDish);
router.delete('/dishes/:id', dishController.deleteDish);
router.post('/dishes/batch/status', dishController.batchUpdateStatus);

// 分类管理
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// 订单管理
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// 评价管理
router.get('/reviews', reviewController.getReviews);
router.put('/reviews/:id/reply', reviewController.replyReview);
router.delete('/reviews/:id', reviewController.deleteReview);

// 用户管理
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);
router.put('/users/:id/status', userController.updateUserStatus);

// 数据统计
router.get('/statistics/overview', statisticsController.getOverview);
router.get('/statistics/sales', statisticsController.getSalesStatistics);

// 文件上传
router.post('/upload/image', upload.single('image'), uploadController.uploadImage);
router.post('/upload/images', upload.array('images', 5), uploadController.uploadImages);

module.exports = router;
