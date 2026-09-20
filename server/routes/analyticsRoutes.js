const express = require('express');
const router = express.Router();
const { getFarmerImpactAnalytics } = require('../controllers/analyticsController');

router.get('/impact', getFarmerImpactAnalytics);

module.exports = router;
