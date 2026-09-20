const express = require('express');
const router = express.Router();
const { getStates, getDistrictsByState } = require('../controllers/locationController');

// Public Master Location Endpoints
router.get('/states', getStates);
router.get('/states/:stateId/districts', getDistrictsByState);

module.exports = router;
