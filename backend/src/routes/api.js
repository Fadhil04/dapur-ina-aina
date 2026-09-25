// backend/src/routes/api.js — Master Router /api/v1
const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use('/auth',      require('./authRoutes'));
router.use('/menu',      require('./menuRoutes'));
router.use('/orders',    require('./orderRoutes'));
router.use('/stock',     verifyToken, requireRole('admin'), require('./stockRoutes'));
// [SEC-01 FIX] Dashboard juga harus dilindungi requireRole('admin')
router.use('/dashboard', verifyToken, requireRole('admin'), require('./dashboardRoutes'));

module.exports = router;
