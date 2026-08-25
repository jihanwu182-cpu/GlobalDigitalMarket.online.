const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve GlobalDigitalMarket.online frontend
const frontendPath = path.join(__dirname, '../../frontend');

app.use(express.static(frontendPath));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    platform: 'GlobalDigitalMarket.online',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use(`${process.env.API_PREFIX || '/api'}/auth`, require('./routes/authRoutes'));
app.use(`${process.env.API_PREFIX || '/api'}/users`, require('./routes/userRoutes'));
app.use(`${process.env.API_PREFIX || '/api'}/portfolio`, require('./routes/portfolioRoutes'));
app.use(`${process.env.API_PREFIX || '/api'}/trades`, require('./routes/tradeRoutes'));
app.use(`${process.env.API_PREFIX || '/api'}/market`, require('./routes/marketRoutes'));
app.use(`${process.env.API_PREFIX || '/api'}/wallet`, require('./routes/walletRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    logger.info(`GlobalDigitalMarket.online server running on port ${PORT}`);
  });
}

module.exports = app;
