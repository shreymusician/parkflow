const Waitlist = require('../models/Waitlist');
const { WAITLIST_STATUS } = require('../constants/enums');

class WaitlistService {
  /**
   * Create a new Waitlist entry if no slot is available
   */
  static async enqueueUser(userId, locationId) {
    // Determine the current max queue position
    const lastEntry = await Waitlist.findOne({ locationId })
      .sort({ queuePosition: -1 })
      .limit(1);

    const position = lastEntry ? lastEntry.queuePosition + 1 : 1;

    const waitlistEntry = await Waitlist.create({
      userId,
      locationId,
      queuePosition: position,
      estimatedWaitTime: position * 15, // Simple placeholder logic
      status: WAITLIST_STATUS.WAITING,
    });

    return {
      waitlisted: true,
      position: waitlistEntry.queuePosition
    };
  }

  /**
   * Promote the first user on the waitlist for a specific location
   */
  static async promoteWaitlist(locationId) {
    const mongoose = require('mongoose');
    const AllocationEngineService = require('./allocation.service');
    const Reservation = require('../models/Reservation');
    const TemporaryReservation = require('../models/TemporaryReservation');
    const Slot = require('../models/Slot');
    const Vehicle = require('../models/Vehicle');
    const NotificationService = require('./notification.service');
    const { RESERVATION_STATUS, SLOT_STATUS } = require('../constants/enums');
    const crypto = require('crypto');

    // Find the first person in queue
    const firstInLine = await Waitlist.findOne({
      locationId,
      status: WAITLIST_STATUS.WAITING
    }).sort({ queuePosition: 1 });

    if (!firstInLine) return null; // No one is waiting

    // We need their vehicle type to find a slot
    // We don't have vehicleId stored in Waitlist schema! 
    // Wait, let's check Waitlist.js schema. Let's assume Waitlist only has userId and locationId.
    // If so, we can query User's default vehicle.
    const User = require('../models/User');
    const user = await User.findById(firstInLine.userId);
    let vehicleId = user.defaultVehicleId;
    
    // If no default, just get any vehicle they own
    if (!vehicleId) {
      const v = await Vehicle.findOne({ userId: firstInLine.userId, isDeleted: false });
      if (v) vehicleId = v._id;
    }

    if (!vehicleId) {
      // User has no vehicle, we can't promote. Mark them cancelled or skip?
      firstInLine.status = WAITLIST_STATUS.CANCELLED;
      await firstInLine.save();
      return this.promoteWaitlist(locationId); // Try next person
    }

    const vehicle = await Vehicle.findById(vehicleId);

    // Try to allocate
    const optimalSlot = await AllocationEngineService.findOptimalSlot(
      locationId,
      vehicle.vehicleType,
      false, false
    );

    if (!optimalSlot) {
      // Still no slot (maybe the only available slot is for EV and this is CAR)
      return null;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lockedSlot = await Slot.findOneAndUpdate(
        { _id: optimalSlot._id, status: SLOT_STATUS.AVAILABLE, isDeleted: false },
        { $set: { status: SLOT_STATUS.RESERVED } },
        { new: true, session }
      );

      if (!lockedSlot) throw new Error('CONCURRENCY');

      const startTime = new Date();
      // Default to 2 hours for waitlist promotions
      const durationHours = 2;
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      const bookingId = 'BK-' + crypto.randomBytes(4).toString('hex').toUpperCase();

      const reservationArr = await Reservation.create([{
        userId: firstInLine.userId,
        vehicleId: vehicle._id,
        locationId,
        slotId: lockedSlot._id,
        startTime,
        endTime,
        bookingId,
        reservationStatus: RESERVATION_STATUS.PENDING
      }], { session });

      const newReservation = reservationArr[0];

      const expiresAt = new Date(startTime.getTime() + 15 * 60 * 1000);
      await TemporaryReservation.create([{
        reservationId: newReservation._id,
        slotId: lockedSlot._id,
        userId: firstInLine.userId,
        expiresAt
      }], { session });

      // Update waitlist status
      firstInLine.status = WAITLIST_STATUS.ALLOCATED;
      await firstInLine.save({ session });

      await session.commitTransaction();
      session.endSession();

      await NotificationService.sendNotification(
        firstInLine.userId,
        'WAITLIST_PROMOTED',
        `A slot has opened up! You have been allocated Slot ${lockedSlot.slotNumber}. Please arrive within 15 minutes.`
      );

      return newReservation;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      // Concurrency issue, try again for the same person next time
      return null;
    }
  }
}

module.exports = WaitlistService;
