const express = require('express');
const router = express.Router();
const { getListings, getListingById, createListing } = require('../controllers/listingController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', optionalAuth, createListing);

module.exports = router;
