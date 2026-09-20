const mongoose = require('mongoose');

const priceFetchLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      index: true
    },
    recordsIngested: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL', 'FAILED'],
      default: 'SUCCESS',
      index: true
    },
    executionTimeMs: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    errorDetails: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PriceFetchLog', priceFetchLogSchema);
