const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Location = require('../models/Location');
const ReservationService = require('../services/reservation.service');
const crypto = require('crypto');

exports.simulateTraffic = async (req, res) => {
  try {
    const { count } = req.body;
    const amount = parseInt(count) || 10;

    // 1. Ensure we have dummy users and vehicles
    const dummyUsers = [];
    const dummyVehicles = [];
    
    for (let i = 0; i < amount; i++) {
      const uniqueSuffix = crypto.randomBytes(4).toString('hex');
      const user = await User.create({
        name: `SimUser_${uniqueSuffix}`,
        email: `sim_${uniqueSuffix}@test.com`,
        password: 'Password123!',
        role: 'USER'
      });
      dummyUsers.push(user);

      const vehicle = await Vehicle.create({
        userId: user._id,
        vehicleNumber: `KA-SIM-${uniqueSuffix.toUpperCase()}`,
        vehicleType: 'CAR'
      });
      dummyVehicles.push(vehicle);
    }

    // 2. Fetch all active locations
    const locations = await Location.find({ isDeleted: false });
    if (locations.length === 0) return res.status(400).json({ success: false, error: 'No locations found.' });

    // 3. Fire parallel requests to Allocation Engine
    let successCount = 0;
    let waitlistCount = 0;
    let conflictCount = 0;

    const promises = dummyUsers.map(async (user, index) => {
      // Pick random location
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const vehicle = dummyVehicles[index];
      
      try {
        const result = await ReservationService.requestReservation(user._id, vehicle._id, randomLoc._id, 2);
        if (result.waitlisted) {
          waitlistCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        if (err.message === 'CONCURRENCY_CONFLICT') {
          conflictCount++;
        } else {
          console.error("Simulation error:", err.message);
        }
      }
    });

    await Promise.all(promises);

    res.status(200).json({
      success: true,
      message: `Simulation complete for ${amount} vehicles.`,
      stats: {
        successCount,
        waitlistCount,
        conflictCount
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetSimulation = async (req, res) => {
  try {
    const Reservation = require('../models/Reservation');
    const ParkingSession = require('../models/ParkingSession');
    const Waitlist = require('../models/Waitlist');
    const Slot = require('../models/Slot');
    const Notification = require('../models/Notification');
    const TemporaryReservation = require('../models/TemporaryReservation');

    // Wipe transactional data
    await Reservation.deleteMany({});
    await ParkingSession.deleteMany({});
    await Waitlist.deleteMany({});
    await Notification.deleteMany({});
    await TemporaryReservation.deleteMany({});

    // Wipe dummy users/vehicles
    await User.deleteMany({ email: { $regex: /^sim_/ } });
    await Vehicle.deleteMany({ vehicleNumber: { $regex: /^KA-SIM-/ } });

    // Reset Slots
    await Slot.updateMany({}, { $set: { status: 'AVAILABLE' } });

    res.status(200).json({ success: true, message: 'Database reset to initial state. All slots available.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
