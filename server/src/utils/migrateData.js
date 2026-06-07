const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Migrate Users
    console.log('Migrating Users...');
    const resultUser = await User.updateMany(
      { mobileNumber: { $exists: false } },
      { $set: { mobileNumber: "0000000000" } }
    );
    console.log(`Updated ${resultUser.modifiedCount} users with default mobileNumber.`);

    // Migrate Vehicles
    console.log('Migrating Vehicles...');
    const resultVehicle = await Vehicle.updateMany(
      { vehicleType: 'EV' },
      { $set: { vehicleType: 'EV_CAR' } }
    );
    console.log(`Updated ${resultVehicle.modifiedCount} vehicles from EV to EV_CAR.`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
