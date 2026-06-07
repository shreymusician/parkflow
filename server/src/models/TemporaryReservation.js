const mongoose = require('mongoose');

const temporaryReservationSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

// TTL Index: MongoDB will automatically delete documents where the current time > expiresAt
// The expireAfterSeconds is set to 0 because the `expiresAt` field itself holds the exact expiration time.
temporaryReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TemporaryReservation', temporaryReservationSchema);
