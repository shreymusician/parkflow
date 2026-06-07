const mongoose = require('mongoose');
const { ROLES } = require('../constants/enums');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    match: [
      /^\d{10}$/,
      'Please add a valid 10-digit mobile number',
    ],
  },
  defaultVehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
  },
  dob: {
    type: Date,
  },
  city: {
    type: String,
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
