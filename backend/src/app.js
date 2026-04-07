require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const routeRoutes = require('./routes/route');
const orderRoutes = require('./routes/order');
const vertiportRoutes = require('./routes/vertiport');
const adminRoutes = require('./routes/admin');
const pilotRoutes = require('./routes/pilot');

const app = express();
const server = http.createServer(app);

// ========== Middleware ==========

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// ========== Health Check ==========

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '飞行汽车运营平台',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready' });
});

// ========== API Routes ==========

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/vertiports', vertiportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/pilot', pilotRoutes);

// ========== Error Handling ==========

app.use(notFoundHandler);
app.use(errorHandler);

// ========== Start Server ==========

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 飞行汽车运营平台服务启动成功`);
  logger.info(`📡 服务地址: http://localhost:${PORT}`);
  logger.info(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

module.exports = app;
