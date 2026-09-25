// backend/src/routes/orderRoutes.js
const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const orderController   = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

// Public — pelanggan checkout
router.post('/checkout', validate(orderController.checkoutSchema), orderController.checkout);

// Protected — kasir & admin
router.get('/',        verifyToken, orderController.listOrders);
router.get('/counts',  verifyToken, orderController.getOrderCounts);
router.get('/:id',     verifyToken, orderController.getOrderById);
router.post('/:id/pay', verifyToken, validate(paymentController.paySchema), paymentController.processPayment);

module.exports = router;
