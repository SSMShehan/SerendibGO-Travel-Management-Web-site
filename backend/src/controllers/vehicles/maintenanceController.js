const asyncHandler = require('express-async-handler');
const MaintenanceRecord = require('../../models/vehicles/MaintenanceRecord');
const Vehicle = require('../../models/Vehicle');
const User = require('../../models/User');

// @desc    Create a new maintenance record
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const maintenanceData = req.body;
  
  // Generate maintenance reference
  const maintenanceReference = MaintenanceRecord.generateMaintenanceReference();
  
  // Verify vehicle exists and user owns it
  const vehicle = await Vehicle.findById(maintenanceData.vehicle);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to create maintenance records for this vehicle');
  }
  
  // Create maintenance record
  const maintenanceRecord = await MaintenanceRecord.create({
    ...maintenanceData,
    vehicleOwner: vehicle.owner,
    maintenanceReference
  });
  
  // Add initial status to history
  maintenanceRecord.statusHistory.push({
    status: 'scheduled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Maintenance record created'
  });
  
  await maintenanceRecord.save();
  
  // Populate the response
  await maintenanceRecord.populate([
    { path: 'vehicle', select: 'name make model' },
    { path: 'vehicleOwner', select: 'name email' }
  ]);
  
  res.status(201).json({
    status: 'success',
    message: 'Maintenance record created successfully',
    data: { maintenanceRecord }
  });
});

// @desc    Get maintenance records for a vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId
// @access  Private
const getVehicleMaintenance = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { status, maintenanceType, dateFrom, dateTo, serviceProvider, page = 1, limit = 10 } = req.query;
  
  // Verify vehicle exists and user has access
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view maintenance records for this vehicle');
  }
  
  const filters = {};
  if (status) filters.status = status;
  if (maintenanceType) filters.maintenanceType = maintenanceType;
  if (dateFrom && dateTo) {
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }
  if (serviceProvider) filters.serviceProvider = serviceProvider;
  
  const skip = (page - 1) * limit;
  
  const maintenanceRecords = await MaintenanceRecord.getVehicleMaintenance(vehicleId, filters)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await MaintenanceRecord.countDocuments({ vehicle: vehicleId });
  
  res.status(200).json({
    status: 'success',
    data: { 
      maintenanceRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get all maintenance records for a user
// @route   GET /api/maintenance
// @access  Private
const getUserMaintenance = asyncHandler(async (req, res) => {
  const { status, maintenanceType, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  
  const query = {};
  
  if (req.user.role === 'vehicle_owner') {
    query.vehicleOwner = req.user.id;
  } else if (req.user.role === 'admin') {
    // Admin can see all maintenance records
  } else {
    res.status(403);
    throw new Error('Not authorized to view maintenance records');
  }
  
  if (status) query.status = status;
  if (maintenanceType) query.maintenanceType = maintenanceType;
  if (dateFrom && dateTo) {
    query.scheduledDate = {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo)
    };
  }
  
  const skip = (page - 1) * limit;
  
  const maintenanceRecords = await MaintenanceRecord.find(query)
    .populate('vehicle', 'name make model')
    .populate('vehicleOwner', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ scheduledDate: -1 });
  
  const total = await MaintenanceRecord.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: { 
      maintenanceRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get a specific maintenance record
// @route   GET /api/maintenance/:maintenanceId
// @access  Private
const getMaintenanceRecord = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId)
    .populate('vehicle', 'name make model')
    .populate('vehicleOwner', 'name email')
    .populate('statusHistory.updatedBy', 'name email')
    .populate('maintenanceItems.completedBy', 'name email');
  
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this maintenance record');
  }
  
  res.status(200).json({
    status: 'success',
    data: { maintenanceRecord }
  });
});

// @desc    Update maintenance record status
// @route   PATCH /api/maintenance/:maintenanceId/status
// @access  Private
const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  const { status, reason, notes } = req.body;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId);
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this maintenance record');
  }
  
  // Validate status transition
  const validTransitions = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'on_hold'],
    completed: [],
    cancelled: [],
    on_hold: ['in_progress', 'cancelled']
  };
  
  if (!validTransitions[maintenanceRecord.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${maintenanceRecord.status} to ${status}`);
  }
  
  // Update status
  const oldStatus = maintenanceRecord.status;
  maintenanceRecord.status = status;
  
  // Update dates based on status
  if (status === 'in_progress' && !maintenanceRecord.actualStartDate) {
    maintenanceRecord.actualStartDate = new Date();
  }
  
  if (status === 'completed' && !maintenanceRecord.actualEndDate) {
    maintenanceRecord.actualEndDate = new Date();
    if (maintenanceRecord.actualStartDate) {
      maintenanceRecord.actualDuration = Math.round(
        (maintenanceRecord.actualEndDate - maintenanceRecord.actualStartDate) / (1000 * 60 * 60)
      );
    }
  }
  
  // Add to status history
  maintenanceRecord.statusHistory.push({
    status,
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes
  });
  
  await maintenanceRecord.save();
  
  res.status(200).json({
    status: 'success',
    message: `Maintenance status updated to ${status}`,
    data: { maintenanceRecord }
  });
});

// @desc    Update maintenance record
// @route   PATCH /api/maintenance/:maintenanceId
// @access  Private
const updateMaintenanceRecord = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  const updateData = req.body;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId);
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this maintenance record');
  }
  
  // Update maintenance record
  Object.assign(maintenanceRecord, updateData);
  await maintenanceRecord.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Maintenance record updated successfully',
    data: { maintenanceRecord }
  });
});

// @desc    Add maintenance item
// @route   POST /api/maintenance/:maintenanceId/items
// @access  Private
const addMaintenanceItem = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  const itemData = req.body;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId);
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add items to this maintenance record');
  }
  
  // Add maintenance item
  maintenanceRecord.maintenanceItems.push(itemData);
  await maintenanceRecord.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Maintenance item added successfully',
    data: { maintenanceRecord }
  });
});

// @desc    Update maintenance item
// @route   PATCH /api/maintenance/:maintenanceId/items/:itemIndex
// @access  Private
const updateMaintenanceItem = asyncHandler(async (req, res) => {
  const { maintenanceId, itemIndex } = req.params;
  const updateData = req.body;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId);
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update items in this maintenance record');
  }
  
  const itemIndexNum = parseInt(itemIndex);
  if (itemIndexNum < 0 || itemIndexNum >= maintenanceRecord.maintenanceItems.length) {
    res.status(400);
    throw new Error('Invalid item index');
  }
  
  // Update maintenance item
  Object.assign(maintenanceRecord.maintenanceItems[itemIndexNum], updateData);
  await maintenanceRecord.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Maintenance item updated successfully',
    data: { maintenanceRecord }
  });
});

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private
const getMaintenanceStats = asyncHandler(async (req, res) => {
  const { vehicleId, period = 'year' } = req.query;
  
  let query = {};
  
  if (req.user.role === 'vehicle_owner') {
    query.vehicleOwner = req.user.id;
  } else if (req.user.role === 'admin') {
    // Admin can see all stats
  } else {
    res.status(403);
    throw new Error('Not authorized to view maintenance statistics');
  }
  
  if (vehicleId) {
    query.vehicle = vehicleId;
  }
  
  const stats = await MaintenanceRecord.getMaintenanceStats(vehicleId, period);
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      ...stats
    }
  });
});

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:maintenanceId
// @access  Private
const deleteMaintenanceRecord = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  
  const maintenanceRecord = await MaintenanceRecord.findById(maintenanceId);
  if (!maintenanceRecord) {
    res.status(404);
    throw new Error('Maintenance record not found');
  }
  
  // Check authorization
  if (maintenanceRecord.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this maintenance record');
  }
  
  await maintenanceRecord.deleteOne();
  
  res.status(200).json({
    status: 'success',
    message: 'Maintenance record deleted successfully'
  });
});

module.exports = {
  createMaintenanceRecord,
  getVehicleMaintenance,
  getUserMaintenance,
  getMaintenanceRecord,
  updateMaintenanceStatus,
  updateMaintenanceRecord,
  addMaintenanceItem,
  updateMaintenanceItem,
  getMaintenanceStats,
  deleteMaintenanceRecord
};
