const express = require('express');
const router = express.Router();
const { getPredictionForCrop } = require('../controllers/predictionController');

router.get('/:crop', getPredictionForCrop);

module.exports = router;
