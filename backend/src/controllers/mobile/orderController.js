/**
 * 移动端 - 订单控制器
 */
const { Order, OrderItem, Dish } = require('../../models');
const { Op } = require('sequelize');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, delivery_date, delivery_address, remark } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ code: 400, message: '订单不能为空' });
    }

    // 生成订单号
    const order_no = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

    // 计算总金额
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findByPk(item.dish_id);
      if (!dish || dish.status !== 1) {
        return res.status(400).json({ code: 400, message: `菜品${item.dish_id}不存在或已下架` });
      }

      const itemTotal = parseFloat(dish.price) * item.quantity;
      total_amount += itemTotal;

      orderItems.push({
        dish_id: dish.id,
        dish_name: dish.name,
        price: dish.price,
        quantity: item.quantity
      });
    }

    // 创建订单
    const order = await Order.create({
      order_no,
      user_id: req.user.id,
      total_amount,
      delivery_date,
      delivery_address,
      remark,
      status: 1
    });

    // 创建订单详情
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      });

      // 更新菜品销量
      await Dish.increment('sales', {
        by: item.quantity,
        where: { id: item.dish_id }
      });
    }

    res.status(201).json({
      code: 201,
      message: '下单成功',
      data: { order_id: order.id, order_no: order.order_no }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
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
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Dish, as: 'dish' }] }]
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '获取成功', data: order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    if (order.status !== 1) {
      return res.status(400).json({ code: 400, message: '订单状态不允许取消' });
    }

    await order.update({ status: 5 });
    res.json({ code: 200, message: '取消成功' });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
