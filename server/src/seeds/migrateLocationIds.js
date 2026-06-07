const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reservation = require('../models/Reservation');
const ParkingSession = require('../models/ParkingSession');
const Slot = require('../models/Slot');

dotenv.config();

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Starting Migration...');

    // 1. Migrate Reservations
    const reservations = await Reservation.find({ locationId: { $exists: false } });
    console.log(`Found ${reservations.length} reservations missing locationId.`);

    for (const res of reservations) {
      if (res.slotId) {
        const slot = await Slot.findById(res.slotId);
        if (slot) {
          res.locationId = slot.locationId;
          await res.save();
          console.log(`Migrated Reservation ${res._id} with locationId ${slot.locationId}`);
        }
      }
    }

    // 2. Migrate ParkingSessions
    const sessions = await ParkingSession.find({ locationId: { $exists: false } });
    console.log(`Found ${sessions.length} sessions missing locationId.`);

    for (const sess of sessions) {
      if (sess.slotId) {
        const slot = await Slot.findById(sess.slotId);
        if (slot) {
          sess.locationId = slot.locationId;
          await sess.save();
          console.log(`Migrated Session ${sess._id} with locationId ${slot.locationId}`);
        }
      }
    }

    console.log('Migration Completed Successfully.');
    process.exit();
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
};

migrateData();
