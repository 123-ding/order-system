/**
 * 订单模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总金额'
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '配送日期'
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配送地址'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1待处理 2已接单 3配送中 4已完成 5已取消'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['order_no'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['delivery_date'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Order;
