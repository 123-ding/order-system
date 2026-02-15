/**
 * 管理员 - 评价管理控制器
 */
const { Review, User, Dish } = require('../../models');

exports.getReviews = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, dish_id } = req.query;
    const where = {};
    if (dish_id) where.dish_id = dish_id;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
        { model: Dish, as: 'dish', attributes: ['id', 'name'] }
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

exports.replyReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ code: 404, message: '评价不存在' });
    }

    await review.update({ reply });
    res.json({ code: 200, message: '回复成功', data: review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ code: 404, message: '评价不存在' });
    }

    await review.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
