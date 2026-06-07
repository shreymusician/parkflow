const mongoose = require('mongoose');
const ParkingSession = require('../models/ParkingSession');
const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const TemporaryReservation = require('../models/TemporaryReservation');
const { RESERVATION_STATUS, SESSION_STATUS, SLOT_STATUS } = require('../constants/enums');
const NotificationService = require('./notification.service');
const crypto = require('crypto');

class SessionService {
  /**
   * Start a Parking Session (User arrives at the gate)
   */
  static async startSession(reservationId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate the reservation
      const reservation = await Reservation.findOne({
        _id: reservationId,
        userId: userId,
        reservationStatus: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED] },
        isDeleted: false
      }).session(session);

      if (!reservation) {
        throw new Error('Invalid or expired reservation');
      }

      // 2. Clear the TTL TemporaryReservation since they have arrived
      await TemporaryReservation.deleteOne({ reservationId: reservation._id }).session(session);

      // 3. Update Reservation Status
      reservation.reservationStatus = RESERVATION_STATUS.ACTIVE;
      await reservation.save({ session });

      // 4. Create the Parking Session
      const sessionId = 'SESS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const parkingSession = await ParkingSession.create([{
        sessionId,
        reservationId: reservation._id,
        locationId: reservation.locationId,
        userId,
        vehicleId: reservation.vehicleId,
        slotId: reservation.slotId,
        entryTime: new Date(),
        sessionStatus: SESSION_STATUS.ACTIVE
      }], { session });

      // 5. Update Slot Status to physically Occupied
      const slot = await Slot.findOneAndUpdate(
        { _id: reservation.slotId },
        { $set: { status: SLOT_STATUS.OCCUPIED } },
        { session, new: true }
      );

      await session.commitTransaction();
      session.endSession();

      await NotificationService.sendNotification(
        userId,
        'SESSION_STARTED',
        `Parking session started for slot ${slot.slotNumber}.`
      );

      return parkingSession[0];

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * End a Parking Session (User exits the gate)
   */
  static async endSession(sessionId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch active session
      const parkingSession = await ParkingSession.findOne({
        sessionId,
        userId,
        sessionStatus: SESSION_STATUS.ACTIVE
      }).session(session);

      if (!parkingSession) {
        throw new Error('Active session not found');
      }

      // 2. Mark session complete (Mongoose pre-save calculates duration)
      parkingSession.exitTime = new Date();
      parkingSession.sessionStatus = SESSION_STATUS.COMPLETED;
      await parkingSession.save({ session });

      // 3. Update Reservation
      await Reservation.updateOne(
        { _id: parkingSession.reservationId },
        { $set: { reservationStatus: RESERVATION_STATUS.COMPLETED } },
        { session }
      );

      // 4. Release Slot back to Available
      await Slot.updateOne(
        { _id: parkingSession.slotId },
        { $set: { status: SLOT_STATUS.AVAILABLE } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Trigger the Waitlist Service to promote the next user
      const WaitlistService = require('./waitlist.service');
      WaitlistService.promoteWaitlist(parkingSession.locationId).catch(err => {
        console.error('Waitlist promotion failed asynchronously:', err);
      });
      await NotificationService.sendNotification(
        userId,
        'SESSION_COMPLETED',
        `Parking session completed.`
      );

      return parkingSession;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = SessionService;
