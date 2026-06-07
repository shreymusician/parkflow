const mongoose = require('mongoose');
const { DELIVERY_STATUS, SOURCES } = require('../constants/enums');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notificationType: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: Object.values(DELIVERY_STATUS),
    default: DELIVERY_STATUS.PENDING,
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: Object.values(SOURCES),
    default: SOURCES.REAL,
  }
}, { timestamps: true });

notificationSchema.index({ userId: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
