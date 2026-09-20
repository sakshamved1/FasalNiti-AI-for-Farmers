const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  cropName: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  buyerBusiness: { type: String, required: true },
  buyerTrustScore: { type: Number, default: 94 },
  offeredPricePerQuintal: { type: Number, required: true },
  farmerCounterPrice: { type: Number },
  finalAgreedPrice: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Farmer Countered', 'Buyer Countered', 'Accepted', 'Rejected', 'Expired'], 
    default: 'Pending' 
  },
  paymentTerms: { type: String, default: 'Escrow on delivery / Same day UPI' },
  pickupResponsibility: { type: String, enum: ['Buyer Arranges', 'Farmer Delivers'], default: 'Buyer Arranges' },
  timeline: [
    {
      actor: { type: String, enum: ['BUYER', 'FARMER', 'SYSTEM'] },
      action: { type: String }, // E.g., 'Offered ₹4,600', 'Counter-Offered ₹4,700', 'Accepted offer'
      pricePerQuintal: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
