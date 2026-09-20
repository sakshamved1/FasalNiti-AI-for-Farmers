const mongoose = require('mongoose');

const pricePredictionSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  marketName: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  forecast1d: {
    price: { type: Number, required: true },
    percentChange: { type: Number, default: 0 },
    trend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'UP' }
  },
  forecast3d: {
    price: { type: Number, required: true },
    percentChange: { type: Number, default: 0 },
    trend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'UP' }
  },
  forecast7d: {
    price: { type: Number, required: true },
    percentChange: { type: Number, default: 0 },
    trend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'UP' }
  },
  forecast14d: {
    price: { type: Number, required: true },
    percentChange: { type: Number, default: 0 },
    trend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'STABLE' }
  },
  forecast30d: {
    price: { type: Number, required: true },
    percentChange: { type: Number, default: 0 },
    trend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'UP' }
  },
  confidencePercent: { type: Number, default: 84 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  factors: [
    {
      factorName: { type: String },
      impact: { type: String, enum: ['Positive', 'Negative', 'Neutral'] },
      description: { type: String }
    }
  ],
  aiInsight: { type: String, required: true },
  recommendationAction: { type: String, enum: ['SELL_NOW', 'WAIT_5_DAYS', 'WAIT_10_DAYS', 'STORE', 'DIRECT_BUYER'], default: 'WAIT_5_DAYS' },
  disclaimer: { type: String, default: 'AI prediction — actual market prices may vary depending on local arrivals and quality grading.' },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.PricePrediction || mongoose.model('PricePrediction', pricePredictionSchema);
