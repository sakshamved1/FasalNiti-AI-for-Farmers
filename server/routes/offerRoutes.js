const express = require('express');
const router = express.Router();
const { getOffers, createOffer, counterOffer, acceptOffer, getOrders } = require('../controllers/offerController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getOffers);
router.get('/listing/:listingId', optionalAuth, getOffers);
router.post('/', optionalAuth, createOffer);
router.post('/:id/counter', optionalAuth, counterOffer);
router.post('/:id/accept', optionalAuth, acceptOffer);
router.get('/orders/all', getOrders);

module.exports = router;
