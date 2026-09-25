// src/models/userModel.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async findByUsername(username) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = TRUE',
      [username]
    );
    return rows[0];
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, 10);
  },
};

module.exports = User;
