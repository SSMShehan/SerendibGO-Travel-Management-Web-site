const Vehicle = require('../../models/Vehicle');
const asyncHandler = require('express-async-handler');

// @desc    Get all vehicles for admin
// @route   GET /api/admin/vehicles
// @access  Private (Admin)
const getAdminVehicles = asyncHandler(async (req, res) => {
  const {
    status,
    vehicleType,
    search,
    owner,
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) {
    query.status = status;
  }

  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  if (owner) {
    query.owner = owner;
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { make: new RegExp(search, 'i') },
      { model: new RegExp(search, 'i') },
      { licensePlate: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  // Sort
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const vehicles = await Vehicle.find(query)
    .populate('owner', 'firstName lastName email phone')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Vehicle.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get vehicle statistics for admin
// @route   GET /api/admin/vehicles/stats
// @access  Private (Admin)
const getVehicleStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case 'week':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      };
      break;
    case 'month':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
      break;
    case 'year':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), 0, 1)
        }
      };
      break;
  }

  const stats = await Vehicle.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        pendingVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        activeVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        suspendedVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        rejectedVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        maintenanceVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get vehicle type distribution
  const vehicleTypeStats = await Vehicle.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$vehicleType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get owner statistics
  const ownerStats = await Vehicle.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$owner',
        vehicleCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'owner'
      }
    },
    { $unwind: '$owner' },
    {
      $project: {
        ownerName: { $concat: ['$owner.firstName', ' ', '$owner.lastName'] },
        ownerEmail: '$owner.email',
        vehicleCount: 1
      }
    },
    { $sort: { vehicleCount: -1 } },
    { $limit: 10 }
  ]);

  const result = stats[0] || {
    totalVehicles: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    activeVehicles: 0,
    suspendedVehicles: 0,
    rejectedVehicles: 0,
    maintenanceVehicles: 0
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: result,
      vehicleTypeStats,
      ownerStats,
      period
    }
  });
});

// @desc    Get pending vehicles for admin
// @route   GET /api/admin/vehicles/pending
// @access  Private (Admin)
const getPendingVehicles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const vehicles = await Vehicle.find({ status: 'pending' })
    .populate('owner', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const total = await Vehicle.countDocuments({ status: 'pending' });

  res.status(200).json({
    status: 'success',
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Bulk update vehicle status
// @route   PUT /api/admin/vehicles/bulk-status
// @access  Private (Admin)
const bulkUpdateVehicleStatus = asyncHandler(async (req, res) => {
  const { vehicleIds, status, rejectionReason, adminNotes } = req.body;

  if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Vehicle IDs are required'
    });
  }

  if (!status) {
    return res.status(400).json({
      status: 'error',
      message: 'Status is required'
    });
  }

  const updateData = {
    status,
    approvalDetails: {
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      adminNotes
    }
  };

  const result = await Vehicle.updateMany(
    { _id: { $in: vehicleIds } },
    updateData
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} vehicles updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Get vehicle approval history
// @route   GET /api/admin/vehicles/:id/history
// @access  Private (Admin)
const getVehicleHistory = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('owner', 'firstName lastName email phone')
    .populate('approvalDetails.approvedBy', 'firstName lastName email');

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Get booking history for this vehicle
  const VehicleBooking = require('../../models/vehicles/VehicleBooking');
  const bookings = await VehicleBooking.find({ vehicle: vehicle._id })
    .populate('user', 'firstName lastName email')
    .sort({ bookedAt: -1 })
    .limit(10);

  res.status(200).json({
    status: 'success',
    data: {
      vehicle,
      bookings
    }
  });
});

// @desc    Export vehicles data
// @route   GET /api/admin/vehicles/export
// @access  Private (Admin)
const exportVehicles = asyncHandler(async (req, res) => {
  const { format = 'json', status, vehicleType } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (vehicleType) query.vehicleType = vehicleType;

  const vehicles = await Vehicle.find(query)
    .populate('owner', 'firstName lastName email phone')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = vehicles.map(vehicle => ({
      name: vehicle.name,
      vehicleType: vehicle.vehicleType,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      ownerName: `${vehicle.owner.firstName} ${vehicle.owner.lastName}`,
      ownerEmail: vehicle.owner.email,
      basePrice: vehicle.pricing.basePrice,
      currency: vehicle.pricing.currency,
      createdAt: vehicle.createdAt
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vehicles.csv');
    
    // Simple CSV conversion
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    res.send(csv);
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        vehicles,
        exportedAt: new Date(),
        totalCount: vehicles.length
      }
    });
  }
});

module.exports = {
  getAdminVehicles,
  getVehicleStats,
  getPendingVehicles,
  bulkUpdateVehicleStatus,
  getVehicleHistory,
  exportVehicles
};
