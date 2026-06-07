const Location = require('../models/Location');

exports.getLocations = async (req, res) => {
  try {
    const Slot = require('../models/Slot');
    // We need to return availableSlots alongside the basic Location data
    const locations = await Location.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'slots',
          localField: '_id',
          foreignField: 'locationId',
          as: 'slots'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          location: 1,
          totalCapacity: { $size: "$slots" },
          occupiedCount: {
            $size: {
              $filter: {
                input: "$slots",
                as: "slot",
                cond: { $ne: ["$$slot.status", "AVAILABLE"] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          location: 1,
          totalCapacity: 1,
          availableSlots: { $subtract: ["$totalCapacity", "$occupiedCount"] }
        }
      }
    ]);
    res.status(200).json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getHeatmap = async (req, res) => {
  try {
    const Slot = require('../models/Slot');
    // Aggregation pipeline to dynamically calculate occupancy per location
    const heatmapData = await Location.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'slots',
          localField: '_id',
          foreignField: 'locationId',
          as: 'slots'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          coordinates: 1,
          basePrice: 1,
          totalCapacity: { $size: "$slots" },
          occupiedCount: {
            $size: {
              $filter: {
                input: "$slots",
                as: "slot",
                cond: { $ne: ["$$slot.status", "AVAILABLE"] }
              }
            }
          }
        }
      },
      {
        $project: {
          locationId: "$_id",
          name: 1,
          latitude: { $arrayElemAt: ["$coordinates.coordinates", 1] },
          longitude: { $arrayElemAt: ["$coordinates.coordinates", 0] },
          basePrice: 1,
          totalCapacity: 1,
          occupiedSlots: "$occupiedCount",
          availableSlots: { $subtract: ["$totalCapacity", "$occupiedCount"] },
          occupancyPercentage: {
            $cond: [
              { $eq: ["$totalCapacity", 0] },
              0,
              { $ceil: { $multiply: [{ $divide: ["$occupiedCount", "$totalCapacity"] }, 100] } }
            ]
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: heatmapData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
