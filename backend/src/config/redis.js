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
  console.error('❌ Redis连接失败:', err);
});

// 连接Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;
