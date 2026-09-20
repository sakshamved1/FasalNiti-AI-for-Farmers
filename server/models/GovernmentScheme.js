const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  schemeName: { type: String, required: true, trim: true },
  shortCode: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true }, // e.g. Ministry of Agriculture & Farmers Welfare, Gujarat State Agri Dept
  summary: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Income Support', 
      'Crop Insurance', 
      'Agricultural Credit', 
      'Irrigation Support', 
      'Soil Health', 
      'Farm Mechanization', 
      'Solar Agriculture', 
      'Warehouse & Infrastructure', 
      'Procurement & Price Support',
      'Cotton & Fiber Development',
      'Horticulture & Seeds',
      'Organic & Natural Farming'
    ], 
    required: true 
  },

  // Geographic applicability
  states: [{ type: String }], // ['All India / Central'] or ['Gujarat'], ['Madhya Pradesh'], etc.
  districts: [{ type: String }], // ['All Districts'] or specific district names

  // Crop & Farmer category applicability
  applicableCrops: [{ type: String }], // ['All Crops'] or ['Cotton', 'Soybean', 'Wheat']
  farmerCategories: [{ type: String }], // ['All Categories', 'Marginal', 'Small', 'Medium', 'Large']
  applicableRoles: [{ type: String, default: ['FARMER'] }], // ['FARMER', 'FPO', 'BUYER']

  // Detailed eligibility rules
  eligibility: {
    landSizeMinAcres: { type: Number, default: 0 },
    landSizeMaxAcres: { type: Number, default: 999 },
    irrigationRequirement: { type: String, default: 'Any' }, // 'Any', 'Tube Well', 'Rainfed', 'Canal', 'Drip'
    maxAnnualIncome: { type: Number, default: 99999999 },
    kccRequired: { type: Boolean, default: false },
    criteriaDescription: { type: String, required: true }
  },

  // Benefits & Financial details
  benefits: {
    financialAmount: { type: String }, // e.g. '₹6,000 per year in 3 installments'
    subsidyPercent: { type: String }, // e.g. 'Up to 60% subsidy on solar water pump installation'
    benefitDescription: { type: String, required: true }
  },

  // Compliance & Application
  documentsRequired: [{ type: String }], // e.g. ['Aadhaar Card', 'Land 7/12 & 8-A Extract', 'Bank Passbook']
  applicationSteps: [
    {
      stepNumber: { type: Number },
      title: { type: String },
      instruction: { type: String }
    }
  ],

  officialUrl: { type: String, required: true },
  source: { type: String, default: 'Ministry of Agriculture & Farmers Welfare' },
  sourceType: { type: String, default: 'OFFICIAL_GOVERNMENT_PORTAL' },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'Active', 'Pending Verification', 'Under Revision', 'Expired'], 
    default: 'ACTIVE' 
  },
  verificationStatus: { type: String, default: 'VERIFIED' },
  verifiedBy: { type: String, default: 'National AgriTech Verification Cell' },
  lastVerifiedAt: { type: String, default: '14 Sep 2026' },
  lastUpdated: { type: String, default: '14 Sep 2026' },
  fetchedAt: { type: Date, default: Date.now },
  helpDeskContact: { type: String, default: '1800-180-1551 (Kisan Call Centre)' }
}, { timestamps: true });

// Compound indexes for high efficiency matching
governmentSchemeSchema.index({ status: 1, states: 1 });
governmentSchemeSchema.index({ category: 1 });
governmentSchemeSchema.index({ applicableCrops: 1 });

module.exports = mongoose.models.GovernmentScheme || mongoose.model('GovernmentScheme', governmentSchemeSchema);
