const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { maskPhone } = require('../utils/mask');
const { loginLimiter, smsLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/v1/auth/sms/send - 发送短信验证码
 */
router.post('/sms/send', smsLimiter, async (req, res, next) => {
  try {
    const { phone, type } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return ResponseHelper.badRequest(res, '手机号格式不正确', [
        { field: 'phone', message: '请输入有效的手机号' },
      ]);
    }

    if (!type || !['login', 'register', 'reset'].includes(type)) {
      return ResponseHelper.badRequest(res, '验证码类型无效');
    }

    // TODO: 实际发送短信逻辑
    // 1. 生成 6 位验证码
    // 2. 存入 Redis（5分钟过期）
    // 3. 调用短信服务发送

    return ResponseHelper.success(res, { expireIn: 300 }, '验证码已发送');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/phone/login - 手机号登录/注册
 */
router.post('/phone/login', loginLimiter, async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return ResponseHelper.badRequest(res, '手机号格式不正确');
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return ResponseHelper.badRequest(res, '验证码格式不正确');
    }

    // TODO: 实际登录逻辑
    // 1. 从 Redis 获取验证码并校验
    // 2. 查询或创建用户
    // 3. 生成 JWT token

    return ResponseHelper.success(res, {
      accessToken: 'jwt_access_token_placeholder',
      refreshToken: 'jwt_refresh_token_placeholder',
      expiresIn: 7200,
      user: {
        id: 1,
        phone: maskPhone(phone),
        nickname: '飞行旅客',
        idVerified: false,
        memberLevel: 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/wechat/login - 微信登录
 */
router.post('/wechat/login', loginLimiter, async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return ResponseHelper.badRequest(res, '微信授权码不能为空');
    }

    // TODO: 实际微信登录逻辑
    // 1. 用 code 换取 openid
    // 2. 查询或创建用户
    // 3. 生成 JWT token

    return ResponseHelper.success(res, {
      accessToken: 'jwt_access_token_placeholder',
      refreshToken: 'jwt_refresh_token_placeholder',
      expiresIn: 7200,
      user: {
        id: 1,
        nickname: '微信用户',
        idVerified: false,
        memberLevel: 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/token/refresh - 刷新 Token
 */
router.post('/token/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHelper.badRequest(res, 'refreshToken 不能为空');
    }

    // TODO: 验证 refreshToken 并生成新 token

    return ResponseHelper.success(res, {
      accessToken: 'new_jwt_access_token',
      expiresIn: 7200,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/verify/identity - 实名认证
 */
router.post('/verify/identity', async (req, res, next) => {
  try {
    const { realName, idCard } = req.body;

    if (!realName || !idCard) {
      return ResponseHelper.badRequest(res, '姓名和身份证号不能为空');
    }

    // TODO: 实际实名认证逻辑
    // 1. 调用第三方实名认证 API
    // 2. 更新用户实名认证状态

    return ResponseHelper.success(res, { verified: true }, '实名认证成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
