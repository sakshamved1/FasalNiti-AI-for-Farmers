const { isInMemory, memoryStore } = require('../utils/db');
const { calculateDistanceKm, estimateTransportCostPerQuintal } = require('../services/decisionEngine');

// GET /api/logistics/transporters
const getTransporters = async (req, res) => {
  try {
    if (isInMemory()) {
      return res.json({ success: true, count: memoryStore.transportProviders.length, transporters: memoryStore.transportProviders });
    }
    const TransportProvider = require('../models/TransportProvider');
    const transporters = await TransportProvider.find();
    res.json({ success: true, count: transporters.length, transporters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/logistics/warehouses
const getWarehouses = async (req, res) => {
  try {
    if (isInMemory()) {
      return res.json({ success: true, count: memoryStore.warehouses.length, warehouses: memoryStore.warehouses });
    }
    const Warehouse = require('../models/Warehouse');
    const warehouses = await Warehouse.find();
    res.json({ success: true, count: warehouses.length, warehouses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST or GET /api/logistics/calculator (Real Profit Calculator & Freight Estimator)
const calculateRealProfit = async (req, res) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const crop = params.crop || 'Soybean';
    const quantityKg = Number(params.quantityKg) || (Number(params.weightQuintals || params.quantityQuintals) * 100) || 500;
    const currentMandiPrice = Number(params.currentMandiPrice) || 4500;
    const distanceKm = Number(params.distanceKm) || 28;
    const storageDays = Number(params.storageDays) || 5;
    const storageRatePerDay = Number(params.storageRatePerDay) || 2.2;
    const futurePriceExpected = Number(params.futurePriceExpected) || 4716;
    const directBuyerPrice = Number(params.directBuyerPrice) || 4600;

    const qtyQuintals = Math.max(0.1, quantityKg / 100);
    const transport = estimateTransportCostPerQuintal(distanceKm, quantityKg);


    // Option A: Sell Now Mandi
    const grossSaleA = currentMandiPrice * qtyQuintals;
    const transportCostA = transport.totalTripCost;
    const mandiCessA = Math.round(grossSaleA * 0.005); // 0.5%
    const netProfitA = grossSaleA - transportCostA - mandiCessA;

    // Option B: Store 5 Days & Sell
    const grossSaleB = futurePriceExpected * qtyQuintals;
    const storageCostB = Math.round(storageDays * storageRatePerDay * qtyQuintals);
    const handlingFeeB = Math.round(20 * qtyQuintals); // unloading & fumigation
    const transportCostB = transport.totalTripCost;
    const netProfitB = grossSaleB - transportCostB - storageCostB - handlingFeeB;

    // Option C: Sell to Direct Buyer Farmgate
    const grossSaleC = directBuyerPrice * qtyQuintals;
    const transportCostC = 0; // Buyer arranges
    const platformFeeC = 0; // waived
    const netProfitC = grossSaleC;

    let recommendation = 'OPTION_B';
    let bestProfit = netProfitB;
    let recommendationText = `Store for ${storageDays} days: Price surge gives +₹${netProfitB - netProfitA} higher net earnings even after storage!`;

    if (netProfitC > netProfitB) {
      recommendation = 'OPTION_C';
      bestProfit = netProfitC;
      recommendationText = `Direct Buyer is best: Zero transport cost gives highest immediate payout of ₹${netProfitC}!`;
    }

    res.json({
      success: true,
      inputs: {
        crop,
        quantityKg,
        qtyQuintals,
        currentMandiPrice,
        distanceKm,
        storageDays
      },
      comparison: {
        optionA: {
          label: 'Option A: Sell Now at Mandi',
          grossSaleValue: grossSaleA,
          transportCost: transportCostA,
          storageCost: 0,
          otherCosts: mandiCessA,
          netProfit: netProfitA,
          netPerQuintal: Math.round(netProfitA / qtyQuintals)
        },
        optionB: {
          label: `Option B: Store for ${storageDays} Days & Sell`,
          grossSaleValue: grossSaleB,
          transportCost: transportCostB,
          storageCost: storageCostB,
          otherCosts: handlingFeeB,
          netProfit: netProfitB,
          netPerQuintal: Math.round(netProfitB / qtyQuintals),
          additionalGainVsSellNow: netProfitB - netProfitA
        },
        optionC: {
          label: 'Option C: Sell Direct to Verified Buyer',
          grossSaleValue: grossSaleC,
          transportCost: 0,
          storageCost: 0,
          otherCosts: 0,
          netProfit: netProfitC,
          netPerQuintal: Math.round(netProfitC / qtyQuintals),
          additionalGainVsSellNow: netProfitC - netProfitA
        }
      },
      recommendation: {
        winningOption: recommendation,
        bestNetProfit: bestProfit,
        explanation: recommendationText
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTransporters,
  getWarehouses,
  calculateRealProfit
};
