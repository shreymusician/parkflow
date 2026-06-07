const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ReservationService = require('../services/reservation.service');
const Slot = require('../models/Slot');
const Location = require('../models/Location');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { VEHICLE_TYPES, SLOT_STATUS } = require('../constants/enums');

dotenv.config({ path: '../../.env' });

/**
 * Concurrency Test Scenario
 * 20 simultaneous requests. Only 1 available slot.
 * Ensures MongoDB transactions prevent double-booking.
 */
const runConcurrencyTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking');
    console.log('Connected to DB for Concurrency Test');

    // 1. Setup Test Data
    const location = await Location.create({
      name: 'Concurrency Test Hub',
      address: 'Test Street',
      coordinates: { type: 'Point', coordinates: [77, 12] },
      totalCapacity: 1,
      basePrice: 50
    });

    const slot = await Slot.create({
      locationId: location._id,
      slotNumber: 'TEST-A1',
      distanceFromEntrance: 10,
      status: SLOT_STATUS.AVAILABLE
    });

    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpwd'
    });

    const vehicle = await Vehicle.create({
      userId: user._id,
      vehicleNumber: 'TEST-1234',
      vehicleType: VEHICLE_TYPES.CAR
    });

    console.log('Firing 20 simultaneous reservation requests...');

    // 2. Fire 20 concurrent requests
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        ReservationService.requestReservation(user._id, vehicle, location._id, 2)
          .then(res => ({ status: 'fulfilled', result: res }))
          .catch(err => ({ status: 'rejected', error: err.message }))
      );
    }

    const results = await Promise.all(promises);

    // 3. Analyze Results
    let successCount = 0;
    let waitlistCount = 0;
    let conflictCount = 0;

    results.forEach(res => {
      if (res.status === 'fulfilled') {
        if (res.result.success) successCount++;
        if (res.result.waitlisted) waitlistCount++;
      } else {
        if (res.error === 'CONCURRENCY_CONFLICT') {
          conflictCount++;
        } else {
          console.log("Unexpected Error:", res.error);
        }
      }
    });

    console.log('\n--- TEST RESULTS ---');
    console.log(`Successful Reservations: ${successCount} (Expected: 1)`);
    console.log(`Waitlisted/Conflicts: ${waitlistCount + conflictCount} (Expected: 19)`);

    if (successCount === 1) {
      console.log('\x1b[32m[PASS] Concurrency control successfully prevented double allocation.\x1b[0m');
    } else {
      console.log('\x1b[31m[FAIL] Concurrency control failed.\x1b[0m');
    }

    // Cleanup
    await Location.deleteOne({ _id: location._id });
    await Slot.deleteOne({ _id: slot._id });
    await User.deleteOne({ _id: user._id });
    await Vehicle.deleteOne({ _id: vehicle._id });

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runConcurrencyTest();
