/**
 * 管理员 - 订单管理控制器
 */
const { Order, OrderItem, User, Dish } = require('../../models');
const { Op } = require('sequelize');

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, status, startDate, endDate } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone'] },
        { model: OrderItem, as: 'items' }
      ],
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

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: OrderItem, as: 'items', include: [{ model: Dish, as: 'dish' }] }
      ]
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '获取成功', data: order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    await order.update({ status });
    res.json({ code: 200, message: '更新成功', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
