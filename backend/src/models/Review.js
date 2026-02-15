/**
 * 评价模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  dish_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '菜品ID'
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '评分 1-5'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '评价内容'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片JSON数组'
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商家回复'
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['dish_id'] },
    { fields: ['order_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Review;
