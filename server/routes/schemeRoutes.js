const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemesByLocation,
  checkEligibility,
  getHelpDeskOffices,
  createGrievance,
  getGrievanceByTracking
} = require('../controllers/schemeController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getSchemes);
router.get('/by-location', optionalAuth, getSchemesByLocation);
router.post('/eligibility', optionalAuth, checkEligibility);
router.get('/offices', getHelpDeskOffices);
router.get('/offices/:state', getHelpDeskOffices);
router.get('/offices/:state/:district', getHelpDeskOffices);
router.post('/grievance', optionalAuth, createGrievance);
router.get('/grievance/:trackingNumber', getGrievanceByTracking);

module.exports = router;

