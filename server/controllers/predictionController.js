const { generateCropPrediction } = require('../services/pricePredictionService');
const { isInMemory, memoryStore } = require('../utils/db');

// GET /api/predictions/:crop
const getPredictionForCrop = async (req, res) => {
  try {
    const { crop } = req.params;
    const { market = 'Indore Krishi Upaj Mandi' } = req.query;

    let basePrice = 4500;
    if (isInMemory()) {
      const match = memoryStore.marketPrices.find(p => p.cropName.toLowerCase().includes(crop.toLowerCase()));
      if (match) basePrice = match.modalPrice;
    } else {
      const MarketPrice = require('../models/MarketPrice');
      const match = await MarketPrice.findOne({ cropName: new RegExp(crop, 'i') });
      if (match) basePrice = match.modalPrice;
    }

    const prediction = generateCropPrediction(crop, basePrice, market);
    res.json({
      success: true,
      prediction
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPredictionForCrop
};
