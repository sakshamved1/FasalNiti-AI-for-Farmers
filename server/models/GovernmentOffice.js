const mongoose = require('mongoose');

const governmentOfficeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // E.g., 'Krishi Vigyan Kendra (KVK) Kasturbagram, Indore'
  department: { type: String, required: true }, // 'ICAR - Agricultural Extension'
  officeType: { type: String, enum: ['KVK', 'District Agriculture Office', 'APMC Mandi Office', 'Soil Testing Lab', 'NABARD District Office'], default: 'KVK' },
  district: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, default: '0731-2780280' },
  tollFreeHelpline: { type: String, default: '1800-180-1551' },
  email: { type: String, default: 'kvk.indore@icar.gov.in' },
  workingHours: { type: String, default: 'Monday to Friday: 10:00 AM - 5:00 PM' },
  servicesOffered: [{ type: String }],
  location: {
    lat: { type: Number, default: 22.6841 },
    lng: { type: Number, default: 75.8943 }
  },
  officialWebsite: { type: String, default: 'https://kvk.icar.gov.in' },
  verifiedOfficerDesignation: { type: String, default: 'Senior Scientist & Head, KVK Indore' }
}, { timestamps: true });

module.exports = mongoose.models.GovernmentOffice || mongoose.model('GovernmentOffice', governmentOfficeSchema);
