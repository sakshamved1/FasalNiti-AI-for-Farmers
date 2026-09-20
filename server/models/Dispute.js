const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: { type: String, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raisedByName: { type: String, required: true },
  userRole: { type: String, enum: ['FARMER', 'BUYER', 'TRANSPORTER'], default: 'FARMER' },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  againstUserName: { type: String },
  category: {
    type: String,
    enum: ['Payment', 'Quality mismatch', 'Delivery', 'Quantity mismatch', 'Buyer issue', 'Seller issue', 'Transport'],
    required: true
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  evidenceUrls: [{ type: String }],
  claimAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Raised', 'Under Review', 'Evidence Requested', 'Resolved', 'Rejected'],
    default: 'Raised'
  },
  adminResolutionNotes: { type: String, default: '' },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);
