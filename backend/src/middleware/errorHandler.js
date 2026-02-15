/**
 * 全局错误处理中间件
 */

/**
 * 404错误处理
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在'
  });
};

/**
 * 全局错误处理
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // Sequelize验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在，违反唯一性约束',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '违反外键约束，关联数据不存在'
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '认证令牌已过期'
    });
  }

  // Multer文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      message: '文件大小超过限制'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      code: 400,
      message: '文件数量超过限制'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      code: 400,
      message: '意外的文件字段'
    });
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
