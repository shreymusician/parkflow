const mongoose = require('mongoose');
const { SESSION_STATUS, SOURCES } = require('../constants/enums');

const parkingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  entryTime: {
    type: Date,
    required: true,
  },
  exitTime: {
    type: Date,
  },
  duration: {
    type: Number, // In minutes
  },
  totalAmount: {
    type: Number, // In currency units (e.g., rupees)
  },
  sessionStatus: {
    type: String,
    enum: Object.values(SESSION_STATUS),
    default: SESSION_STATUS.ACTIVE,
  },
  source: {
    type: String,
    enum: Object.values(SOURCES),
    default: SOURCES.REAL,
  }
}, { timestamps: true });

// Indexes
parkingSessionSchema.index({ reservationId: 1 });
parkingSessionSchema.index({ slotId: 1 });
parkingSessionSchema.index({ sessionStatus: 1 });
parkingSessionSchema.index({ entryTime: 1 });

// Middleware: Auto-calculate duration when exitTime is set
parkingSessionSchema.pre('save', function () {
  if (this.isModified('exitTime') && this.exitTime) {
    const diffMs = this.exitTime.getTime() - this.entryTime.getTime();
    this.duration = Math.round(diffMs / 60000); // convert ms to minutes
    
    // Assuming a simple flat rate calculation for demo: ₹10 base + ₹2 per minute
    this.totalAmount = 10 + (this.duration * 2);
  }
});

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
