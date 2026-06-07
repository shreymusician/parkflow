const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Find all users with "0000000000"
    const users = await User.find({ mobileNumber: "0000000000" });
    console.log(`Found ${users.length} users with "0000000000"`);

    let counter = 1;
    for (const user of users) {
      // Create a unique dummy number like "9990000001"
      const dummyNumber = `999${String(counter).padStart(7, '0')}`;
      user.mobileNumber = dummyNumber;
      // We must disable validation for the update since other fields might be missing
      await User.updateOne({ _id: user._id }, { $set: { mobileNumber: dummyNumber } }, { runValidators: false });
      counter++;
    }

    console.log(`Successfully migrated ${users.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
