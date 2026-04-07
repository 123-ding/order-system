module.exports = {
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME || 'flying_car_platform',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  // 微信配置
  wechat: {
    appId: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
    mchId: process.env.WECHAT_MCH_ID,
    apiKey: process.env.WECHAT_API_KEY,
  },

  // 订单配置
  order: {
    // 取消退款规则（分钟数 -> 退款比例）
    cancelPolicy: [
      { minutesBefore: 120, refundRate: 1.0 },   // 2小时前：全额退款
      { minutesBefore: 60, refundRate: 0.8 },     // 1-2小时：80%
      { minutesBefore: 30, refundRate: 0.5 },     // 30分钟-1小时：50%
      { minutesBefore: 0, refundRate: 0 },        // 30分钟内：不退
    ],
    // 保险费（元/人）
    insuranceFee: 10,
    // 服务费率
    serviceFeeRate: 0.05,
    // 最大预订天数
    maxAdvanceDays: 7,
    // 最小提前预订时间（分钟）
    minAdvanceMinutes: 30,
  },

  // 车辆配置
  vehicle: {
    // 最低接单电量（%）
    minBatteryForOrder: 30,
  },

  // 飞行员配置
  pilot: {
    // 最大连续飞行时间（小时）
    maxContinuousFlightHours: 8,
  },

  // 安全规则
  safety: {
    // 最低能见度（km）
    minVisibility: 1,
    // 最大风力等级
    maxWindLevel: 8,
  },
};
