/**
 * 管理员模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码hash'
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '昵称'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 1正常 0禁用'
  }
}, {
  tableName: 'admins',
  timestamps: true,
  indexes: [
    { fields: ['username'] },
    { fields: ['status'] }
  ]
});

module.exports = Admin;
