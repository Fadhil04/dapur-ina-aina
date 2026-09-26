// backend/src/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const authController = require('../controllers/authController');

router.post('/login',  validate(authController.loginSchema), authController.login);
router.get('/me',      verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
