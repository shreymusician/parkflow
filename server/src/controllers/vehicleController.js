const Vehicle = require('../models/Vehicle');
const { VEHICLE_TYPES } = require('../constants/enums');

// Get all vehicles for the logged-in user
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id, isDeleted: false });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a new vehicle
  exports.addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, vehicleModel, vehicleBrand, vehicleColor } = req.body;
    
    // Check if vehicle number already exists for this user (prevent duplicates)
    const existing = await Vehicle.findOne({ userId: req.user._id, vehicleNumber, isDeleted: false });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Vehicle number already registered' });
    }

    const vehicle = await Vehicle.create({
      userId: req.user._id,
      vehicleNumber,
      vehicleType,
      vehicleModel,
      vehicleBrand,
      vehicleColor
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a vehicle (Soft Delete)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    vehicle.isDeleted = true;
    vehicle.deletedAt = new Date();
    await vehicle.save();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
