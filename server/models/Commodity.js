const mongoose = require('mongoose');

const commoditySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Commodity name is required'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Cereals', 'Pulses', 'Oilseeds', 'Fibres', 'Spices', 'Vegetables', 'Fruits', 'Commercial'],
      index: true
    },
    aliases: {
      type: [String],
      default: [],
      index: true
    },
    standardGrade: {
      type: String,
      default: 'FAQ',
      trim: true
    },
    unit: {
      type: String,
      default: 'Quintal'
    },
    mspPrice: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      default: 'Ministry of Agriculture & Farmers Welfare, Govt of India'
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for multilingual & alias searches
commoditySchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('Commodity', commoditySchema);
