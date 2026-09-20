const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerType: { type: String, enum: ['CWC / State Warehousing Corp', 'Private WDRA Accredited', 'Cooperative / PACS'], default: 'Private WDRA Accredited' },
  storageType: { type: String, enum: ['Dry Warehouse', 'Cold Storage', 'Grain Silos'], default: 'Dry Warehouse' },
  state: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  totalCapacityTonnes: { type: Number, required: true },
  availableCapacityTonnes: { type: Number, required: true },
  ratePerQuintalPerDay: { type: Number, required: true }, // E.g., ₹2.5 / day / quintal
  rating: { type: Number, default: 4.6 },
  wdraAccredited: { type: Boolean, default: true },
  insuranceCovered: { type: Boolean, default: true },
  contactPhone: { type: String, default: '0731-2856123' },
  features: [{ type: String }] // E.g., ['Fumigation', 'Temperature Controlled', 'e-NWR pledge financing available']
}, { timestamps: true });

module.exports = mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);
