const rateLimit = require('express-rate-limit');

/**
 * API 限流中间件
 */
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per minute
  message: {
    code: 42900,
    message: '请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 登录接口限流（更严格）
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per 15 minutes
  message: {
    code: 42900,
    message: '登录尝试过于频繁，请15分钟后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 短信验证码限流
 */
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 request per minute per IP
  message: {
    code: 42900,
    message: '验证码发送过于频繁，请1分钟后再试',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter, loginLimiter, smsLimiter };
