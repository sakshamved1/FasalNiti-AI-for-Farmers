const { evaluateHarvestDecision } = require('../services/decisionEngine');
const { generateCropPrediction } = require('../services/pricePredictionService');
const { 
  resolveCoordinates, 
  getNearbyMandisForLocation, 
  getNearbyWarehouse, 
  getNearbyVerifiedBuyer 
} = require('../services/mandiLocationService');
const { isInMemory, memoryStore } = require('../utils/db');

// POST /api/decision/evaluate or GET /api/decision/evaluate
// The flagship "What should I do with my harvest today?" endpoint
const getDecisionEvaluation = async (req, res) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const crop = params.crop || 'Wheat';
    const quantity = Number(params.quantity) || 500;
    const grade = params.grade || 'Grade A';
    const urgency = params.urgency || 'Medium';

    // 1. Parse and extract location dynamically from params
    let rawLocation = '';
    let district = '';
    let state = '';
    let village = '';

    if (params.location && typeof params.location === 'object') {
      rawLocation = params.location.raw || params.location.location || '';
      district = params.location.district || '';
      state = params.location.state || '';
      village = params.location.village || '';
    } else if (typeof params.location === 'string') {
      rawLocation = params.location;
    }

    if (!district && rawLocation) {
      const parts = rawLocation.split(',').map(s => s.trim()).filter(Boolean);
      district = parts[0] || '';
      state = parts[1] || '';
    }

    if (params.district) district = params.district;
    if (params.state) state = params.state;

    // 2. Resolve genuine geographical coordinates for this district & state
    const resolvedCoords = resolveCoordinates(district, state, rawLocation);
    const farmerLocation = {
      lat: (params.lat ? Number(params.lat) : null) || (params.location?.lat ? Number(params.location.lat) : null) || resolvedCoords.lat,
      lng: (params.lng ? Number(params.lng) : null) || (params.location?.lng ? Number(params.location.lng) : null) || resolvedCoords.lng,
      district: resolvedCoords.district || district || 'Ahmedabad',
      state: resolvedCoords.state || state || 'Gujarat',
      village: village || 'Local Farm'
    };

    // 3. Dynamically discover and compute nearby Mandis for this specific city/district & crop
    const marketsData = getNearbyMandisForLocation(crop, farmerLocation);

    // 4. Resolve local WDRA warehouse and verified local buyer
    const warehouse = getNearbyWarehouse(farmerLocation);
    const buyer = getNearbyVerifiedBuyer(crop, farmerLocation);

    // 5. Generate AI price forecast for the best nearby local Mandi
    const primaryMandi = marketsData[0] || { name: `${farmerLocation.district} APMC Yard`, modalPrice: 2650 };
    const prediction = generateCropPrediction(crop, primaryMandi.modalPrice, primaryMandi.name);

    // 6. Evaluate Harvest Decision
    const result = evaluateHarvestDecision({
      crop,
      quantityKg: Number(quantity) || 500,
      grade,
      farmerLocation,
      urgency,
      marketsData,
      predictionData: prediction,
      warehouseData: warehouse,
      buyerData: buyer
    });

    res.json({
      success: true,
      decision: result
    });
  } catch (err) {
    console.error('Decision evaluation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDecisionEvaluation
};
