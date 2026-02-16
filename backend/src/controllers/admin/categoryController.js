/**
 * 管理员 - 分类管理控制器
 */
const { Category } = require('../../models');
const { Op } = require('sequelize');

/**
 * 获取分类列表
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建分类
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, sort, parent_id } = req.body;

    const category = await Category.create({
      name,
      icon,
      sort: sort || 0,
      parent_id: parent_id || 0
    });

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新分类
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }

    await category.update(updateData);

    res.json({
      code: 200,
      message: '更新成功',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除分类
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }

    await category.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
