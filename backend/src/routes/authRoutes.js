// backend/src/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const authController = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,                    // maksimal 5 percobaan login per IP
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate(authController.loginSchema), authController.login);
router.get('/me',      verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
