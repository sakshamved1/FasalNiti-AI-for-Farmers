const { handleKisanMitraQuery } = require('../services/aiAssistantService');
const { analyzeCropQuality } = require('../services/cropQualityService');
const { isInMemory, memoryStore } = require('../utils/db');

// POST /api/ai/chat (KisanMitra Multilingual Q&A)
const chatWithKisanMitra = async (req, res) => {
  try {
    const { query, language = 'hi', farmerProfile, history = [] } = req.body;

    let platformData = {};
    if (isInMemory()) {
      platformData = {
        markets: memoryStore.markets,
        marketPrices: memoryStore.marketPrices,
        schemes: memoryStore.governmentSchemes,
        buyers: memoryStore.users.filter(u => u.role === 'BUYER')
      };
    } else {
      try {
        const Market = require('../models/Market');
        const MarketPrice = require('../models/MarketPrice');
        const GovernmentScheme = require('../models/GovernmentScheme');
        const User = require('../models/User');

        platformData = {
          markets: await Market.find().limit(20).lean(),
          marketPrices: await MarketPrice.find().sort({ modalPrice: -1 }).limit(30).lean(),
          schemes: await GovernmentScheme.find().limit(10).lean(),
          buyers: await User.find({ role: 'BUYER' }).limit(10).lean()
        };
      } catch (dbErr) {
        console.warn('Could not prefetch platform data from DB:', dbErr.message);
      }
    }

    const userProfile = farmerProfile || (req.user ? {
      name: req.user.name,
      role: req.user.role,
      state: req.user.state,
      district: req.user.district,
      village: req.user.village,
      preferredLanguage: req.user.preferredLanguage,
      ...(req.user.farmerDetails || {})
    } : { state: 'Madhya Pradesh', district: 'Indore', landSizeAcres: 2.0, primaryCrops: ['Soybean', 'Wheat'] });

    const response = await handleKisanMitraQuery({
      query,
      language,
      farmerProfile: userProfile,
      platformData,
      history
    });

    res.json({
      success: true,
      ...response
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/quality (Crop Quality Scanner)
const assessCropQuality = async (req, res) => {
  try {
    const { cropName = 'Soybean', imageBase64, filename } = req.body;

    const analysis = await analyzeCropQuality({
      cropName,
      imageBase64,
      filename
    });

    res.json({
      success: true,
      quality: analysis
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/voice (Voice assistant processor)
const processVoiceCommand = async (req, res) => {
  try {
    const { transcript, language = 'hi', farmerProfile, history = [] } = req.body;

    let platformData = {};
    if (isInMemory()) {
      platformData = {
        markets: memoryStore.markets,
        marketPrices: memoryStore.marketPrices,
        schemes: memoryStore.governmentSchemes
      };
    } else {
      try {
        const Market = require('../models/Market');
        const MarketPrice = require('../models/MarketPrice');
        const GovernmentScheme = require('../models/GovernmentScheme');

        platformData = {
          markets: await Market.find().limit(20).lean(),
          marketPrices: await MarketPrice.find().sort({ modalPrice: -1 }).limit(30).lean(),
          schemes: await GovernmentScheme.find().limit(10).lean()
        };
      } catch (dbErr) {
        console.warn('Could not prefetch voice platform data:', dbErr.message);
      }
    }

    const userProfile = farmerProfile || (req.user ? {
      name: req.user.name,
      role: req.user.role,
      state: req.user.state,
      district: req.user.district,
      village: req.user.village,
      preferredLanguage: req.user.preferredLanguage,
      ...(req.user.farmerDetails || {})
    } : { state: 'Madhya Pradesh', district: 'Indore', landSizeAcres: 2.0, primaryCrops: ['Soybean', 'Wheat'] });

    const response = await handleKisanMitraQuery({
      query: transcript,
      language,
      farmerProfile: userProfile,
      platformData,
      history
    });

    res.json({
      success: true,
      recognizedText: transcript,
      ...response
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  chatWithKisanMitra,
  assessCropQuality,
  processVoiceCommand
};
