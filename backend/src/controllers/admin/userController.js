/**
 * 管理员 - 用户管理控制器
 */
const { User, Order, Review } = require('../../models');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['openid'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Order, as: 'orders', limit: 10 },
        { model: Review, as: 'reviews', limit: 10 }
      ]
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 200, message: '获取成功', data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    await user.update({ status });
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
