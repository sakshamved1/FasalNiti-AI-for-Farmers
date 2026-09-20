/**
 * KisanSetu AI - Commodity Master Routes
 */

const express = require('express');
const router = express.Router();
const commodityController = require('../controllers/commodityController');

// Search commodities
router.get('/search', commodityController.searchCommodities);

// Distinct categories
router.get('/categories', commodityController.getCategories);

// Get all commodities (paginated, filtered)
router.get('/', commodityController.getCommodities);

// Get single commodity
router.get('/:id', commodityController.getCommodityById);

module.exports = router;
