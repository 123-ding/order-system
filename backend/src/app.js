require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Maritime Logistics Backend running on port ${PORT}`);
});

module.exports = app;
