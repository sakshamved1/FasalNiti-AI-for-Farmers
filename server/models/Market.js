const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    market: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    marketCode: {
      type: String,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    operatingHours: { type: String, default: '6:00 AM - 4:00 PM' },
    facilities: [{ type: String }],
    isApMCVerified: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

marketSchema.pre('save', function (next) {
  if (!this.market && this.name) this.market = this.name;
  if (!this.name && this.market) this.name = this.market;
  if (!this.marketCode && this.code) this.marketCode = this.code;
  if (!this.code && this.marketCode) this.code = this.marketCode;
  next();
});

// Indexes for high-performance APMC queries
marketSchema.index({ state: 1, district: 1 });
marketSchema.index({ state: 1, name: 1 });
marketSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.models.Market || mongoose.model('Market', marketSchema);
