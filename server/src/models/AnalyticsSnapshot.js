const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reservationCount: {
    type: Number,
    default: 0,
  },
  sessionCount: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  avgWaitTime: {
    type: Number, // In minutes
    default: 0,
  },
  avgAllocationTime: {
    type: Number, // In seconds
    default: 0,
  },
  occupancyRate: {
    type: Number, // Percentage
    default: 0,
  }
}, { timestamps: true });

// Compound index for time-series aggregation and charting
analyticsSnapshotSchema.index({ locationId: 1, date: -1 });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
