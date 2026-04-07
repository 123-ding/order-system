const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/v1/vertiports/nearby - 获取附近起降点
 */
router.get('/nearby', optionalAuth, async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return ResponseHelper.badRequest(res, '请提供位置坐标');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return ResponseHelper.badRequest(res, '坐标格式不正确');
    }

    // TODO: 从数据库查询附近起降点
    // 使用 Haversine 公式计算距离

    return ResponseHelper.success(res, [
      {
        id: 1,
        name: '国贸CBD起降场',
        code: 'VP001',
        address: '北京市朝阳区国贸CBD中心广场',
        latitude: 39.9087,
        longitude: 116.4605,
        distance: 2.5,
        availableSlots: 5,
        status: 1,
      },
    ]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/vertiports - 获取所有起降点列表
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { city, status } = req.query;

    // TODO: 从数据库查询起降点列表

    return ResponseHelper.success(res, []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/vertiports/:id - 获取起降点详情
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return ResponseHelper.badRequest(res, '起降点ID无效');
    }

    // TODO: 从数据库查询起降点详情

    return ResponseHelper.success(res, {
      id: parseInt(id, 10),
      name: '国贸CBD起降场',
      code: 'VP001',
      address: '北京市朝阳区国贸CBD中心广场',
      city: '北京',
      district: '朝阳区',
      latitude: 39.9087,
      longitude: 116.4605,
      capacity: 8,
      availableSlots: 5,
      chargingStations: 4,
      operatingHoursStart: '06:00',
      operatingHoursEnd: '22:00',
      status: 1,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
