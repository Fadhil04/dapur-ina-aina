// backend/src/routes/stockRoutes.js
const express = require('express');
const router  = express.Router();
const validate = require('../middlewares/validator');
const stockController = require('../controllers/stockController');

// Semua route stock hanya untuk admin (auth diterapkan di master router api.js)
router.get('/',              stockController.listStock);
router.post('/adjust',       validate(stockController.adjustSchema), stockController.adjustStock);
router.get('/:id/history',   stockController.getStockHistory);

module.exports = router;
