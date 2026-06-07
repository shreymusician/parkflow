const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');
const ParkingSession = require('../models/ParkingSession');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const vehicleCount = await Vehicle.countDocuments({ userId: user._id, isDeleted: false });
    
    // Total Reservations
    const reservationCount = await Reservation.countDocuments({ userId: user._id });

    // Total Sessions
    const sessionCount = await ParkingSession.countDocuments({ userId: user._id });

    // Most Frequent Hub
    const frequentHubAggr = await Reservation.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: "$locationId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: "$location" }
    ]);

    let mostFrequentHub = 'None';
    if (frequentHubAggr.length > 0) {
      mostFrequentHub = frequentHubAggr[0].location.name;
    }

    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          gender: user.gender,
          dob: user.dob,
          city: user.city,
          role: user.role,
          defaultVehicleId: user.defaultVehicleId,
          createdAt: user.createdAt
        },
        stats: {
          registeredVehicles: vehicleCount,
          totalReservations: reservationCount,
          totalSessions: sessionCount,
          mostFrequentHub
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, mobileNumber, gender, dob, city, defaultVehicleId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, mobileNumber, gender, dob, city, defaultVehicleId },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await ParkingSession.aggregate([
      { $match: { userId: req.user._id, sessionStatus: 'COMPLETED' } },
      { $sort: { exitTime: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'locations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      { $unwind: "$location" },
      { $unwind: "$vehicle" },
      {
        $project: {
          sessionId: 1,
          locationName: "$location.name",
          vehicleNumber: "$vehicle.vehicleNumber",
          entryTime: 1,
          exitTime: 1,
          durationMinutes: "$duration",
          totalAmount: 1,
          sessionStatus: 1
        }
      }
    ]);

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
