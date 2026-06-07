const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const TemporaryReservation = require('../models/TemporaryReservation');
const Slot = require('../models/Slot');
const AllocationEngineService = require('./allocation.service');
const WaitlistService = require('./waitlist.service');
const { SLOT_STATUS, RESERVATION_STATUS } = require('../constants/enums');

class ReservationService {
  /**
   * Request a parking reservation using ACID Transactions
   */
  static async requestReservation(userId, vehicle, locationId, durationHours) {
    // 1. Find optimal slot via scoring engine
    const optimalSlot = await AllocationEngineService.findOptimalSlot(
      locationId, 
      vehicle.vehicleType, 
      false, // isAccessible (defaulting for now)
      false  // isVip
    );

    if (!optimalSlot) {
      // Trigger Waitlist Service if completely full
      return await WaitlistService.enqueueUser(userId, locationId);
    }

    // 2. Start a MongoDB Session and Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step A: Lock the selected slot with optimistic concurrency control
      const lockedSlot = await Slot.findOneAndUpdate(
        { _id: optimalSlot._id, status: SLOT_STATUS.AVAILABLE, isDeleted: false },
        { $set: { status: SLOT_STATUS.RESERVED } },
        { new: true, session }
      );

      // If someone beat us to this exact slot, rollback and throw to retry
      if (!lockedSlot) {
        throw new Error('CONCURRENCY_CONFLICT');
      }

      // Step B: Create the Reservation Document
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      const reservationArr = await Reservation.create([{
        userId,
        vehicleId: vehicle._id,
        locationId,
        slotId: lockedSlot._id,
        startTime,
        endTime,
        reservationStatus: RESERVATION_STATUS.PENDING
      }], { session });

      const newReservation = reservationArr[0];

      // Step C: Create the TemporaryReservation Document for TTL (15 mins to arrive)
      const expiresAt = new Date(startTime.getTime() + 15 * 60 * 1000);
      await TemporaryReservation.create([{
        reservationId: newReservation._id,
        slotId: lockedSlot._id,
        userId,
        expiresAt
      }], { session });

      // Commit the transaction - all or nothing
      await session.commitTransaction();
      session.endSession();

      // Trigger realtime notification
      const NotificationService = require('./notification.service');
      await NotificationService.sendNotification(
        userId, 
        'RESERVATION_CREATED', 
        `Your reservation has been confirmed. Booking ID: ${newReservation.bookingId}`
      );

      return {
        success: true,
        bookingId: newReservation.bookingId,
        slotNumber: lockedSlot.slotNumber,
        reservationStatus: newReservation.reservationStatus
      };

    } catch (error) {
      // Rollback on any failure
      await session.abortTransaction();
      session.endSession();
      
      if (error.message === 'CONCURRENCY_CONFLICT') {
         // In a real system, we might automatically retry findOptimalSlot() here.
         // For demonstration, we'll throw back a conflict.
         throw error;
      }
      throw error;
    }
  }
}

module.exports = ReservationService;
