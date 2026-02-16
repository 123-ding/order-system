/**
 * 管理员 - 菜品管理控制器
 */
const { Dish, Category } = require('../../models');
const { Op } = require('sequelize');

/**
 * 获取菜品列表
 */
exports.getDishes = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      category_id,
      keyword,
      status
    } = req.query;

    const where = {};

    // 分类筛选
    if (category_id) {
      where.category_id = category_id;
    }

    // 关键词搜索
    if (keyword) {
      where.name = {
        [Op.like]: `%${keyword}%`
      };
    }

    // 状态筛选
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Dish.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取菜品详情
 */
exports.getDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!dish) {
      return res.status(404).json({
        code: 404,
        message: '菜品不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建菜品
 */
exports.createDish = async (req, res, next) => {
  try {
    const {
      name,
      category_id,
      price,
      description,
      images,
      stock,
      status,
      is_recommended
    } = req.body;

    // 验证分类是否存在
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        code: 400,
        message: '分类不存在'
      });
    }

    const dish = await Dish.create({
      name,
      category_id,
      price,
      description,
      images,
      stock: stock || 999,
      status: status !== undefined ? status : 1,
      is_recommended: is_recommended || 0
    });

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新菜品
 */
exports.updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({
        code: 404,
        message: '菜品不存在'
      });
    }

    // 如果更新分类，验证分类是否存在
    if (updateData.category_id) {
      const category = await Category.findByPk(updateData.category_id);
      if (!category) {
        return res.status(400).json({
          code: 400,
          message: '分类不存在'
        });
      }
    }

    await dish.update(updateData);

    res.json({
      code: 200,
      message: '更新成功',
      data: dish
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除菜品（软删除）
 */
exports.deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByPk(id);

    if (!dish) {
      return res.status(404).json({
        code: 404,
        message: '菜品不存在'
      });
    }

    await dish.destroy(); // 软删除

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 批量更新菜品状态
 */
exports.batchUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要更新的菜品ID'
      });
    }

    await Dish.update(
      { status },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json({
      code: 200,
      message: '批量更新成功'
    });
  } catch (error) {
    next(error);
  }
};
