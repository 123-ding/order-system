require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const vesselRoutes = require('./routes/vessels');
const routeRoutes = require('./routes/routes');
const cargoRoutes = require('./routes/cargo');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/vessels', apiLimiter, vesselRoutes);
app.use('/api/routes', apiLimiter, routeRoutes);
app.use('/api/cargo', apiLimiter, cargoRoutes);
app.use('/api/users', apiLimiter, userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Maritime Logistics Backend running on port ${PORT}`);
});

module.exports = app;
