const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String },
  cropName: { type: String, required: true },
  variety: { type: String, default: 'JS 335 (Standard)' },
  quantityKg: { type: Number, required: true },
  expectedPricePerQuintal: { type: Number, required: true },
  grade: { type: String, enum: ['Grade A', 'Grade B', 'Grade C', 'Unassessed'], default: 'Grade A' },
  moisturePercent: { type: Number, default: 11.2 },
  qualityConfidence: { type: Number, default: 88 },
  imageUrl: { type: String, default: '' },
  location: {
    state: { type: String, default: 'Madhya Pradesh' },
    district: { type: String, default: 'Indore' },
    village: { type: String, default: 'Sanwer' },
    lat: { type: Number, default: 22.9734 },
    lng: { type: Number, default: 75.8288 }
  },
  availableDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'In Negotiation', 'Sold', 'Cancelled'], default: 'Active' },
  description: { type: String },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
