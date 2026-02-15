/**
 * 移动端 - 菜品控制器
 */
const { Dish, Category, Review, User } = require('../../models');
const { Op } = require('sequelize');

exports.getDishes = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, category_id, keyword, is_recommended } = req.query;
    const where = { status: 1 };

    if (category_id) where.category_id = category_id;
    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    if (is_recommended) where.is_recommended = 1;

    const { count, rows } = await Dish.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['sales', 'DESC'], ['created_at', 'DESC']],
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

exports.getDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        {
          model: Review,
          as: 'reviews',
          limit: 5,
          include: [{ model: User, as: 'user', attributes: ['nickname', 'avatar'] }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!dish || dish.status !== 1) {
      return res.status(404).json({ code: 404, message: '菜品不存在或已下架' });
    }

    res.json({ code: 200, message: '获取成功', data: dish });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    });

    res.json({ code: 200, message: '获取成功', data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
