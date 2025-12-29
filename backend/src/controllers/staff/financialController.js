// Staff Financial Management Controller
const { asyncHandler } = require('../../middleware/errorHandler');
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Tour = require('../../models/Tour');
const { staffAuth, requirePermission, logActivity } = require('../../middleware/staffAuth');

// @desc    Get financial overview
// @route   GET /api/staff/financial/overview
// @access  Private (Staff)
const getFinancialOverview = asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get financial statistics
    const stats = {
      // Revenue statistics
      totalRevenue: await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      recentRevenue: await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Commission statistics
      totalCommissions: await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      
      recentCommissions: await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      
      // Payment statistics
      totalPayments: await Booking.countDocuments({ 
        status: { $in: ['confirmed', 'completed'] },
        paymentStatus: 'paid'
      }),
      
      pendingPayments: await Booking.countDocuments({ 
        status: { $in: ['confirmed', 'completed'] },
        paymentStatus: 'pending'
      }),
      
      failedPayments: await Booking.countDocuments({ 
        paymentStatus: 'failed'
      }),
      
      // Refund statistics
      totalRefunds: await Booking.aggregate([
        { $match: { status: 'cancelled' } },
        { $group: { _id: null, total: { $sum: '$refundAmount' } } }
      ]),
      
      recentRefunds: await Booking.aggregate([
        { 
          $match: { 
            status: 'cancelled',
            cancelledAt: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$refundAmount' } } }
      ]),
      
      // Service provider earnings
      guideEarnings: await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: '$guide', total: { $sum: '$guideEarnings' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'guide' } },
        { $unwind: '$guide' },
        { $project: { 'guide.firstName': 1, 'guide.lastName': 1, total: 1 } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]),
      
      hotelEarnings: await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: '$hotel', total: { $sum: '$hotelEarnings' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'hotel' } },
        { $unwind: '$hotel' },
        { $project: { 'hotel.firstName': 1, 'hotel.lastName': 1, total: 1 } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ])
    };
    
    // Format the data
    stats.totalRevenue = stats.totalRevenue.length > 0 ? stats.totalRevenue[0].total : 0;
    stats.recentRevenue = stats.recentRevenue.length > 0 ? stats.recentRevenue[0].total : 0;
    stats.totalCommissions = stats.totalCommissions.length > 0 ? stats.totalCommissions[0].total : 0;
    stats.recentCommissions = stats.recentCommissions.length > 0 ? stats.recentCommissions[0].total : 0;
    stats.totalRefunds = stats.totalRefunds.length > 0 ? stats.totalRefunds[0].total : 0;
    stats.recentRefunds = stats.recentRefunds.length > 0 ? stats.recentRefunds[0].total : 0;
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get financial overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching financial overview'
    });
  }
});

// @desc    Get commission rates
// @route   GET /api/staff/financial/commission-rates
// @access  Private (Staff)
const getCommissionRates = asyncHandler(async (req, res) => {
  try {
    // Default commission rates (in production, these would come from a settings table)
    const commissionRates = {
      platform: {
        default: 0.15, // 15% platform commission
        minimum: 0.10,  // 10% minimum
        maximum: 0.25   // 25% maximum
      },
      guides: {
        default: 0.70,  // 70% to guides
        minimum: 0.60,  // 60% minimum
        maximum: 0.80   // 80% maximum
      },
      hotels: {
        default: 0.75,  // 75% to hotels
        minimum: 0.65,  // 65% minimum
        maximum: 0.85   // 85% maximum
      },
      vehicles: {
        default: 0.80,  // 80% to vehicle owners
        minimum: 0.70,  // 70% minimum
        maximum: 0.90   // 90% maximum
      }
    };
    
    res.status(200).json({
      success: true,
      data: commissionRates
    });
    
  } catch (error) {
    console.error('Get commission rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching commission rates'
    });
  }
});

// @desc    Update commission rates
// @route   PUT /api/staff/financial/commission-rates
// @access  Private (Staff - Admin only)
const updateCommissionRates = asyncHandler(async (req, res) => {
  try {
    const { platform, guides, hotels, vehicles } = req.body;
    const staffId = req.user._id;
    
    // Validate commission rates
    const validateRates = (rates) => {
      if (rates.default < rates.minimum || rates.default > rates.maximum) {
        throw new Error('Default rate must be between minimum and maximum');
      }
      if (rates.minimum < 0 || rates.maximum > 1) {
        throw new Error('Rates must be between 0 and 1');
      }
    };
    
    if (platform) validateRates(platform);
    if (guides) validateRates(guides);
    if (hotels) validateRates(hotels);
    if (vehicles) validateRates(vehicles);
    
    // In production, save to database
    // For now, just return success
    console.log(`Staff ${staffId} updated commission rates`);
    
    res.status(200).json({
      success: true,
      message: 'Commission rates updated successfully',
      data: { platform, guides, hotels, vehicles }
    });
    
  } catch (error) {
    console.error('Update commission rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating commission rates'
    });
  }
});

// @desc    Get service provider earnings
// @route   GET /api/staff/financial/earnings
// @access  Private (Staff)
const getServiceProviderEarnings = asyncHandler(async (req, res) => {
  try {
    const { type, period = '30d', page = 1, limit = 10 } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    let earnings = [];
    
    if (type === 'guides' || !type) {
      const guideEarnings = await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: '$guide', total: { $sum: '$guideEarnings' }, count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'guide' } },
        { $unwind: '$guide' },
        { $project: { 
          'guide.firstName': 1, 
          'guide.lastName': 1, 
          'guide.email': 1,
          'guide.phone': 1,
          total: 1,
          count: 1
        } },
        { $sort: { total: -1 } }
      ]);
      
      earnings = [...earnings, ...guideEarnings.map(item => ({ ...item, type: 'guide' }))];
    }
    
    if (type === 'hotels' || !type) {
      const hotelEarnings = await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: '$hotel', total: { $sum: '$hotelEarnings' }, count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'hotel' } },
        { $unwind: '$hotel' },
        { $project: { 
          'hotel.firstName': 1, 
          'hotel.lastName': 1, 
          'hotel.email': 1,
          'hotel.phone': 1,
          total: 1,
          count: 1
        } },
        { $sort: { total: -1 } }
      ]);
      
      earnings = [...earnings, ...hotelEarnings.map(item => ({ ...item, type: 'hotel' }))];
    }
    
    if (type === 'vehicles' || !type) {
      const vehicleEarnings = await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        { $group: { _id: '$vehicle', total: { $sum: '$vehicleEarnings' }, count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vehicle' } },
        { $unwind: '$vehicle' },
        { $project: { 
          'vehicle.firstName': 1, 
          'vehicle.lastName': 1, 
          'vehicle.email': 1,
          'vehicle.phone': 1,
          total: 1,
          count: 1
        } },
        { $sort: { total: -1 } }
      ]);
      
      earnings = [...earnings, ...vehicleEarnings.map(item => ({ ...item, type: 'vehicle' }))];
    }
    
    // Sort all earnings by total
    earnings.sort((a, b) => b.total - a.total);
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEarnings = earnings.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        earnings: paginatedEarnings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(earnings.length / parseInt(limit)),
          total: earnings.length
        }
      }
    });
    
  } catch (error) {
    console.error('Get service provider earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching service provider earnings'
    });
  }
});

// @desc    Process payout to service provider
// @route   POST /api/staff/financial/payouts
// @access  Private (Staff)
const processPayout = asyncHandler(async (req, res) => {
  try {
    const { providerId, amount, type, notes } = req.body;
    const staffId = req.user._id;
    
    // Validate input
    if (!providerId || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, amount, and type are required'
      });
    }
    
    // Check if provider exists
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }
    
    // Validate provider type
    const validTypes = ['guide', 'hotel_owner', 'driver'];
    if (!validTypes.includes(provider.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider type'
      });
    }
    
    // Create payout record (in production, save to database)
    const payout = {
      _id: new Date().getTime().toString(),
      providerId,
      providerName: `${provider.firstName} ${provider.lastName}`,
      providerEmail: provider.email,
      amount,
      type,
      status: 'pending',
      processedBy: staffId,
      processedAt: new Date(),
      notes
    };
    
    // Log activity
    console.log(`Staff ${staffId} processed payout ${amount} to ${provider.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Payout processed successfully',
      data: payout
    });
    
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payout'
    });
  }
});

// @desc    Get financial reports
// @route   GET /api/staff/financial/reports
// @access  Private (Staff)
const getFinancialReports = asyncHandler(async (req, res) => {
  try {
    const { type, period = '30d', format = 'json' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    let report = {};
    
    if (type === 'revenue' || !type) {
      // Revenue report
      report.revenue = await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            totalCommissions: { $sum: '$commissionAmount' },
            bookingCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    }
    
    if (type === 'commissions' || !type) {
      // Commission report
      report.commissions = await Booking.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalCommissions: { $sum: '$commissionAmount' },
            guideCommissions: { $sum: '$guideEarnings' },
            hotelCommissions: { $sum: '$hotelEarnings' },
            vehicleCommissions: { $sum: '$vehicleEarnings' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    }
    
    if (type === 'refunds' || !type) {
      // Refund report
      report.refunds = await Booking.aggregate([
        { 
          $match: { 
            status: 'cancelled',
            cancelledAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$cancelledAt' },
              month: { $month: '$cancelledAt' },
              day: { $dayOfMonth: '$cancelledAt' }
            },
            totalRefunds: { $sum: '$refundAmount' },
            refundCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching financial reports'
    });
  }
});

// @desc    Get payment status
// @route   GET /api/staff/financial/payments
// @access  Private (Staff)
const getPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { status, period = '30d', page = 1, limit = 10 } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Build filter
    let filter = { createdAt: { $gte: startDate } };
    if (status) {
      filter.paymentStatus = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get payments
    const payments = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('tour', 'title price')
      .select('totalAmount paymentStatus paymentMethod createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Booking.countDocuments(filter);
    
    // Get payment statistics
    const paymentStats = {
      total: await Booking.countDocuments({ createdAt: { $gte: startDate } }),
      paid: await Booking.countDocuments({ 
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      }),
      pending: await Booking.countDocuments({ 
        createdAt: { $gte: startDate },
        paymentStatus: 'pending'
      }),
      failed: await Booking.countDocuments({ 
        createdAt: { $gte: startDate },
        paymentStatus: 'failed'
      })
    };
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        stats: paymentStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment status'
    });
  }
});

module.exports = {
  getFinancialOverview,
  getCommissionRates,
  updateCommissionRates,
  getServiceProviderEarnings,
  processPayout,
  getFinancialReports,
  getPaymentStatus
};


