/**
 * 分类模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '图标URL'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '父分类ID, 0表示顶级分类'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1启用 0禁用'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { fields: ['parent_id'] },
    { fields: ['status'] },
    { fields: ['sort'] }
  ]
});

module.exports = Category;
