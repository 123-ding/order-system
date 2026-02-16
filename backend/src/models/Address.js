/**
 * 收货地址模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
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
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '联系人'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '电话'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '详细地址'
  },
  is_default: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否默认: 1是 0否'
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_default'] }
  ]
});

module.exports = Address;
