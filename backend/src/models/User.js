/**
 * 用户模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '微信openid'
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1正常 0禁用'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['openid'] },
    { fields: ['phone'] },
    { fields: ['status'] }
  ]
});

module.exports = User;
