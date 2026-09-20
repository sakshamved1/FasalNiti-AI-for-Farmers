/**
 * Flagship Farmer Decision Engine for KisanSetu AI
 * Evaluates: Where to sell, When to sell, Whether to store, Transportation costs, Net returns.
 */

// Haversine distance calculator between two coordinates in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 25; // Default fallback km
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Transport cost estimation per quintal based on vehicle and distance
const estimateTransportCostPerQuintal = (distanceKm, quantityKg) => {
  const quantityQuintals = Math.max(quantityKg / 100, 1);
  
  // Choose optimal vehicle: Tractor (<= 25 Qtl), Pickup (<= 15 Qtl), Mini Truck (<= 40 Qtl)
  let baseFare = 250;
  let perKmRate = 18;

  if (quantityQuintals > 25) {
    baseFare = 500;
    perKmRate = 30;
  } else if (quantityQuintals <= 15) {
    baseFare = 300;
    perKmRate = 22;
  }

  const totalTripCost = baseFare + (distanceKm * perKmRate);
  // Cost allocated per quintal
  const costPerQuintal = Math.round(totalTripCost / quantityQuintals);
  return {
    costPerQuintal,
    totalTripCost,
    distanceKm
  };
};

// Main Decision Evaluation Function
const evaluateHarvestDecision = ({
  crop = 'Soybean',
  quantityKg = 500,
  grade = 'Grade A',
  farmerLocation = { lat: 22.9734, lng: 75.8288, district: 'Indore', village: 'Sanwer' },
  urgency = 'Medium', // 'Low', 'Medium', 'High'
  availableDate = new Date(),
  marketsData = [],
  predictionData = null,
  warehousesData = [],
  buyersData = [],
  warehouseData = null,
  buyerData = null
}) => {
  const quantityQuintals = quantityKg / 100;

  // Resolve warehouse and buyer if passed or from array
  const activeWarehouse = warehouseData || (Array.isArray(warehousesData) && warehousesData[0]) || null;
  const activeBuyer = buyerData || (Array.isArray(buyersData) && buyersData[0]) || null;

  // Grade adjustment multiplier on base price
  let gradeMultiplier = 1.0;
  if (grade === 'Grade A') gradeMultiplier = 1.02;
  else if (grade === 'Grade B') gradeMultiplier = 0.98;
  else if (grade === 'Grade C') gradeMultiplier = 0.92;

  const defaultBasePrice = crop.toLowerCase().includes('wheat') ? 2650 : (crop.toLowerCase().includes('chana') ? 6150 : (crop.toLowerCase().includes('onion') ? 2400 : (crop.toLowerCase().includes('mustard') ? 5450 : 4500)));

  // 1. Evaluate Mandi Options
  const mandiEvaluations = marketsData.map(mandi => {
    const distanceKm = mandi.distanceKm !== undefined ? mandi.distanceKm : calculateDistanceKm(
      farmerLocation.lat,
      farmerLocation.lng,
      mandi.location?.lat,
      mandi.location?.lng
    );

    const mandiPrice = mandi.modalPrice || mandi.currentPrice || defaultBasePrice;
    const transport = estimateTransportCostPerQuintal(distanceKm, quantityKg);
    const adjustedPrice = Math.round(mandiPrice * gradeMultiplier);
    const grossReturnPerQuintal = adjustedPrice;
    const netReturnPerQuintal = grossReturnPerQuintal - transport.costPerQuintal;
    const totalNetReturn = Math.round(netReturnPerQuintal * quantityQuintals);

    // Score calculation (0-100)
    let score = (netReturnPerQuintal / Math.max(defaultBasePrice, 3000)) * 60;
    if (mandi.demandLevel === 'High') score += 15;
    if (distanceKm <= 35) score += 15;
    if (mandi.isApMCVerified) score += 10;

    return {
      type: 'MANDI',
      id: mandi._id || mandi.code || mandi.name,
      name: mandi.name,
      district: mandi.district || farmerLocation.district,
      state: mandi.state || farmerLocation.state,
      currentPrice: mandiPrice,
      gradeAdjustedPrice: adjustedPrice,
      distanceKm,
      transportCostPerQuintal: transport.costPerQuintal,
      totalTransportCost: transport.totalTripCost,
      expectedNetReturnPerQuintal: netReturnPerQuintal,
      totalExpectedNetReturn: totalNetReturn,
      demand: mandi.demandLevel || 'High',
      risk: distanceKm > 60 ? 'Medium' : 'Low',
      confidence: 88,
      recommendedAction: `Sell at ${mandi.name}`,
      details: `Distance: ${distanceKm} km | Transport: ₹${transport.costPerQuintal}/quintal | Net return: ₹${netReturnPerQuintal}/quintal`,
      score: Math.round(score)
    };
  });

  // Sort mandis by net return
  mandiEvaluations.sort((a, b) => b.expectedNetReturnPerQuintal - a.expectedNetReturnPerQuintal);
  const bestMandi = mandiEvaluations[0] || {
    name: `${farmerLocation.district || 'Local'} Krishi Upaj APMC Mandi`,
    district: farmerLocation.district || 'Local',
    state: farmerLocation.state || 'State',
    currentPrice: defaultBasePrice,
    transportCostPerQuintal: 80,
    expectedNetReturnPerQuintal: defaultBasePrice - 80,
    totalExpectedNetReturn: (defaultBasePrice - 80) * quantityQuintals,
    distanceKm: 12
  };

  // 2. Evaluate Storage & Waiting Option (AI 5-day / 7-day forecast)
  let waitExpectedPrice = Math.round(bestMandi.currentPrice * 1.048); // +4.8% default
  if (predictionData && predictionData.forecast7d) {
    waitExpectedPrice = predictionData.forecast7d.price;
  }

  const storageDays = 5;
  const storageRatePerDay = activeWarehouse?.dailyRatePerQuintal || 2.2;
  const handlingChargesPerQuintal = activeWarehouse?.handlingChargesPerQuintal || 25;
  const totalStorageCostPerQuintal = Math.round(storageDays * storageRatePerDay * 10) / 10;
  const totalStorageOverhead = totalStorageCostPerQuintal + handlingChargesPerQuintal;

  const warehouseDistance = activeWarehouse?.distanceKm || Math.min(18, bestMandi.distanceKm);
  const warehouseTransport = estimateTransportCostPerQuintal(warehouseDistance, quantityKg);
  const waitNetReturnPerQuintal = waitExpectedPrice - warehouseTransport.costPerQuintal - totalStorageOverhead;
  const waitTotalNetReturn = Math.round(waitNetReturnPerQuintal * quantityQuintals);
  const gainFromWaiting = waitTotalNetReturn - bestMandi.totalExpectedNetReturn;

  // 3. Evaluate Direct Verified Buyer Option
  const buyerOfferPrice = Math.round(bestMandi.currentPrice * 1.025);
  const buyerPickupTransport = 0;
  const directBuyerNetReturnPerQuintal = buyerOfferPrice;
  const directBuyerTotalNetReturn = Math.round(directBuyerNetReturnPerQuintal * quantityQuintals);

  const warehouseName = activeWarehouse?.name || `${farmerLocation.district || 'State'} WDRA Godown & Cold Storage`;
  const buyerName = activeBuyer?.businessName || `Verified ${crop} Processor (${farmerLocation.district || 'Local'})`;

  // Determine Grand Recommendation
  let flagshipVerdict = 'WAIT_5_DAYS';
  let flagshipTitle = 'WAIT 5 DAYS & STORE';
  let simpleExplanation = `Prices in ${bestMandi.name} are projected to rise ~4.8% in the next 5-7 days. By storing your ${crop} for 5 days, your estimated net earning increases by ₹${Math.abs(gainFromWaiting)} after storage and transport costs.`;
  let badgeColor = 'emerald';

  if (urgency === 'High') {
    if (directBuyerTotalNetReturn > bestMandi.totalExpectedNetReturn) {
      flagshipVerdict = 'SELL_TO_BUYER';
      flagshipTitle = `SELL TO VERIFIED BUYER TODAY`;
      simpleExplanation = `Due to urgent cash requirement, selling directly to ${buyerName} at ₹${buyerOfferPrice}/qtl gives you ₹${directBuyerTotalNetReturn.toLocaleString()} immediately with ZERO transport cost.`;
      badgeColor = 'amber';
    } else {
      flagshipVerdict = 'SELL_NOW_MANDI';
      flagshipTitle = `SELL TODAY AT ${bestMandi.name.toUpperCase()}`;
      simpleExplanation = `Sell today at ${bestMandi.name} for immediate liquidity. Net return: ₹${bestMandi.expectedNetReturnPerQuintal}/quintal after transport.`;
      badgeColor = 'blue';
    }
  } else if (gainFromWaiting < 100) {
    flagshipVerdict = 'SELL_NOW_MANDI';
    flagshipTitle = `SELL TODAY AT ${bestMandi.name.toUpperCase()}`;
    simpleExplanation = `Current mandi price is robust. Forecasted price rise is minimal, so selling now avoids unnecessary storage fees.`;
    badgeColor = 'emerald';
  }

  // Build the 3 Ranked Options for Visual Cards
  const options = [];

  if (flagshipVerdict === 'WAIT_5_DAYS') {
    options.push({
      rank: 1,
      badge: '🥇 BEST OPTION (RECOMMENDED)',
      action: 'Store for 5 Days & Sell',
      destination: warehouseName,
      currentPrice: bestMandi.currentPrice,
      expectedFuturePrice: waitExpectedPrice,
      distanceKm: warehouseDistance,
      transportCostPerQuintal: warehouseTransport.costPerQuintal,
      storageCostPerQuintal: totalStorageOverhead,
      netReturnPerQuintal: waitNetReturnPerQuintal,
      totalNetProfit: waitTotalNetReturn,
      extraProfitVsSellNow: gainFromWaiting,
      demand: 'High (Institutional Demand)',
      risk: 'Low',
      confidence: predictionData?.confidencePercent || 84,
      verdictTag: 'WAIT 5 DAYS',
      summary: `Expected price ₹${waitExpectedPrice}/qtl (+4.8%). Net profit ₹${waitTotalNetReturn.toLocaleString()} (+₹${gainFromWaiting.toLocaleString()} more than selling today).`
    });

    options.push({
      rank: 2,
      badge: '🥈 SECOND OPTION',
      action: 'Sell Directly to Verified Buyer',
      destination: `${buyerName} (Farmgate Pickup)`,
      currentPrice: buyerOfferPrice,
      expectedFuturePrice: buyerOfferPrice,
      distanceKm: 0,
      transportCostPerQuintal: 0,
      storageCostPerQuintal: 0,
      netReturnPerQuintal: directBuyerNetReturnPerQuintal,
      totalNetProfit: directBuyerTotalNetReturn,
      extraProfitVsSellNow: directBuyerTotalNetReturn - bestMandi.totalExpectedNetReturn,
      demand: 'Direct Factory Contract',
      risk: 'Very Low',
      confidence: 94,
      verdictTag: 'DIRECT BUYER',
      summary: `Buyer arranges pickup from your farm. No transport hassle, instant escrow bank transfer at ₹${buyerOfferPrice}/qtl.`
    });

    options.push({
      rank: 3,
      badge: '🥉 THIRD OPTION',
      action: 'Sell Today at Nearest Mandi',
      destination: bestMandi.name,
      currentPrice: bestMandi.currentPrice,
      expectedFuturePrice: bestMandi.currentPrice,
      distanceKm: bestMandi.distanceKm,
      transportCostPerQuintal: bestMandi.transportCostPerQuintal,
      storageCostPerQuintal: 0,
      netReturnPerQuintal: bestMandi.expectedNetReturnPerQuintal,
      totalNetProfit: bestMandi.totalExpectedNetReturn,
      extraProfitVsSellNow: 0,
      demand: bestMandi.demand,
      risk: 'Low',
      confidence: 90,
      verdictTag: 'SELL TODAY',
      summary: `Sell immediately at ₹${bestMandi.currentPrice}/qtl. Net return: ₹${bestMandi.expectedNetReturnPerQuintal}/qtl after ₹${bestMandi.transportCostPerQuintal} transport.`
    });
  } else {
    // If selling now is better
    options.push({
      rank: 1,
      badge: '🥇 BEST OPTION (RECOMMENDED)',
      action: `Sell at ${bestMandi.name}`,
      destination: bestMandi.name,
      currentPrice: bestMandi.currentPrice,
      expectedFuturePrice: bestMandi.currentPrice,
      distanceKm: bestMandi.distanceKm,
      transportCostPerQuintal: bestMandi.transportCostPerQuintal,
      storageCostPerQuintal: 0,
      netReturnPerQuintal: bestMandi.expectedNetReturnPerQuintal,
      totalNetProfit: bestMandi.totalExpectedNetReturn,
      extraProfitVsSellNow: 0,
      demand: bestMandi.demand,
      risk: 'Low',
      confidence: 92,
      verdictTag: 'SELL NOW',
      summary: `Highest immediate return of ₹${bestMandi.expectedNetReturnPerQuintal}/quintal net.`
    });

    options.push({
      rank: 2,
      badge: '🥈 SECOND OPTION',
      action: 'Sell to Verified Buyer',
      destination: `${buyerName} (Farmgate Direct)`,
      currentPrice: buyerOfferPrice,
      expectedFuturePrice: buyerOfferPrice,
      distanceKm: 0,
      transportCostPerQuintal: 0,
      storageCostPerQuintal: 0,
      netReturnPerQuintal: directBuyerNetReturnPerQuintal,
      totalNetProfit: directBuyerTotalNetReturn,
      extraProfitVsSellNow: directBuyerTotalNetReturn - bestMandi.totalExpectedNetReturn,
      demand: 'High',
      risk: 'Very Low',
      confidence: 94,
      verdictTag: 'DIRECT BUYER',
      summary: `Direct sale at ₹${buyerOfferPrice}/quintal without transport deduction.`
    });

    options.push({
      rank: 3,
      badge: '🥉 THIRD OPTION',
      action: 'Store for 5 Days',
      destination: warehouseName,
      currentPrice: bestMandi.currentPrice,
      expectedFuturePrice: waitExpectedPrice,
      distanceKm: warehouseDistance,
      transportCostPerQuintal: warehouseTransport.costPerQuintal,
      storageCostPerQuintal: totalStorageOverhead,
      netReturnPerQuintal: waitNetReturnPerQuintal,
      totalNetProfit: waitTotalNetReturn,
      extraProfitVsSellNow: gainFromWaiting,
      demand: 'Moderate',
      risk: 'Medium',
      confidence: 82,
      verdictTag: 'STORE',
      summary: `Store in WDRA godown and wait for further price rally.`
    });
  }

  return {
    query: {
      crop,
      quantityKg,
      quantityQuintals,
      grade,
      farmerLocation,
      urgency,
      availableDate
    },
    flagshipVerdict,
    flagshipTitle,
    simpleExplanation,
    badgeColor,
    options,
    bestMandi,
    allMandiEvaluations: mandiEvaluations,
    disclaimer: 'AI Decision Engine provides data-driven financial projections based on APMC modal rates, transport fuel tariffs, and time-series forecasts. Actual physical trading prices are determined on the trading floor.'
  };
};

module.exports = {
  calculateDistanceKm,
  estimateTransportCostPerQuintal,
  evaluateHarvestDecision
};
