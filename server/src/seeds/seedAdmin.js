const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = 'admin@parking.com';
    const adminPassword = 'adminpassword123';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log('Admin user already exists. Overwriting credentials and promoting to ADMIN role to be safe...');
      admin.role = 'ADMIN'; // Ensuring role is ADMIN
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(adminPassword, salt);
      await admin.save();
      console.log('Admin user updated successfully!');
    } else {
      console.log('Admin user not found. Creating a new one...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN' // Based on your ROLES enum
      });
      console.log('Admin user created successfully!');
    }

    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
