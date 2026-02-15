/**
 * Express应用入口文件
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由
const adminRoutes = require('./routes/admin');
const mobileRoutes = require('./routes/mobile');

// 导入中间件
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 导入数据库
require('./models');

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/admin', adminRoutes);
app.use('/api/mobile', mobileRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'Order System API is running',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 点菜系统后端服务启动成功');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('========================================');
});

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
