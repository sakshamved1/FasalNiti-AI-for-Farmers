const express = require('express');
const router = express.Router();
const { 
  getMarkets, 
  getPrices, 
  getPriceHistory, 
  getNearbyMarkets, 
  getCrops 
} = require('../controllers/marketController');

router.get('/', getMarkets);
router.get('/search', getMarkets);
router.get('/all', getMarkets);
router.get('/nearby', getNearbyMarkets);
router.get('/prices', getPrices);
router.get('/history', getPriceHistory);
router.get('/:id/history', getPriceHistory);
router.get('/crops', getCrops);

module.exports = router;

