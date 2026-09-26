// backend/src/routes/menuRoutes.js
const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const menuController = require('../controllers/menuController');

// Public routes
router.get('/',           menuController.getMenu);
router.get('/categories', menuController.getCategories);
router.get('/:id',        menuController.getById);

// Admin-only routes
router.post('/',              verifyToken, requireRole('admin'), validate(menuController.createMenuSchema), menuController.createMenu);
router.put('/:id',            verifyToken, requireRole('admin'), validate(menuController.updateMenuSchema), menuController.updateMenu);
router.delete('/:id',         verifyToken, requireRole('admin'), menuController.deactivateMenu);
router.patch('/:id/activate', verifyToken, requireRole('admin'), menuController.activateMenu);

module.exports = router;
