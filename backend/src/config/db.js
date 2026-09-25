// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Verifikasi koneksi saat aplikasi start (FR-6)
pool.connect()
  .then((client) => {
    console.log('✅ Koneksi ke database PostgreSQL berhasil:', process.env.DB_NAME);
    client.release();
  })
  .catch((err) => {
    console.error('❌ Gagal terkoneksi ke database:', err.message);
    process.exit(1); // hentikan aplikasi jika DB tidak bisa diakses
  });

module.exports = pool;
