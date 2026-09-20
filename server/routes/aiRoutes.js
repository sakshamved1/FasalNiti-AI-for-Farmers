const express = require('express');
const router = express.Router();
const { chatWithKisanMitra, assessCropQuality, processVoiceCommand } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, chatWithKisanMitra);
router.post('/quality', assessCropQuality);
router.post('/voice', optionalAuth, processVoiceCommand);

module.exports = router;
