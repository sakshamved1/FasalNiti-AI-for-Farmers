const express = require('express');
const router = express.Router();
const { getTransporters, getWarehouses, calculateRealProfit } = require('../controllers/logisticsController');

router.get('/transporters', getTransporters);
router.get('/warehouses', getWarehouses);
router.post('/calculator', calculateRealProfit);
router.get('/calculator', calculateRealProfit);
router.post('/estimate-freight', calculateRealProfit);
router.get('/estimate-freight', calculateRealProfit);
router.post('/estimate', calculateRealProfit);

module.exports = router;

