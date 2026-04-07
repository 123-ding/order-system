const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { authenticate } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/user/profile - 获取用户信息
 */
router.get('/profile', async (req, res, next) => {
  try {
    // TODO: 从数据库查询用户完整信息
    return ResponseHelper.success(res, {
      id: req.user.id,
      uuid: req.user.uuid,
      phone: '138****8000',
      nickname: '飞行旅客',
      avatar: null,
      gender: 0,
      idVerified: true,
      memberLevel: 1,
      totalMileage: 125.50,
      totalFlights: 8,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/user/profile - 更新用户信息
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { nickname, avatar, gender } = req.body;

    // TODO: 更新用户信息到数据库

    return ResponseHelper.success(res, null, '用户信息更新成功');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/user/addresses - 获取常用地址
 */
router.get('/addresses', async (req, res, next) => {
  try {
    // TODO: 从数据库查询用户常用地址
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/user/addresses - 添加常用地址
 */
router.post('/addresses', async (req, res, next) => {
  try {
    const { name, vertiportId, latitude, longitude, isDefault } = req.body;

    if (!name || !latitude || !longitude) {
      return ResponseHelper.badRequest(res, '地址信息不完整');
    }

    // TODO: 保存地址到数据库

    return ResponseHelper.success(res, { id: 1 }, '地址添加成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/user/emergency-contacts - 获取紧急联系人
 */
router.get('/emergency-contacts', async (req, res, next) => {
  try {
    // TODO: 从数据库查询
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/user/emergency-contacts - 添加紧急联系人
 */
router.post('/emergency-contacts', async (req, res, next) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone || !relationship) {
      return ResponseHelper.badRequest(res, '联系人信息不完整');
    }

    // TODO: 保存到数据库

    return ResponseHelper.success(res, { id: 1 }, '紧急联系人添加成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/user/coupons - 获取用户优惠券
 */
router.get('/coupons', async (req, res, next) => {
  try {
    // TODO: 查询用户优惠券
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/user/flight-stats - 飞行里程与统计
 */
router.get('/flight-stats', async (req, res, next) => {
  try {
    // TODO: 查询用户飞行统计
    return ResponseHelper.success(res, {
      totalFlights: 8,
      totalMileage: 125.50,
      totalSpent: 2456.00,
      memberLevel: 1,
      memberLevelName: '普通会员',
      nextLevelMileage: 500,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/user/notifications - 消息通知列表
 */
router.get('/notifications', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // TODO: 查询通知列表
    return ResponseHelper.paginate(res, [], {
      page,
      pageSize,
      total: 0,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/user/notifications/read-all - 全部已读
 */
router.put('/notifications/read-all', async (req, res, next) => {
  try {
    // TODO: 标记全部已读
    return ResponseHelper.success(res, null, '全部标记已读');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
