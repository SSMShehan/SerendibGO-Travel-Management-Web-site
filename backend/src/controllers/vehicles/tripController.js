const asyncHandler = require('express-async-handler');
const Trip = require('../../models/vehicles/Trip');
const VehicleBookingRequest = require('../../models/vehicles/VehicleBookingRequest');
const Vehicle = require('../../models/Vehicle');
const User = require('../../models/User');

// @desc    Create a new trip from booking request
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const tripData = req.body;
  
  // Generate trip reference
  const tripReference = Trip.generateTripReference();
  
  // Verify booking request exists and is confirmed
  const bookingRequest = await VehicleBookingRequest.findById(tripData.bookingRequest);
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  if (bookingRequest.status !== 'confirmed') {
    res.status(400);
    throw new Error('Booking request must be confirmed to create a trip');
  }
  
  // Verify vehicle exists and is available
  const vehicle = await Vehicle.findById(tripData.vehicle);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.status !== 'active') {
    res.status(400);
    throw new Error('Vehicle is not available for trips');
  }
  
  // Create trip
  const trip = await Trip.create({
    ...tripData,
    tripReference,
    customer: bookingRequest.customer,
    vehicleOwner: bookingRequest.vehicleOwner
  });
  
  // Add initial status to history
  trip.statusHistory.push({
    status: 'scheduled',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Trip created from booking request'
  });
  
  await trip.save();
  
  // Populate the response
  await trip.populate([
    { path: 'customer', select: 'name email phone' },
    { path: 'vehicleOwner', select: 'name email phone' },
    { path: 'driver', select: 'name phone' },
    { path: 'vehicle', select: 'name make model type' },
    { path: 'bookingRequest', select: 'bookingReference' }
  ]);
  
  res.status(201).json({
    status: 'success',
    message: 'Trip created successfully',
    data: { trip }
  });
});

// @desc    Get trips for a user
// @route   GET /api/trips
// @access  Private
const getUserTrips = asyncHandler(async (req, res) => {
  const { status, dateFrom, dateTo, search, page = 1, limit = 10 } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (dateFrom && dateTo) {
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }
  if (search) filters.search = search;
  
  const skip = (page - 1) * limit;
  
  const trips = await Trip.getUserTrips(req.user.id, req.user.role, filters)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Trip.countDocuments({
    $or: [
      { customer: req.user.id },
      { vehicleOwner: req.user.id },
      { driver: req.user.id }
    ]
  });
  
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

// @desc    Get a specific trip
// @route   GET /api/trips/:tripId
// @access  Private
const getTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  
  const trip = await Trip.findById(tripId)
    .populate('customer', 'name email phone')
    .populate('vehicleOwner', 'name email phone')
    .populate('driver', 'name phone')
    .populate('vehicle', 'name make model type')
    .populate('bookingRequest', 'bookingReference')
    .populate('statusHistory.updatedBy', 'name email')
    .populate('communication.sender', 'name email');
  
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization
  if (trip.customer._id.toString() !== req.user.id && 
      trip.vehicleOwner._id.toString() !== req.user.id && 
      trip.driver?._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this trip');
  }
  
  res.status(200).json({
    status: 'success',
    data: { trip }
  });
});

// @desc    Update trip status
// @route   PATCH /api/trips/:tripId/status
// @access  Private
const updateTripStatus = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { status, reason, notes, location } = req.body;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization
  if (trip.customer.toString() !== req.user.id && 
      trip.vehicleOwner.toString() !== req.user.id && 
      trip.driver?.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this trip');
  }
  
  // Validate status transition
  const validTransitions = {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'delayed'],
    delayed: ['in_progress', 'completed'],
    completed: [],
    cancelled: [],
    no_show: []
  };
  
  if (!validTransitions[trip.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${trip.status} to ${status}`);
  }
  
  // Update status
  const oldStatus = trip.status;
  trip.status = status;
  
  // Update tracking if starting trip
  if (status === 'in_progress') {
    trip.tracking.isActive = true;
    trip.actualStartTime = new Date();
  }
  
  // Update tracking if completing trip
  if (status === 'completed') {
    trip.tracking.isActive = false;
    trip.actualEndTime = new Date();
    trip.actualDuration = Math.round((trip.actualEndTime - trip.actualStartTime) / (1000 * 60)); // minutes
  }
  
  // Add to status history
  trip.statusHistory.push({
    status,
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes,
    location
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: `Trip ${status} successfully`,
    data: { trip }
  });
});

// @desc    Update trip tracking
// @route   PATCH /api/trips/:tripId/tracking
// @access  Private (Driver)
const updateTripTracking = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { latitude, longitude, address, speed, heading, accuracy } = req.body;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization (only driver can update tracking)
  if (trip.driver?.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update trip tracking');
  }
  
  // Update last known location
  trip.tracking.lastKnownLocation = {
    latitude,
    longitude,
    address,
    timestamp: new Date()
  };
  
  // Add to tracking history
  trip.tracking.trackingHistory.push({
    latitude,
    longitude,
    timestamp: new Date(),
    speed,
    heading,
    accuracy
  });
  
  // Keep only last 100 tracking points to prevent document size issues
  if (trip.tracking.trackingHistory.length > 100) {
    trip.tracking.trackingHistory = trip.tracking.trackingHistory.slice(-100);
  }
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Tracking updated successfully',
    data: { trip }
  });
});

// @desc    Add communication message
// @route   POST /api/trips/:tripId/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { message, type = 'message' } = req.body;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization
  if (trip.customer.toString() !== req.user.id && 
      trip.vehicleOwner.toString() !== req.user.id && 
      trip.driver?.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add messages to this trip');
  }
  
  // Add message to communication
  trip.communication.push({
    sender: req.user.id,
    message,
    type,
    timestamp: new Date()
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Message added successfully',
    data: { trip }
  });
});

// @desc    Assign driver to trip
// @route   PATCH /api/trips/:tripId/assign-driver
// @access  Private (Vehicle Owner)
const assignDriver = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { driverId, notes } = req.body;
  
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
  
  // Verify driver exists
  const driver = await User.findById(driverId);
  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }
  
  if (driver.role !== 'driver') {
    res.status(400);
    throw new Error('User is not a driver');
  }
  
  // Assign driver
  trip.driver = driverId;
  trip.driverNotes = notes;
  
  // Add to status history
  trip.statusHistory.push({
    status: trip.status,
    timestamp: new Date(),
    reason: 'Driver assigned',
    updatedBy: req.user.id,
    notes: `Driver ${driver.name} assigned to trip`
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Driver assigned successfully',
    data: { trip }
  });
});

// @desc    Cancel trip
// @route   PATCH /api/trips/:tripId/cancel
// @access  Private
const cancelTrip = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { reason, refundAmount } = req.body;
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  
  // Check authorization
  if (trip.customer.toString() !== req.user.id && 
      trip.vehicleOwner.toString() !== req.user.id && 
      trip.driver?.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this trip');
  }
  
  // Check if trip can be cancelled
  if (!trip.canBeCancelled) {
    res.status(400);
    throw new Error('Trip cannot be cancelled');
  }
  
  // Update cancellation details
  trip.status = 'cancelled';
  trip.cancellation.cancelledBy = req.user.id;
  trip.cancellation.cancellationReason = reason;
  trip.cancellation.cancellationTime = new Date();
  trip.cancellation.refundAmount = refundAmount || 0;
  
  // Add to status history
  trip.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes: `Cancelled by ${req.user.role}`
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Trip cancelled successfully',
    data: { trip }
  });
});

// @desc    Get active trips
// @route   GET /api/trips/active
// @access  Private
const getActiveTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.getActiveTrips();
  
  res.status(200).json({
    status: 'success',
    data: { trips }
  });
});

// @desc    Get trip statistics
// @route   GET /api/trips/stats
// @access  Private
const getTripStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
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
  
  const baseQuery = req.user.role === 'admin' ? {} : 
    req.user.role === 'vehicle_owner' ? { vehicleOwner: req.user.id } : 
    req.user.role === 'driver' ? { driver: req.user.id } :
    { customer: req.user.id };
  
  const query = { ...baseQuery, ...dateFilter };
  
  const stats = await Trip.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalPrice' },
        averagePrice: { $avg: '$pricing.totalPrice' },
        totalDistance: { $sum: '$totalDistance' },
        averageDistance: { $avg: '$totalDistance' },
        statusCounts: {
          $push: '$status'
        }
      }
    }
  ]);
  
  const statusCounts = {};
  if (stats.length > 0) {
    stats[0].statusCounts.forEach(status => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      totalTrips: stats[0]?.totalTrips || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      averagePrice: stats[0]?.averagePrice || 0,
      totalDistance: stats[0]?.totalDistance || 0,
      averageDistance: stats[0]?.averageDistance || 0,
      statusCounts
    }
  });
});

module.exports = {
  createTrip,
  getUserTrips,
  getTrip,
  updateTripStatus,
  updateTripTracking,
  addMessage,
  assignDriver,
  cancelTrip,
  getActiveTrips,
  getTripStats
};
