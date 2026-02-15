/**
 * 管理员 - 数据统计控制器
 */
const { Order, OrderItem, User, Dish } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

exports.getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日订单统计
    const todayOrders = await Order.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    // 今日销售额
    const todaySales = await Order.sum('total_amount', {
      where: {
        created_at: { [Op.gte]: today },
        status: { [Op.notIn]: [5] } // 排除已取消
      }
    }) || 0;

    // 总用户数
    const totalUsers = await User.count();

    // 总菜品数
    const totalDishes = await Dish.count({ where: { status: 1 } });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        todayOrders,
        todaySales,
        totalUsers,
        totalDishes
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalesStatistics = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    // 获取最近N天的销售数据
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'amount']
      ],
      where: {
        created_at: { [Op.gte]: startDate },
        status: { [Op.notIn]: [5] }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
