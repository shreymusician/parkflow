const Location = require('../models/Location');
const Slot = require('../models/Slot');
const Reservation = require('../models/Reservation');
const ParkingSession = require('../models/ParkingSession');
const Waitlist = require('../models/Waitlist');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Overall Metrics (Using Facet for single DB call)
    const metricsResult = await Slot.aggregate([
      {
        $facet: {
          slotsStats: [
            {
              $group: {
                _id: null,
                totalSlots: { $sum: 1 },
                availableSlots: { $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] } },
                occupiedSlots: { $sum: { $cond: [{ $eq: ["$status", "OCCUPIED"] }, 1, 0] } },
                reservedSlots: { $sum: { $cond: [{ $eq: ["$status", "RESERVED"] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    const locationsCount = await Location.countDocuments({ isDeleted: false });
    const waitlistCount = await Waitlist.countDocuments({ status: 'WAITING' });
    const usersCount = await User.countDocuments({ isDeleted: false });
    const vehiclesCount = await Vehicle.countDocuments({ isDeleted: false });
    
    // Reservations stats
    const resStats = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ["$reservationStatus", "ACTIVE"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$reservationStatus", "COMPLETED"] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ["$reservationStatus", "EXPIRED"] }, 1, 0] } }
        }
      }
    ]);

    // Sessions stats
    const sessStats = await ParkingSession.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ["$sessionStatus", "ACTIVE"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$sessionStatus", "COMPLETED"] }, 1, 0] } }
        }
      }
    ]);

    const metrics = {
      totalLocations: locationsCount,
      totalSlots: metricsResult[0].slotsStats[0]?.totalSlots || 0,
      availableSlots: metricsResult[0].slotsStats[0]?.availableSlots || 0,
      occupiedSlots: metricsResult[0].slotsStats[0]?.occupiedSlots || 0,
      reservedSlots: metricsResult[0].slotsStats[0]?.reservedSlots || 0,
      reservations: resStats[0] || { active: 0, completed: 0, expired: 0 },
      sessions: sessStats[0] || { active: 0, completed: 0 },
      usersWaiting: waitlistCount,
      totalUsers: usersCount,
      totalVehicles: vehiclesCount
    };

    // 2. Reservation Trends (Group by Day)
    const reservationTrends = await Reservation.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // 3. Session Trends (Group by Day)
    const sessionTrends = await ParkingSession.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // 4. Top Locations by Reservation Count & Session Count
    const topLocations = await Reservation.aggregate([
      {
        $group: {
          _id: "$locationId",
          reservationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'parkingsessions',
          localField: '_id',
          foreignField: 'locationId',
          as: 'sessions'
        }
      },
      {
        $addFields: {
          sessionCount: { $size: "$sessions" }
        }
      },
      { $sort: { reservationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'locationInfo'
        }
      },
      { $unwind: "$locationInfo" },
      {
        $project: {
          name: "$locationInfo.name",
          reservationCount: 1,
          sessionCount: 1
        }
      }
    ]);

    // 5. New Users This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // 6. Vehicle Type Distribution & EV Count
    const vehicleDistAggr = await Vehicle.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } }
    ]);
    const vehicleDistribution = vehicleDistAggr.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const evVehicleCount = (vehicleDistribution['EV_CAR'] || 0) + (vehicleDistribution['EV_BIKE'] || 0) + (vehicleDistribution['EV'] || 0);

    // 7. Most Active Users
    const mostActiveUsers = await Reservation.aggregate([
      {
        $group: {
          _id: "$userId",
          reservationCount: { $sum: 1 }
        }
      },
      { $sort: { reservationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          reservationCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        ...metrics,
        newUsersThisMonth,
        evVehicleCount
      },
      reservationTrends: reservationTrends.map(t => ({ date: t._id, count: t.count })),
      sessionTrends: sessionTrends.map(t => ({ date: t._id, count: t.count })),
      topLocations,
      vehicleDistribution,
      mostActiveUsers
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
