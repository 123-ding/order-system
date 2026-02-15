/**
 * 订单详情模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  dish_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '菜品ID'
  },
  dish_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '菜品名称快照'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格快照'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['dish_id'] }
  ]
});

module.exports = OrderItem;
