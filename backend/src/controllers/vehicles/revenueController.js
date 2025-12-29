const asyncHandler = require('express-async-handler');
const Revenue = require('../../models/vehicles/Revenue');
const Trip = require('../../models/vehicles/Trip');
const VehicleBookingRequest = require('../../models/vehicles/VehicleBookingRequest');
const MaintenanceRecord = require('../../models/vehicles/MaintenanceRecord');
const User = require('../../models/User');

// @desc    Calculate revenue for a specific period
// @route   POST /api/revenue/calculate
// @access  Private
const calculateRevenue = asyncHandler(async (req, res) => {
  const { vehicleOwnerId, year, month } = req.body;
  
  // Verify user exists and has permission
  const vehicleOwner = await User.findById(vehicleOwnerId);
  if (!vehicleOwner) {
    res.status(404);
    throw new Error('Vehicle owner not found');
  }
  
  if (vehicleOwnerId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to calculate revenue for this user');
  }
  
  // Check if revenue already exists for this period
  const existingRevenue = await Revenue.getRevenueForPeriod(vehicleOwnerId, year, month);
  if (existingRevenue) {
    res.status(400);
    throw new Error('Revenue already calculated for this period');
  }
  
  // Calculate quarter
  const quarter = Math.floor((month - 1) / 3) + 1;
  
  // Get trips for the period
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const trips = await Trip.find({
    vehicleOwner: vehicleOwnerId,
    status: 'completed',
    actualEndTime: { $gte: startDate, $lte: endDate }
  }).populate('vehicle', 'name');
  
  // Get maintenance records for the period
  const maintenanceRecords = await MaintenanceRecord.find({
    vehicleOwner: vehicleOwnerId,
    status: 'completed',
    actualEndDate: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate revenue breakdown
  let grossRevenue = 0;
  let platformCommission = 0;
  let driverPayments = 0;
  let maintenanceCosts = 0;
  let totalBookings = trips.length;
  let completedBookings = 0;
  let cancelledBookings = 0;
  let totalBookingValue = 0;
  let customerSatisfaction = 0;
  let satisfactionCount = 0;
  
  trips.forEach(trip => {
    grossRevenue += trip.pricing.totalPrice;
    totalBookingValue += trip.pricing.totalPrice;
    
    if (trip.status === 'completed') {
      completedBookings++;
      // Calculate platform commission (assuming 10%)
      platformCommission += trip.pricing.totalPrice * 0.1;
      
      // Calculate driver payments (assuming 20%)
      driverPayments += trip.pricing.totalPrice * 0.2;
      
      // Add customer satisfaction if available
      if (trip.experience?.rating) {
        customerSatisfaction += trip.experience.rating;
        satisfactionCount++;
      }
    } else if (trip.status === 'cancelled') {
      cancelledBookings++;
    }
  });
  
  // Calculate maintenance costs
  maintenanceRecords.forEach(record => {
    maintenanceCosts += record.costs.totalCost;
  });
  
  // Calculate averages
  const averageBookingValue = totalBookings > 0 ? totalBookingValue / totalBookings : 0;
  const averageSatisfaction = satisfactionCount > 0 ? customerSatisfaction / satisfactionCount : 0;
  
  // Calculate net revenue
  const netRevenue = grossRevenue - platformCommission - driverPayments - maintenanceCosts;
  
  // Create revenue record
  const revenue = await Revenue.create({
    vehicleOwner: vehicleOwnerId,
    period: { year, month, quarter },
    revenue: {
      grossRevenue,
      netRevenue,
      platformCommission,
      driverPayments,
      maintenanceCosts,
      insuranceCosts: 0, // Would need to be calculated separately
      fuelCosts: 0, // Would need to be calculated separately
      otherExpenses: 0
    },
    metrics: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      averageBookingValue,
      utilizationRate: 0, // Would need to be calculated based on availability
      customerSatisfaction: averageSatisfaction,
      repeatCustomers: 0 // Would need to be calculated separately
    },
    payout: {
      totalEarnings: netRevenue,
      pendingAmount: netRevenue
    },
    status: 'draft',
    metadata: {
      source: 'system',
      lastCalculated: new Date()
    }
  });
  
  // Add initial status to history
  revenue.statusHistory.push({
    status: 'draft',
    timestamp: new Date(),
    updatedBy: req.user.id,
    notes: 'Revenue calculated automatically'
  });
  
  await revenue.save();
  
  res.status(201).json({
    status: 'success',
    message: 'Revenue calculated successfully',
    data: { revenue }
  });
});

// @desc    Get revenue records for a user
// @route   GET /api/revenue
// @access  Private
const getUserRevenue = asyncHandler(async (req, res) => {
  const { year, month, status, page = 1, limit = 10 } = req.query;
  
  const query = {};
  
  if (req.user.role === 'vehicle_owner') {
    query.vehicleOwner = req.user.id;
  } else if (req.user.role === 'admin') {
    // Admin can see all revenue records
  } else {
    res.status(403);
    throw new Error('Not authorized to view revenue records');
  }
  
  if (year) query['period.year'] = parseInt(year);
  if (month) query['period.month'] = parseInt(month);
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const revenueRecords = await Revenue.find(query)
    .populate('vehicleOwner', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ 'period.year': -1, 'period.month': -1 });
  
  const total = await Revenue.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: { 
      revenueRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get a specific revenue record
// @route   GET /api/revenue/:revenueId
// @access  Private
const getRevenueRecord = asyncHandler(async (req, res) => {
  const { revenueId } = req.params;
  
  const revenue = await Revenue.findById(revenueId)
    .populate('vehicleOwner', 'name email')
    .populate('statusHistory.updatedBy', 'name email');
  
  if (!revenue) {
    res.status(404);
    throw new Error('Revenue record not found');
  }
  
  // Check authorization
  if (revenue.vehicleOwner._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this revenue record');
  }
  
  res.status(200).json({
    status: 'success',
    data: { revenue }
  });
});

// @desc    Update revenue record status
// @route   PATCH /api/revenue/:revenueId/status
// @access  Private
const updateRevenueStatus = asyncHandler(async (req, res) => {
  const { revenueId } = req.params;
  const { status, reason, notes } = req.body;
  
  const revenue = await Revenue.findById(revenueId);
  if (!revenue) {
    res.status(404);
    throw new Error('Revenue record not found');
  }
  
  // Check authorization
  if (revenue.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this revenue record');
  }
  
  // Validate status transition
  const validTransitions = {
    draft: ['review', 'disputed'],
    review: ['approved', 'disputed'],
    approved: ['paid', 'disputed'],
    paid: [],
    disputed: ['review', 'approved']
  };
  
  if (!validTransitions[revenue.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition from ${revenue.status} to ${status}`);
  }
  
  // Update status
  const oldStatus = revenue.status;
  revenue.status = status;
  
  // Update payout status if approved
  if (status === 'approved') {
    revenue.payout.payoutStatus = 'pending';
  }
  
  // Add to status history
  revenue.statusHistory.push({
    status,
    timestamp: new Date(),
    reason,
    updatedBy: req.user.id,
    notes
  });
  
  await revenue.save();
  
  res.status(200).json({
    status: 'success',
    message: `Revenue status updated to ${status}`,
    data: { revenue }
  });
});

// @desc    Process payout
// @route   POST /api/revenue/:revenueId/payout
// @access  Private (Admin)
const processPayout = asyncHandler(async (req, res) => {
  const { revenueId } = req.params;
  const { payoutMethod, bankDetails, notes } = req.body;
  
  const revenue = await Revenue.findById(revenueId);
  if (!revenue) {
    res.status(404);
    throw new Error('Revenue record not found');
  }
  
  // Check authorization
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to process payouts');
  }
  
  // Check if revenue is approved
  if (revenue.status !== 'approved') {
    res.status(400);
    throw new Error('Revenue must be approved before payout');
  }
  
  // Update payout information
  revenue.payout.payoutMethod = payoutMethod;
  revenue.payout.bankDetails = bankDetails;
  revenue.payout.payoutStatus = 'processing';
  revenue.payout.payoutDate = new Date();
  
  // Add transaction record
  const transactionId = Revenue.generateTransactionId();
  revenue.transactions.push({
    transactionId,
    type: 'payout',
    amount: revenue.payout.pendingAmount,
    currency: revenue.revenue.currency || 'USD',
    description: `Payout for ${revenue.period.year}-${revenue.period.month}`,
    status: 'processing',
    paymentMethod: payoutMethod,
    processedAt: new Date(),
    notes
  });
  
  // Update status
  revenue.status = 'paid';
  revenue.payout.paidAmount = revenue.payout.pendingAmount;
  revenue.payout.pendingAmount = 0;
  
  // Add to status history
  revenue.statusHistory.push({
    status: 'paid',
    timestamp: new Date(),
    reason: 'Payout processed',
    updatedBy: req.user.id,
    notes: `Payout processed via ${payoutMethod}`
  });
  
  await revenue.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Payout processed successfully',
    data: { revenue }
  });
});

// @desc    Get revenue statistics
// @route   GET /api/revenue/stats
// @access  Private
const getRevenueStats = asyncHandler(async (req, res) => {
  const { period = 'year' } = req.query;
  
  let vehicleOwnerId = null;
  if (req.user.role === 'vehicle_owner') {
    vehicleOwnerId = req.user.id;
  } else if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view revenue statistics');
  }
  
  const stats = await Revenue.getRevenueStats(vehicleOwnerId, period);
  
  res.status(200).json({
    status: 'success',
    data: {
      period,
      ...stats
    }
  });
});

// @desc    Add revenue transaction
// @route   POST /api/revenue/:revenueId/transactions
// @access  Private
const addRevenueTransaction = asyncHandler(async (req, res) => {
  const { revenueId } = req.params;
  const transactionData = req.body;
  
  const revenue = await Revenue.findById(revenueId);
  if (!revenue) {
    res.status(404);
    throw new Error('Revenue record not found');
  }
  
  // Check authorization
  if (revenue.vehicleOwner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add transactions to this revenue record');
  }
  
  // Generate transaction ID
  const transactionId = Revenue.generateTransactionId();
  
  // Add transaction
  revenue.transactions.push({
    ...transactionData,
    transactionId
  });
  
  // Update revenue totals based on transaction type
  if (transactionData.type === 'booking') {
    revenue.revenue.grossRevenue += transactionData.amount;
    revenue.revenue.netRevenue += transactionData.amount;
  } else if (transactionData.type === 'commission') {
    revenue.revenue.platformCommission += transactionData.amount;
    revenue.revenue.netRevenue -= transactionData.amount;
  } else if (transactionData.type === 'refund') {
    revenue.revenue.grossRevenue -= transactionData.amount;
    revenue.revenue.netRevenue -= transactionData.amount;
  }
  
  await revenue.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Transaction added successfully',
    data: { revenue }
  });
});

module.exports = {
  calculateRevenue,
  getUserRevenue,
  getRevenueRecord,
  updateRevenueStatus,
  processPayout,
  getRevenueStats,
  addRevenueTransaction
};
