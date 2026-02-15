/**
 * 管理员认证控制器
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../../models');

/**
 * 管理员登录
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      });
    }

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 检查状态
    if (admin.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前管理员信息
 */
exports.getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ['id', 'username', 'nickname', 'created_at']
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 退出登录
 */
exports.logout = async (req, res, next) => {
  try {
    // 实际应用中，可以将token加入黑名单
    res.json({
      code: 200,
      message: '退出成功'
    });
  } catch (error) {
    next(error);
  }
};
