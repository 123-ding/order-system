const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/v1/routes/search - 搜索航线
 */
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const { departureId, arrivalId, date } = req.query;

    if (!departureId || !arrivalId) {
      return ResponseHelper.badRequest(res, '请选择出发地和目的地');
    }

    // TODO: 从数据库查询匹配的航线和航班时刻

    return ResponseHelper.success(res, {
      route: {
        id: 1,
        routeCode: 'RT001',
        name: '国贸CBD - 首都机场',
        distance: 25.50,
        estimatedDuration: 15,
        basePrice: 299.00,
        departure: {
          id: 1,
          name: '国贸CBD起降场',
          latitude: 39.9087,
          longitude: 116.4605,
        },
        arrival: {
          id: 2,
          name: '首都机场起降场',
          latitude: 40.0799,
          longitude: 116.6031,
        },
      },
      schedules: [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/routes/popular - 获取热门航线
 */
router.get('/popular', optionalAuth, async (req, res, next) => {
  try {
    const { city, limit } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 10, 50);

    // TODO: 从数据库查询热门航线

    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/routes/:routeId - 获取航线详情
 */
router.get('/:routeId', optionalAuth, async (req, res, next) => {
  try {
    const { routeId } = req.params;

    if (!routeId || isNaN(routeId)) {
      return ResponseHelper.badRequest(res, '航线ID无效');
    }

    // TODO: 从数据库查询航线详情

    return ResponseHelper.success(res, {
      id: parseInt(routeId, 10),
      routeCode: 'RT001',
      name: '国贸CBD - 首都机场',
      distance: 25.50,
      estimatedDuration: 15,
      basePrice: 299.00,
      minAltitude: 100,
      maxAltitude: 500,
      status: 1,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
