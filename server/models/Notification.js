const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: { type: String, default: 'FARMER' },
  type: {
    type: String,
    enum: [
      'PRICE_ALERT',
      'NEW_OFFER',
      'COUNTER_OFFER',
      'OFFER_ACCEPTED',
      'DEAL_CONFIRMED',
      'TRANSPORT_UPDATE',
      'GOVERNMENT_SCHEME',
      'USER_VERIFIED',
      'ORDER_UPDATE',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
