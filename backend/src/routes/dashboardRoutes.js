// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router  = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Auth diterapkan di master router api.js
router.get('/stats', dashboardController.getStats);
router.get('/chart', dashboardController.getChartData);

module.exports = router;
