// backend/src/controllers/authController.js
const jwt  = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/userModel');

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

exports.loginSchema = loginSchema;

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user || !(await User.verifyPassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
    const payload = { id_user: user.id_user, name_user: user.name_user, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, message: 'Login berhasil', data: { token, user: payload } });
  } catch (err) { next(err); }
};

exports.me = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logout berhasil' });
};
