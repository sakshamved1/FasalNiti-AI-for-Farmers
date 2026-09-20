const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  senderId: { type: String },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['USER', 'FARMER', 'BUYER', 'FPO', 'ADMIN'], default: 'USER' },
  message: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, // e.g. KS-2026-001245
  userId: { type: String },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Technical Issue', 
      'Profile Update', 
      'Government Scheme', 
      'Market Price', 
      'Buyer/Seller Issue', 
      'Payment', 
      'Transport', 
      'Storage', 
      'Other'
    ], 
    required: true 
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  attachment: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  status: { 
    type: String, 
    enum: ['Open', 'Submitted', 'Under Review', 'Action Taken', 'Waiting for User', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  assignedTo: { type: String, default: 'Unassigned' },
  replies: [replySchema],
  resolvedAt: { type: Date }
}, { timestamps: true });

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
