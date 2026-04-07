const logger = require('../utils/logger');
const ResponseHelper = require('../utils/response');

/**
 * 404 处理中间件
 */
function notFoundHandler(req, res) {
  ResponseHelper.notFound(res, `接口 ${req.method} ${req.originalUrl} 不存在`);
}

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err.name === 'ValidationError') {
    return ResponseHelper.badRequest(res, err.message);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return ResponseHelper.unauthorized(res, '认证无效，请重新登录');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHelper.unauthorized(res, '登录已过期，请重新登录');
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message;

  return ResponseHelper.error(res, 50000, message, statusCode);
}

module.exports = { notFoundHandler, errorHandler };
