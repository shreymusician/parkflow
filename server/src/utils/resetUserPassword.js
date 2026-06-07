/**
 * resetUserPassword.js
 * ---------------------
 * Resets a user's password directly in MongoDB.
 * Usage:
 *   node src/utils/resetUserPassword.js <email> <newPassword>
 *
 * Example:
 *   node src/utils/resetUserPassword.js shreyasdbms@gmail.com MyNewPass@123
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const dotenv   = require('dotenv');
const User     = require('../models/User');

dotenv.config();

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('\n❌  Usage: node src/utils/resetUserPassword.js <email> <newPassword>\n');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      console.error(`❌  No user found with email: ${email}`);
      process.exit(1);
    }

    const salt         = await bcrypt.genSalt(10);
    user.passwordHash  = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`\n✅  Password reset successfully for: ${email}`);
    console.log(`    New password : ${newPassword}`);
    console.log(`    Role         : ${user.role}\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  }
})();
