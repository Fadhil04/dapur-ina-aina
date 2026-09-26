// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

// Verifikasi koneksi saat aplikasi start (FR-6)
pool.connect()
  .then((client) => {
    console.log('✅ Koneksi ke database PostgreSQL berhasil');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Gagal terkoneksi ke database:', err.message);
    // Jangan process.exit di production, biar Railway tidak crash-loop.
    // Biarkan server tetap jalan supaya kamu bisa lihat log & IP publik untuk debug.
    if (!isProduction) {
      process.exit(1);
    }
  });

module.exports = pool;