const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can be null if system action
  },
  performedBy: {
    type: String, // E.g., "System", "Admin123", "User"
    required: true,
  },
  actionType: {
    type: String,
    required: true,
  },
  entityType: {
    type: String, // E.g., 'Reservation', 'User', 'Slot'
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible payload for action details
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actionType: 1 });

// Middleware to auto-populate timestamp if missing
auditLogSchema.pre('save', function () {
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
