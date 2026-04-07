const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/response');

/**
 * JWT 认证中间件
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseHelper.unauthorized(res, '请先登录');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ResponseHelper.unauthorized(res, '登录已过期，请重新登录');
    }
    return ResponseHelper.unauthorized(res, '认证无效，请重新登录');
  }
}

/**
 * 角色授权中间件
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHelper.forbidden(res, '无权限执行此操作');
    }

    next();
  };
}

/**
 * 可选认证中间件（不强制，但如果有 token 则解析）
 */
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Token invalid, but we don't block the request
      req.user = null;
    }
  }

  next();
}

module.exports = { authenticate, authorize, optionalAuth };
