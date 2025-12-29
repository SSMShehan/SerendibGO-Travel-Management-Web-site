const asyncHandler = require('express-async-handler');
const VehicleBookingRequest = require('../../models/vehicles/VehicleBookingRequest');
const Vehicle = require('../../models/Vehicle');
const User = require('../../models/User');

// @desc    Create a new booking request
// @route   POST /api/vehicle-bookings/requests
// @access  Private
const createBookingRequest = asyncHandler(async (req, res) => {
  const bookingData = req.body;
  
  // Generate booking reference
  const bookingReference = VehicleBookingRequest.generateBookingReference();
  
  // Verify vehicle exists and is available
  const vehicle = await Vehicle.findById(bookingData.vehicle);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  if (vehicle.status !== 'active') {
    res.status(400);
    throw new Error('Vehicle is not available for booking');
  }
  
  // Verify customer exists
  const customer = await User.findById(bookingData.customer);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Create booking request
  const bookingRequest = await VehicleBookingRequest.create({
    ...bookingData,
    bookingReference,
    customer: req.user.id,
    vehicleOwner: vehicle.owner
  });
  
  // Add initial status to history
  bookingRequest.statusHistory.push({
    status: 'pending',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Booking request created'
  });
  
  await bookingRequest.save();
  
  // Populate the response
  await bookingRequest.populate([
    { path: 'customer', select: 'name email phone' },
    { path: 'vehicle', select: 'name make model type' },
    { path: 'vehicleOwner', select: 'name email phone' }
  ]);
  
  res.status(201).json({
    status: 'success',
    message: 'Booking request created successfully',
    data: { bookingRequest }
  });
});

// @desc    Get booking requests for vehicle owner
// @route   GET /api/vehicle-bookings/requests/owner
// @access  Private (Vehicle Owner)
const getOwnerBookingRequests = asyncHandler(async (req, res) => {
  const { status, dateFrom, dateTo, search, page = 1, limit = 10 } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (dateFrom && dateTo) {
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }
  if (search) filters.search = search;
  
  const skip = (page - 1) * limit;
  
  const bookingRequests = await VehicleBookingRequest.getOwnerBookings(req.user.id, filters)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await VehicleBookingRequest.countDocuments({ vehicleOwner: req.user.id });
  
  res.status(200).json({
    status: 'success',
    data: { 
      bookingRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get booking requests for customer
// @route   GET /api/vehicle-bookings/requests/customer
// @access  Private (Customer)
const getCustomerBookingRequests = asyncHandler(async (req, res) => {
  const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (dateFrom && dateTo) {
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }
  
  const skip = (page - 1) * limit;
  
  const bookingRequests = await VehicleBookingRequest.getCustomerBookings(req.user.id, filters)
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await VehicleBookingRequest.countDocuments({ customer: req.user.id });
  
  res.status(200).json({
    status: 'success',
    data: { 
      bookingRequests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get a specific booking request
// @route   GET /api/vehicle-bookings/requests/:requestId
// @access  Private
const getBookingRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  
  const bookingRequest = await VehicleBookingRequest.findById(requestId)
    .populate('customer', 'name email phone')
    .populate('vehicle', 'name make model type')
    .populate('vehicleOwner', 'name email phone')
    .populate('driver.assignedDriver', 'name phone')
    .populate('statusHistory.updatedBy', 'name email');
  
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  // Check authorization
  if (bookingRequest.customer._id.toString() !== req.user.id && 
      bookingRequest.vehicleOwner._id.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this booking request');
  }
  
  res.status(200).json({
    status: 'success',
    data: { bookingRequest }
  });
});

// @desc    Update booking request status (Vehicle Owner)
// @route   PATCH /api/vehicle-bookings/requests/:requestId/status
// @access  Private (Vehicle Owner)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, reason, notes, counterOffer } = req.body;
  
  const bookingRequest = await VehicleBookingRequest.findById(requestId);
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  // Check authorization
  if (bookingRequest.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this booking request');
  }
  
  // Validate status transition
  const validTransitions = {
    pending: ['accepted', 'rejected'],
    accepted: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    rejected: ['pending'], // Allow resubmission
    cancelled: [],
    completed: [],
    no_show: []
  };
  
  if (!validTransitions[bookingRequest.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${bookingRequest.status} to ${status}`);
  }
  
  // Update status
  const oldStatus = bookingRequest.status;
  bookingRequest.status = status;
  
  // Update owner response
  if (status === 'accepted') {
    bookingRequest.response.ownerResponse.status = 'accepted';
    bookingRequest.response.ownerResponse.responseTime = new Date();
  } else if (status === 'rejected') {
    bookingRequest.response.ownerResponse.status = 'rejected';
    bookingRequest.response.ownerResponse.responseTime = new Date();
  }
  
  // Handle counter offer
  if (status === 'accepted' && counterOffer) {
    bookingRequest.response.ownerResponse.counterOffer = counterOffer;
  }
  
  // Add to status history
  bookingRequest.statusHistory.push({
    status,
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes
  });
  
  await bookingRequest.save();
  
  res.status(200).json({
    status: 'success',
    message: `Booking request ${status} successfully`,
    data: { bookingRequest }
  });
});

// @desc    Customer response to booking request
// @route   PATCH /api/vehicle-bookings/requests/:requestId/customer-response
// @access  Private (Customer)
const customerResponse = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, message } = req.body;
  
  const bookingRequest = await VehicleBookingRequest.findById(requestId);
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  // Check authorization
  if (bookingRequest.customer.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to respond to this booking request');
  }
  
  // Validate customer response
  const validResponses = ['accepted', 'rejected', 'cancelled'];
  if (!validResponses.includes(status)) {
    res.status(400);
    throw new Error('Invalid customer response status');
  }
  
  // Update customer response
  bookingRequest.response.customerResponse.status = status;
  bookingRequest.response.customerResponse.responseTime = new Date();
  bookingRequest.response.customerResponse.responseMessage = message;
  
  // Update main status based on customer response
  if (status === 'accepted') {
    bookingRequest.status = 'confirmed';
  } else if (status === 'rejected') {
    bookingRequest.status = 'rejected';
  } else if (status === 'cancelled') {
    bookingRequest.status = 'cancelled';
  }
  
  // Add to status history
  bookingRequest.statusHistory.push({
    status: bookingRequest.status,
    timestamp: new Date(),
    reason: `Customer ${status}`,
    updatedBy: req.user.id,
    notes: message
  });
  
  await bookingRequest.save();
  
  res.status(200).json({
    status: 'success',
    message: `Customer response recorded successfully`,
    data: { bookingRequest }
  });
});

// @desc    Add communication message
// @route   POST /api/vehicle-bookings/requests/:requestId/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { message, type = 'message' } = req.body;
  
  const bookingRequest = await VehicleBookingRequest.findById(requestId);
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  // Check authorization
  if (bookingRequest.customer.toString() !== req.user.id && 
      bookingRequest.vehicleOwner.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add messages to this booking request');
  }
  
  // Add message to communication
  bookingRequest.response.communication.push({
    sender: req.user.id,
    message,
    type,
    timestamp: new Date()
  });
  
  await bookingRequest.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Message added successfully',
    data: { bookingRequest }
  });
});

// @desc    Cancel booking request
// @route   PATCH /api/vehicle-bookings/requests/:requestId/cancel
// @access  Private
const cancelBookingRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { reason, refundAmount } = req.body;
  
  const bookingRequest = await VehicleBookingRequest.findById(requestId);
  if (!bookingRequest) {
    res.status(404);
    throw new Error('Booking request not found');
  }
  
  // Check authorization
  if (bookingRequest.customer.toString() !== req.user.id && 
      bookingRequest.vehicleOwner.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this booking request');
  }
  
  // Check if booking can be cancelled
  if (!bookingRequest.canBeCancelled) {
    res.status(400);
    throw new Error('Booking request cannot be cancelled');
  }
  
  // Update cancellation details
  bookingRequest.status = 'cancelled';
  bookingRequest.cancellation.cancelledBy = req.user.id;
  bookingRequest.cancellation.cancellationReason = reason;
  bookingRequest.cancellation.cancellationTime = new Date();
  bookingRequest.cancellation.refundAmount = refundAmount || 0;
  
  // Add to status history
  bookingRequest.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes: `Cancelled by ${req.user.role}`
  });
  
  await bookingRequest.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Booking request cancelled successfully',
    data: { bookingRequest }
  });
});

// @desc    Get booking request statistics
// @route   GET /api/vehicle-bookings/requests/stats
// @access  Private
const getBookingStats = asyncHandler(async (req, res) => {
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
    { customer: req.user.id };
  
  const query = { ...baseQuery, ...dateFilter };
  
  const stats = await VehicleBookingRequest.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalPrice' },
        averagePrice: { $avg: '$pricing.totalPrice' },
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
      totalRequests: stats[0]?.totalRequests || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      averagePrice: stats[0]?.averagePrice || 0,
      statusCounts
    }
  });
});

module.exports = {
  createBookingRequest,
  getOwnerBookingRequests,
  getCustomerBookingRequests,
  getBookingRequest,
  updateBookingStatus,
  customerResponse,
  addMessage,
  cancelBookingRequest,
  getBookingStats
};
