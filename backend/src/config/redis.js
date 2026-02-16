/**
 * Redis配置
 */
require('dotenv').config();
const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: 0
});

redisClient.on('connect', () => {
  console.log('✅ Redis连接成功');
});

redisClient.on('error', (err) => {
  console.warn('⚠️  Redis连接失败 (Demo模式下可忽略):', err.message);
});

// 连接Redis
redisClient.connect().catch((err) => {
  console.warn('⚠️  Redis未启动 (Demo模式下可忽略)');
});

module.exports = redisClient;
