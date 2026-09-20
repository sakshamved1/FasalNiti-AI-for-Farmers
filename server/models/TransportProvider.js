const mongoose = require('mongoose');

const transportProviderSchema = new mongoose.Schema({
  operatorName: { type: String, required: true },
  vehicleType: { 
    type: String, 
    enum: ['Tractor Trolley (2T)', 'Pickup / Bolero Maxi (1.5T)', 'Eicher Light Truck (4T)', 'Heavy Truck (10T)'], 
    required: true 
  },
  capacityTonnes: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, default: '+91 98260 41234' },
  vehicleNumber: { type: String, required: true },
  baseFare: { type: Number, default: 350 }, // Base fee in ₹
  ratePerKm: { type: Number, required: true }, // Rate in ₹ / km
  rating: { type: Number, default: 4.8 },
  totalTrips: { type: Number, default: 280 },
  currentLocation: {
    district: { type: String, default: 'Indore' },
    lat: { type: Number, default: 22.7533 },
    lng: { type: Number, default: 75.8937 }
  },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.TransportProvider || mongoose.model('TransportProvider', transportProviderSchema);
