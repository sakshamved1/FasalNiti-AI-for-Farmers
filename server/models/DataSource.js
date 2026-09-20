const mongoose = require('mongoose');

const dataSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sourceCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    portalUrl: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
      index: true
    },
    recordsCount: {
      type: Number,
      default: 0
    },
    lastFetchAt: {
      type: Date,
      default: Date.now
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DataSource', dataSourceSchema);
