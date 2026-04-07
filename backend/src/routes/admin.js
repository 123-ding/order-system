const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { authenticate, authorize } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/v1/admin/auth/login - 管理员登录
 */
router.post('/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return ResponseHelper.badRequest(res, '用户名和密码不能为空');
    }

    // TODO: 实际登录逻辑
    // 1. 查询管理员
    // 2. 验证密码
    // 3. 生成 JWT

    return ResponseHelper.success(res, {
      accessToken: 'admin_jwt_token_placeholder',
      expiresIn: 7200,
      admin: {
        id: 1,
        username,
        name: '系统管理员',
        role: 'super_admin',
      },
    });
  } catch (err) {
    next(err);
  }
});

// Below routes require admin authentication
router.use(authenticate);
router.use(authorize('super_admin', 'admin', 'operator'));

/**
 * GET /api/v1/admin/dashboard/overview - 运营概览
 */
router.get('/dashboard/overview', async (req, res, next) => {
  try {
    // TODO: 从数据库聚合查询运营数据

    return ResponseHelper.success(res, {
      today: {
        orders: 156,
        revenue: 45680.00,
        flights: 142,
        activeVehicles: 28,
        onlinePilots: 35,
        activeUsers: 1256,
      },
      comparison: {
        ordersGrowth: 12.5,
        revenueGrowth: 8.3,
        flightsGrowth: 10.1,
      },
      alerts: [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/dashboard/vehicles/realtime - 实时车辆位置
 */
router.get('/dashboard/vehicles/realtime', async (req, res, next) => {
  try {
    // TODO: 从 Redis 获取实时车辆位置

    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/orders - 订单管理列表
 */
router.get('/orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // TODO: 查询订单列表

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
 * GET /api/v1/admin/vehicles - 车辆管理列表
 */
router.get('/vehicles', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // TODO: 查询车辆列表

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
 * GET /api/v1/admin/pilots - 飞行员管理列表
 */
router.get('/pilots', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // TODO: 查询飞行员列表

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
 * GET /api/v1/admin/users - 用户管理列表
 */
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // TODO: 查询用户列表

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
 * GET /api/v1/admin/vertiports - 起降点管理
 */
router.get('/vertiports', async (req, res, next) => {
  try {
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/routes - 航线管理
 */
router.get('/routes', async (req, res, next) => {
  try {
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/airspaces - 空域管理
 */
router.get('/airspaces', async (req, res, next) => {
  try {
    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/finance/revenue - 收入统计
 */
router.get('/finance/revenue', async (req, res, next) => {
  try {
    return ResponseHelper.success(res, {
      totalRevenue: 0,
      dailyRevenue: [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/reviews - 评价管理
 */
router.get('/reviews', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

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
 * GET /api/v1/admin/system/logs - 操作日志
 */
router.get('/system/logs', authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    return ResponseHelper.paginate(res, [], {
      page,
      pageSize,
      total: 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
