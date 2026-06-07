const mongoose = require('mongoose');
const { WAITLIST_STATUS } = require('../constants/enums');

const waitlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  queuePosition: {
    type: Number,
    required: true,
  },
  estimatedWaitTime: {
    type: Number, // In minutes
    required: true,
  },
  requestedTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(WAITLIST_STATUS),
    default: WAITLIST_STATUS.WAITING,
  }
}, { timestamps: true });

// Indexes
waitlistSchema.index({ locationId: 1, queuePosition: 1 });
waitlistSchema.index({ userId: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
