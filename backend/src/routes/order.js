const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const config = require('../config');
const { authenticate } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/orders - 创建订单
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      routeId, scheduleId, flightDate, passengerCount,
      passengers, luggageWeight, seatPreference, specialRequirements, couponId,
    } = req.body;

    // 参数验证
    if (!routeId || !flightDate || !passengerCount) {
      return ResponseHelper.badRequest(res, '订单信息不完整');
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return ResponseHelper.badRequest(res, '请填写乘客信息');
    }

    if (luggageWeight && luggageWeight > 10) {
      return ResponseHelper.badRequest(res, '行李重量不能超过10kg');
    }

    // TODO: 实际创建订单逻辑
    // 1. 查询航线和航班信息
    // 2. 检查座位可用性
    // 3. 计算价格
    // 4. 创建订单记录
    // 5. 锁定座位

    const orderNo = `FC${flightDate.replace(/-/g, '')}${String(Date.now()).slice(-6)}`;

    // 使用配置中的定价参数
    const { insuranceFee, serviceFeeRate } = config.order;
    // TODO: 从数据库查询实际航线价格，这里为示例占位
    const routeBasePrice = 299.00;
    const baseTotal = routeBasePrice * passengerCount;
    const totalInsurance = insuranceFee * passengerCount;
    const serviceFee = parseFloat((baseTotal * serviceFeeRate).toFixed(2));
    const totalPrice = parseFloat((baseTotal + totalInsurance + serviceFee).toFixed(2));

    return ResponseHelper.success(res, {
      orderId: 1001,
      orderNo,
      status: 1,
      statusText: '待确认',
      flightDate,
      priceDetail: {
        basePrice: baseTotal,
        surgeAmount: 0,
        insuranceFee: totalInsurance,
        serviceFee,
        discountAmount: 0,
        totalPrice,
      },
    }, '订单创建成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/orders - 获取订单列表
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const { status } = req.query;

    // TODO: 从数据库查询用户订单

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
 * GET /api/v1/orders/:orderId - 获取订单详情
 */
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId || isNaN(orderId)) {
      return ResponseHelper.badRequest(res, '订单ID无效');
    }

    // TODO: 从数据库查询订单详情

    return ResponseHelper.notFound(res, '订单不存在');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/orders/:orderId/cancel - 取消订单
 */
router.post('/:orderId/cancel', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId || isNaN(orderId)) {
      return ResponseHelper.badRequest(res, '订单ID无效');
    }

    // TODO: 实际取消订单逻辑
    // 1. 查询订单
    // 2. 检查是否可取消
    // 3. 计算退款金额
    // 4. 更新订单状态
    // 5. 发起退款

    return ResponseHelper.success(res, {
      orderId: parseInt(orderId, 10),
      status: 8,
      statusText: '已取消',
      refundAmount: 0,
    }, '订单已取消');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/orders/:orderId/tracking - 实时追踪航班
 */
router.get('/:orderId/tracking', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId || isNaN(orderId)) {
      return ResponseHelper.badRequest(res, '订单ID无效');
    }

    // TODO: 从 Redis/数据库获取实时位置信息

    return ResponseHelper.success(res, {
      orderId: parseInt(orderId, 10),
      status: 4,
      statusText: '飞行中',
      currentPosition: null,
      progress: 0,
      estimatedArrival: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
