const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    commodity: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    cropName: {
      type: String,
      trim: true
    },
    variety: {
      type: String,
      default: 'Standard / FAQ',
      trim: true
    },
    grade: {
      type: String,
      default: 'FAQ',
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    stateCode: {
      type: String,
      trim: true,
      lowercase: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    districtCode: {
      type: String,
      trim: true,
      lowercase: true
    },
    market: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    marketName: {
      type: String,
      trim: true
    },
    marketCode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    minPrice: {
      type: Number,
      required: true
    },
    maxPrice: {
      type: Number,
      required: true
    },
    modalPrice: {
      type: Number,
      required: true,
      index: true
    },
    unit: {
      type: String,
      default: '₹/Quintal'
    },
    arrivalQuantity: {
      type: Number,
      default: 0
    },
    arrivalsTonnes: {
      type: Number,
      default: 0
    },
    arrivalUnit: {
      type: String,
      default: 'Tonnes'
    },
    priceDate: {
      type: Date,
      required: true,
      index: true
    },
    date: {
      type: Date
    },
    priceChange24h: {
      type: Number,
      default: 0
    },
    percentChange24h: {
      type: Number,
      default: 0
    },
    demandLevel: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'High'
    },
    source: {
      type: String,
      default: 'Agmarknet / Ministry of Agriculture & Farmers Welfare'
    },
    sourceUrl: {
      type: String,
      default: 'https://agmarknet.gov.in'
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    },
    dataStatus: {
      type: String,
      enum: ['LIVE', 'RECENT', 'STALE', 'UNAVAILABLE'],
      default: 'LIVE',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    history: [
      {
        date: { type: String },
        modalPrice: { type: Number },
        arrivals: { type: Number }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Pre-save synchronization for cropName/commodity and marketName/market
marketPriceSchema.pre('save', function (next) {
  if (!this.commodity && this.cropName) this.commodity = this.cropName;
  if (!this.cropName && this.commodity) this.cropName = this.commodity;
  if (!this.market && this.marketName) this.market = this.marketName;
  if (!this.marketName && this.market) this.marketName = this.market;
  if (!this.priceDate && this.date) this.priceDate = this.date;
  if (!this.date && this.priceDate) this.date = this.priceDate;
  if (!this.arrivalQuantity && this.arrivalsTonnes) this.arrivalQuantity = this.arrivalsTonnes;
  if (!this.arrivalsTonnes && this.arrivalQuantity) this.arrivalsTonnes = this.arrivalQuantity;
  next();
});

// UNIQUE COMPOUND INDEX: Prevent duplicate price insertion for same commodity, variety, marketCode on the same priceDate
marketPriceSchema.index(
  { commodity: 1, variety: 1, marketCode: 1, priceDate: 1 },
  { unique: true, name: 'unique_market_price_record' }
);

// High-Performance Query Indexes
marketPriceSchema.index({ state: 1, district: 1 });
marketPriceSchema.index({ commodity: 1, state: 1 });
marketPriceSchema.index({ commodity: 1, district: 1 });
marketPriceSchema.index({ market: 1, priceDate: -1 });
marketPriceSchema.index({ marketCode: 1, priceDate: -1 });

module.exports = mongoose.models.MarketPrice || mongoose.model('MarketPrice', marketPriceSchema);
