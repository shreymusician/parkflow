const mongoose = require('mongoose');
const { RESERVATION_STATUS, SOURCES } = require('../constants/enums');
const crypto = require('crypto');

const reservationSchema = new mongoose.Schema({
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
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  bookingId: {
    type: String,
    unique: true, // Unique index
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  reservationStatus: {
    type: String,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.PENDING,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  qrCodeRef: {
    type: String, // String representation or URL to the generated QR code
  },
  source: {
    type: String,
    enum: Object.values(SOURCES),
    default: SOURCES.REAL,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

// Compound index for fast retrieval of a user's reservations
reservationSchema.index({ userId: 1, reservationStatus: 1 });

// Schema-level middleware to auto-generate bookingId
reservationSchema.pre('save', function () {
  if (!this.bookingId) {
    this.bookingId = 'BK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
