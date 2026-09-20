const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  title: { type: String },
  note: { type: String },
  location: { type: String },
  updatedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    role: { type: String, default: 'SYSTEM' }
  },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  cropName: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  quantityQuintals: { type: Number, required: true },
  pricePerQuintal: { type: Number, required: true },
  totalGrossAmount: { type: Number, required: true },
  transportCost: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 }, // Nominal 0.5% or waived for farmers
  netFarmerPayout: { type: Number, required: true },
  
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerName: { type: String },
  farmerPhone: { type: String },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerName: { type: String },
  buyerPhone: { type: String },
  buyerBusiness: { type: String },

  // Value chain milestones ("Harvest Journey")
  stage: {
    type: String,
    enum: [
      'HARVEST_READY',
      'PRICE_CHECKED',
      'AI_RECOMMENDED',
      'BUYER_MATCHED',
      'DEAL_CONFIRMED',
      'TRANSPORT_DISPATCHED',
      'DELIVERED_WEIGHED',
      'PAYMENT_RELEASED',
      'COMPLETED'
    ],
    default: 'DEAL_CONFIRMED'
  },
  
  timeline: [timelineEntrySchema],
  currentLocation: { type: String, default: 'Mandi Logistics Hub' },
  transportBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportBooking' },
  paymentStatus: { type: String, enum: ['Pending', 'Escrow Funded', 'Paid to Farmer', 'Refunded'], default: 'Escrow Funded' },
  deliveryAddress: { type: String, default: 'Warehouse 4, Indore Mandi Road, Indore' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
