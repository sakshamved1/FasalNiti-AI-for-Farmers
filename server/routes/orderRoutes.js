const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStage } = require('../controllers/orderController');

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/stage', updateOrderStage);

module.exports = router;
