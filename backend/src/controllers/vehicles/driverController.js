const asyncHandler = require('express-async-handler');
const Driver = require('../../models/vehicles/Driver');
const User = require('../../models/User');
const Trip = require('../../models/vehicles/Trip');

// @desc    Register a new driver
// @route   POST /api/drivers/register
// @access  Private
const registerDriver = asyncHandler(async (req, res) => {
  const driverData = req.body;
  
  // Generate driver ID
  const driverId = Driver.generateDriverId();
  
  // Verify user exists and is not already a driver
  const existingDriver = await Driver.findOne({ user: req.user.id });
  if (existingDriver) {
    res.status(400);
    throw new Error('User is already registered as a driver');
  }
  
  // Create driver profile
  const driver = await Driver.create({
    ...driverData,
    user: req.user.id,
    driverId
  });
  
  // Add initial status to history
  driver.statusHistory.push({
    status: 'pending',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Driver registration submitted'
  });
  
  await driver.save();
  
  // Update user role to driver
  await User.findByIdAndUpdate(req.user.id, { role: 'driver' });
  
  // Populate the response
  await driver.populate('user', 'name email phone');
  
  res.status(201).json({
    status: 'success',
    message: 'Driver registration submitted successfully',
    data: { driver }
  });
});

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Admin, Vehicle Owner)
const getDrivers = asyncHandler(async (req, res) => {
  const { status, city, district, vehicleType, minRating, page = 1, limit = 10 } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (city) query['serviceAreas.city'] = { $regex: new RegExp(city, 'i') };
  if (district) query['serviceAreas.district'] = { $regex: new RegExp(district, 'i') };
  if (vehicleType) query['vehicleTypes.vehicleType'] = vehicleType;
  if (minRating) query['performance.averageRating'] = { $gte: parseFloat(minRating) };
  
  const skip = (page - 1) * limit;
  
  const drivers = await Driver.find(query)
    .populate('user', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ 'performance.averageRating': -1, createdAt: -1 });
  
  const total = await Driver.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: { 
      drivers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get available drivers
// @route   GET /api/drivers/available
// @access  Private
const getAvailableDrivers = asyncHandler(async (req, res) => {
  const { city, district, vehicleType, startTime, endTime, maxDistance, minRating } = req.query;
  
  const criteria = {};
  if (city) criteria.city = city;
  if (district) criteria.district = district;
  if (vehicleType) criteria.vehicleType = vehicleType;
  if (startTime) criteria.startTime = startTime;
  if (endTime) criteria.endTime = endTime;
  if (maxDistance) criteria.maxDistance = parseInt(maxDistance);
  if (minRating) criteria.minRating = parseFloat(minRating);
  
  const drivers = await Driver.findAvailableDrivers(criteria);
  
  res.status(200).json({
    status: 'success',
    data: { drivers }
  });
});

// @desc    Get a specific driver
// @route   GET /api/drivers/:driverId
// @access  Private
const getDriver = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  
  const driver = await Driver.findById(driverId)
    .populate('user', 'name email phone')
    .populate('statusHistory.updatedBy', 'name email');
  
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  // Check authorization
  if (driver.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'vehicle_owner') {
    res.status(403);
    throw new Error('Not authorized to access this driver profile');
  }
  
  res.status(200).json({
    status: 'success',
    data: { driver }
  });
});

// @desc    Get driver by user ID
// @route   GET /api/drivers/user/:userId
// @access  Private
const getDriverByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  const driver = await Driver.findOne({ user: userId })
    .populate('user', 'name email phone')
    .populate('statusHistory.updatedBy', 'name email');
  
  if (!driver) {
    return res.status(404).json({
      status: 'error',
      message: 'Driver profile not found',
      data: { needsRegistration: true }
    });
  }
  
  // Check authorization
  if (driver.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'vehicle_owner') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this driver profile'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { driver }
  });
});

// @desc    Update driver profile by user ID
// @route   PUT /api/drivers/user/:userId/profile
// @access  Private
const updateDriverProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user is authenticated
  if (!req.user) {
    res.status(401);
    throw new Error('Authentication required');
  }
  
  // Check authorization - user can only update their own profile
  if (req.user.id !== userId && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this driver profile');
  }
  
  const driver = await Driver.findOne({ user: userId });
  
  if (!driver) {
    return res.status(404).json({
      status: 'error',
      message: 'Driver not found for this user',
      data: { needsRegistration: true }
    });
  }
  
  // Update driver profile
  const updatedDriver = await Driver.findByIdAndUpdate(
    driver._id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email phone');
  
  // Add status update to history
  updatedDriver.statusHistory.push({
    status: updatedDriver.status,
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Profile updated'
  });
  
  await updatedDriver.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Driver profile updated successfully',
    data: { driver: updatedDriver }
  });
});

// @desc    Update driver status
// @route   PATCH /api/drivers/:driverId/status
// @access  Private (Admin)
const updateDriverStatus = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { status, reason, notes } = req.body;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  // Check authorization
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    res.status(403);
    throw new Error('Not authorized to update driver status');
  }
  
  // Validate status transition
  const validTransitions = {
    pending: ['active', 'suspended', 'inactive'],
    active: ['suspended', 'inactive', 'blacklisted'],
    suspended: ['active', 'inactive', 'blacklisted'],
    inactive: ['active', 'suspended'],
    blacklisted: ['inactive'] // Can only be moved to inactive
  };
  
  if (!validTransitions[driver.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${driver.status} to ${status}`);
  }
  
  // Update status
  const oldStatus = driver.status;
  driver.status = status;
  
  // Add to status history
  driver.statusHistory.push({
    status,
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes
  });
  
  await driver.save();
  
  res.status(200).json({
    status: 'success',
    message: `Driver status updated to ${status}`,
    data: { driver }
  });
});

// @desc    Update driver location
// @route   PATCH /api/drivers/:driverId/location
// @access  Private (Driver)
const updateDriverLocation = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { latitude, longitude, address, isOnline } = req.body;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  // Check authorization
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update driver location');
  }
  
  // Update location
  driver.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdated: new Date(),
    isOnline: isOnline !== undefined ? isOnline : driver.currentLocation.isOnline
  };
  
  await driver.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Driver location updated successfully',
    data: { driver }
  });
});

// @desc    Update driver profile
// @route   PATCH /api/drivers/:driverId/profile
// @access  Private (Driver)
const updateDriverProfile = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const updateData = req.body;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  // Check authorization
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this driver profile');
  }
  
  // Update driver profile
  Object.assign(driver, updateData);
  await driver.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Driver profile updated successfully',
    data: { driver }
  });
});

// @desc    Assign driver to trip
// @route   POST /api/drivers/:driverId/assign-trip
// @access  Private (Vehicle Owner, Admin)
const assignDriverToTrip = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { tripId, notes } = req.body;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization
  if (trip.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to assign driver to this trip');
  }
  
  // Check if driver is available
  if (!driver.canBeAssigned) {
    res.status(400);
    throw new Error('Driver is not available for assignment');
  }
  
  // Check if trip is assignable
  if (!['scheduled', 'confirmed'].includes(trip.status)) {
    res.status(400);
    throw new Error('Trip is not available for driver assignment');
  }
  
  // Assign driver to trip
  trip.driver = driver.user;
  trip.driverNotes = notes;
  
  // Add to trip status history
  trip.statusHistory.push({
    status: trip.status,
    timestamp: new Date(),
    reason: 'Driver assigned',
    updatedBy: req.user.id,
    notes: `Driver ${driver.user.name} assigned to trip`
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Driver assigned to trip successfully',
    data: { trip }
  });
});

// @desc    Get driver trips
// @route   GET /api/drivers/:driverId/trips
// @access  Private
const getDriverTrips = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    return res.status(404).json({
      status: 'error',
      message: 'Driver not found'
    });
  }
  
  // Check authorization
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view driver trips'
    });
  }
  
  const filters = {};
  if (status) filters.status = status;
  if (dateFrom && dateTo) {
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }
  
  const skip = (page - 1) * limit;
  
  // Build query for driver trips
  let query = { driver: driver.user._id };
  if (filters.status) query.status = filters.status;
  if (filters.dateFrom && filters.dateTo) {
    query.scheduledStartTime = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  const trips = await Trip.find(query)
    .populate('customer', 'name email phone')
    .populate('vehicleOwner', 'name email phone')
    .populate('driver', 'name phone')
    .populate('vehicle', 'name make model type')
    .populate('bookingRequest', 'bookingReference')
    .sort({ scheduledStartTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Trip.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: { 
      trips,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get driver statistics
// @route   GET /api/drivers/stats
// @access  Private (Admin)
const getDriverStats = asyncHandler(async (req, res) => {
  const { period = 'month', driverId } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
      break;
  }
  
  let stats;
  
  // If user is a driver and requesting their own stats
  if (req.user.role === 'driver' && driverId) {
    // Verify the driverId belongs to the requesting user
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver || driver._id.toString() !== driverId) {
      res.status(403);
      throw new Error('Not authorized to view these driver stats');
    }
    
    // Get driver-specific stats
    stats = await Driver.getDriverPersonalStats(driverId, dateFilter);
  } else if (req.user.role === 'admin') {
    // Admin gets global stats
    stats = await Driver.getDriverStats(dateFilter);
  } else {
    res.status(403);
    throw new Error('Not authorized to view driver stats');
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      ...stats
    }
  });
});

// @desc    Verify driver documents
// @route   PATCH /api/drivers/:driverId/verify
// @access  Private (Admin)
const verifyDriverDocuments = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { verificationType, isVerified, notes } = req.body;
  
  const driver = await Driver.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  // Check authorization
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to verify driver documents');
  }
  
  // Update verification status
  if (driver.verification[verificationType] !== undefined) {
    driver.verification[verificationType] = isVerified;
    driver.verification.verificationDate = new Date();
    driver.verification.verifiedBy = req.user.id;
  }
  
  await driver.save();
  
  res.status(200).json({
    status: 'success',
    message: `${verificationType} verification updated`,
    data: { driver }
  });
});

module.exports = {
  registerDriver,
  getDrivers,
  getAvailableDrivers,
  getDriver,
  getDriverByUserId,
  updateDriverProfileByUserId,
  updateDriverStatus,
  updateDriverLocation,
  updateDriverProfile,
  assignDriverToTrip,
  getDriverTrips,
  getDriverStats,
  verifyDriverDocuments
};
