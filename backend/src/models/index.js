/**
 * 模型索引文件 - 定义模型关联关系
 */
const sequelize = require('../config/database');
const User = require('./User');
const Admin = require('./Admin');
const Category = require('./Category');
const Dish = require('./Dish');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Address = require('./Address');

// 定义模型关联关系

// User <-> Order (一对多)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Review (一对多)
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Address (一对多)
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category <-> Dish (一对多)
Category.hasMany(Dish, { foreignKey: 'category_id', as: 'dishes' });
Dish.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Order <-> OrderItem (一对多)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Dish <-> OrderItem (一对多)
Dish.hasMany(OrderItem, { foreignKey: 'dish_id', as: 'orderItems' });
OrderItem.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

// Dish <-> Review (一对多)
Dish.hasMany(Review, { foreignKey: 'dish_id', as: 'reviews' });
Review.belongsTo(Dish, { foreignKey: 'dish_id', as: 'dish' });

// Order <-> Review (一对多)
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = {
  sequelize,
  User,
  Admin,
  Category,
  Dish,
  Order,
  OrderItem,
  Review,
  Address
};
