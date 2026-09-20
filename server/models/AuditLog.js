const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g. 'USER_VERIFY', 'SCHEME_CREATE', 'TICKET_STATUS_CHANGE'
  entity: { type: String, required: true }, // e.g. 'User', 'GovernmentScheme', 'SupportTicket'
  entityId: { type: String, required: true },
  details: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' }
}, { timestamps: true });

auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ entity: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
