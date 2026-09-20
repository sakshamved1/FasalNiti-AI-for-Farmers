const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['FARMER', 'BUYER', 'FPO', 'TRANSPORTER', 'WAREHOUSE', 'GOVERNMENT', 'ADMIN'], 
    default: 'FARMER' 
  },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  village: { type: String, default: '' },
  preferredLanguage: { type: String, default: 'en' },
  verified: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Active', 'Deactivated', 'Suspended'], 
    default: 'Active' 
  },
  avatar: { type: String, default: '' },
  profileCompletionPercent: { type: Number, default: 40 },
  resetPasswordOtp: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  
  // Farmer specific details
  farmerDetails: {
    landSizeAcres: { type: Number, default: 0 },
    landCategory: { type: String, enum: ['Marginal', 'Small', 'Medium', 'Large'], default: 'Small' },
    irrigationType: { type: String, enum: ['Canal', 'Tube Well', 'Rainfed', 'Drip', 'None'], default: 'Rainfed' },
    primaryCrops: [{ type: String }],
    annualIncome: { type: Number, default: 0 },
    kccHolder: { type: Boolean, default: false },
    farmingActivity: { type: String, default: 'Crop Cultivation' }
  },

  // Buyer specific details
  buyerDetails: {
    businessName: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    businessType: { type: String, default: 'Wholesaler / Processor' },
    verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Suspended'], default: 'Pending' },
    requiredCrops: [{ type: String }],
    trustScore: { type: Number, default: 80 },
    completedTransactions: { type: Number, default: 0 },
    responseRatePercent: { type: Number, default: 100 },
    disputeRatePercent: { type: Number, default: 0.0 }
  },

  // FPO specific details
  fpoDetails: {
    fpoName: { type: String, default: '' },
    memberCount: { type: Number, default: 0 },
    totalAcreage: { type: Number, default: 0 },
    registrationNumber: { type: String, default: '' },
    cropsHandled: [{ type: String }]
  }
}, { timestamps: true });

// Compound indexes for high-speed location and role-based searching
userSchema.index({ role: 1, state: 1, district: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
