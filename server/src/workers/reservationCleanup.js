const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const TemporaryReservation = require('../models/TemporaryReservation');
const WaitlistService = require('../services/waitlist.service');
const { RESERVATION_STATUS, SLOT_STATUS } = require('../constants/enums');

const startCleanupWorker = () => {
  // Run every 1 minute
  setInterval(async () => {
    try {
      const now = new Date();
      // Find reservations that are PENDING and older than 15 minutes
      const expirationTime = new Date(now.getTime() - 15 * 60 * 1000);

      const expiredReservations = await Reservation.find({
        reservationStatus: RESERVATION_STATUS.PENDING,
        startTime: { $lt: expirationTime },
        isDeleted: false
      });

      if (expiredReservations.length === 0) return;

      for (const res of expiredReservations) {
        // Mark as expired
        res.reservationStatus = RESERVATION_STATUS.EXPIRED;
        await res.save();

        // Release slot
        await Slot.updateOne(
          { _id: res.slotId },
          { $set: { status: SLOT_STATUS.AVAILABLE } }
        );

        // Notify waitlist
        await WaitlistService.promoteWaitlist(res.locationId);
      }
    } catch (error) {
      console.error('Error in reservation cleanup worker:', error);
    }
  }, 60 * 1000); // 1 minute
};

module.exports = { startCleanupWorker };
