const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['ESCROW', 'DIRECT_DBT', 'UPI', 'NEFT_RTGS'],
      default: 'ESCROW'
    },
    status: {
      type: String,
      enum: ['PENDING', 'HELD_IN_ESCROW', 'RELEASED_TO_FARMER', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    utrNumber: {
      type: String,
      trim: true
    },
    disbursementDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ buyerId: 1, createdAt: -1 });
transactionSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
