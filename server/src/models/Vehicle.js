const mongoose = require('mongoose');
const { VEHICLE_TYPES } = require('../constants/enums');

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    enum: Object.values(VEHICLE_TYPES),
    required: true,
  },
  vehicleModel: {
    type: String,
  },
  vehicleBrand: {
    type: String,
  },
  vehicleColor: {
    type: String,
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

module.exports = mongoose.model('Vehicle', vehicleSchema);
