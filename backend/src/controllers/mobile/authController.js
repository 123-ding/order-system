/**
 * 移动端 - 微信登录控制器
 */
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const wechatService = require('../../services/wechat');

exports.wechatLogin = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少微信授权code'
      });
    }

    // 通过code获取openid和用户信息
    const wechatUserInfo = await wechatService.getUserInfoByCode(code);

    // 查找或创建用户
    let user = await User.findOne({ where: { openid: wechatUserInfo.openid } });

    if (!user) {
      user = await User.create({
        openid: wechatUserInfo.openid,
        nickname: wechatUserInfo.nickname,
        avatar: wechatUserInfo.headimgurl
      });
    }

    // 生成token
    const token = jwt.sign(
      { id: user.id, openid: user.openid, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'nickname', 'avatar', 'phone']
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserInfo = async (req, res, next) => {
  try {
    const { nickname, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.update({ nickname, phone });

    res.json({
      code: 200,
      message: '更新成功',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
