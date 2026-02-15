/**
 * 菜品模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dish = sequelize.define('Dish', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '菜品名称'
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '分类ID'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片JSON数组'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 999,
    comment: '库存'
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '销量'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00,
    comment: '平均评分'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1上架 0下架'
  },
  is_recommended: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否推荐: 1是 0否'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '软删除时间'
  }
}, {
  tableName: 'dishes',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['is_recommended'] },
    { fields: ['deleted_at'] }
  ]
});

module.exports = Dish;
