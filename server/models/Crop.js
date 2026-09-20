const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  localNames: {
    hi: { type: String },
    gu: { type: String },
    mr: { type: String },
    pa: { type: String },
    bn: { type: String },
    ta: { type: String },
    te: { type: String },
    kn: { type: String }
  },
  category: { type: String, enum: ['Cereal', 'Oilseed', 'Pulse', 'Vegetable', 'Fiber', 'Spice'], default: 'Oilseed' },
  season: { type: String, enum: ['Kharif', 'Rabi', 'Zaid'], default: 'Kharif' },
  mspPrice: { type: Number, default: 0 }, // Minimum Support Price per quintal
  unit: { type: String, default: 'Quintal (100 kg)' },
  shelfLifeDaysNormal: { type: Number, default: 90 },
  shelfLifeDaysCold: { type: Number, default: 365 },
  icon: { type: String, default: '🌾' }
}, { timestamps: true });

module.exports = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
