const mongoose = require('mongoose');
require('dotenv').config();

const clearParkingData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const collectionsToClear = [
      'locations', 'slots', 'reservations', 'parkingsessions', 'temporaryreservations', 'analyticssnapshots'
    ];

    for (const name of collectionsToClear) {
      if (mongoose.connection.collections[name]) {
        await mongoose.connection.collections[name].deleteMany({});
        console.log(`Cleared ${name}`);
      }
    }

    console.log('Cleared parking data.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearParkingData();
