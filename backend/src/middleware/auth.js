/**
 * JWT认证中间件
 */
const jwt = require('jsonwebtoken');
const { Admin, User } = require('../models');

/**
 * 管理员认证中间件
 */
const adminAuth = async (req, res, next) => {
  try {
    // 从header中获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '无权限访问'
      });
    }

    // 查询管理员信息
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || admin.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '管理员不存在或已被禁用'
      });
    }

    // 将管理员信息添加到请求对象
    req.admin = {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期'
      });
    }
    
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效'
    });
  }
};

/**
 * 用户认证中间件（移动端）
 */
const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'user') {
      return res.status(403).json({
        code: 403,
        message: '无权限访问'
      });
    }

    const user = await User.findByPk(decoded.id);
    
    if (!user || user.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用'
      });
    }

    req.user = {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期'
      });
    }
    
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效'
    });
  }
};

module.exports = {
  adminAuth,
  userAuth
};
