const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  department: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Crop Insurance Claim Delay', 'PM-KISAN Installment Not Credited', 'Mandi Weighment Dispute', 'Fertilizer Availability', 'Soil Health Card Delay', 'Other'], 
    default: 'PM-KISAN Installment Not Credited' 
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  district: { type: String, default: 'Indore' },
  state: { type: String, default: 'Madhya Pradesh' },
  status: { type: String, enum: ['Submitted', 'Under Review', 'Action Taken', 'Resolved', 'Rejected'], default: 'Submitted' },
  officialResponse: { type: String, default: '' },
  assignedOfficer: { type: String, default: 'District Agricultural Grievance Officer, Indore' },
  filingDate: { type: Date, default: Date.now },
  resolvedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Grievance || mongoose.model('Grievance', grievanceSchema);
