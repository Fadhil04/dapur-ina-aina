require('dotenv').config();

// Validasi env wajib sebelum apapun
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET wajib di-set di file .env');
  process.exit(1);
}

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/v1', require('./src/routes/api'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend API berjalan di http://localhost:${PORT}`));

module.exports = app;
