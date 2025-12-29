const VehicleBooking = require('../models/vehicles/VehicleBooking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get earnings overview
// @route   GET /api/earnings/overview
// @access  Private
const getEarningsOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'this_month' } = req.query;

  try {
    // Get user's vehicles (both owned and driven)
    const userVehicles = await Vehicle.find({ 
      $or: [
        { owner: userId },
        { driver: userId }
      ]
    }).select('_id');

    const vehicleIds = userVehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalEarnings: 0,
          netEarnings: 0,
          pendingEarnings: 0,
          availableForPayout: 0,
          totalTrips: 0,
          completedTrips: 0,
          averageEarningsPerTrip: 0,
          monthlyEarnings: 0,
          weeklyEarnings: 0,
          dailyEarnings: 0
        }
      });
    }

    // Calculate date ranges based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 7);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get bookings for the period
    const bookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: startDate, $lt: endDate }
    }).populate('vehicle', 'name make model vehicleType');

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    const completedBookings = bookings.filter(booking => booking.bookingStatus === 'completed');
    const completedEarnings = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    const pendingBookings = bookings.filter(booking => 
      ['pending', 'confirmed', 'in_progress'].includes(booking.bookingStatus)
    );
    const pendingEarnings = pendingBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Calculate commission (assuming 10% platform fee)
    const commission = completedEarnings * 0.1;
    const netEarnings = completedEarnings - commission;
    const availableForPayout = netEarnings;

    // Calculate additional metrics
    const totalTrips = bookings.length;
    const completedTrips = completedBookings.length;
    const averageEarningsPerTrip = completedTrips > 0 ? completedEarnings / completedTrips : 0;

    // Calculate monthly earnings (current month)
    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: monthlyStart, $lt: monthlyEnd },
      bookingStatus: 'completed'
    });
    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Calculate weekly earnings (current week)
    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay());
    weeklyStart.setHours(0, 0, 0, 0);
    const weeklyEnd = new Date(weeklyStart);
    weeklyEnd.setDate(weeklyStart.getDate() + 7);
    const weeklyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: weeklyStart, $lt: weeklyEnd },
      bookingStatus: 'completed'
    });
    const weeklyEarnings = weeklyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Calculate daily earnings (today)
    const dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dailyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: dailyStart, $lt: dailyEnd },
      bookingStatus: 'completed'
    });
    const dailyEarnings = dailyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalEarnings,
        netEarnings,
        pendingEarnings,
        availableForPayout,
        totalTrips,
        completedTrips,
        averageEarningsPerTrip,
        monthlyEarnings,
        weeklyEarnings,
        dailyEarnings,
        commission,
        period: {
          start: startDate,
          end: endDate,
          type: period
        }
      }
    });

  } catch (error) {
    console.error('Error fetching earnings overview:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earnings overview'
    });
  }
});

// @desc    Get earnings list
// @route   GET /api/earnings
// @access  Private
const getEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    page = 1, 
    limit = 10, 
    period = 'this_month',
    type = '',
    status = '',
    search = ''
  } = req.query;

  try {
    // Get user's vehicles
    const userVehicles = await Vehicle.find({ 
      $or: [
        { owner: userId },
        { driver: userId }
      ]
    }).select('_id');

    const vehicleIds = userVehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          earnings: [],
          pagination: {
            current: parseInt(page),
            pages: 0,
            total: 0,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 7);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Build query
    const query = {
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: startDate, $lt: endDate }
    };

    if (status) {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
        { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await VehicleBooking.countDocuments(query);

    // Get paginated results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await VehicleBooking.find(query)
      .populate('vehicle', 'name make model vehicleType')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform bookings to earnings format
    const earnings = bookings.map(booking => {
      const totalPrice = booking.pricing?.totalPrice || 0;
      const commission = totalPrice * 0.1; // 10% platform fee
      const netAmount = totalPrice - commission;

      return {
        _id: booking._id,
        type: 'vehicle_booking',
        amount: totalPrice,
        netAmount: netAmount,
        commission: commission,
        fees: 0,
        taxes: 0,
        status: booking.bookingStatus,
        description: `Vehicle booking - ${booking.vehicle?.name || 'Vehicle'}`,
        bookingReference: booking.bookingReference,
        vehicle: booking.vehicle,
        customer: {
          name: `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
          email: booking.guestDetails.email,
          phone: booking.guestDetails.phone
        },
        tripDetails: booking.tripDetails,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      };
    });

    const pages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        earnings,
        pagination: {
          current: parseInt(page),
          pages,
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earnings'
    });
  }
});

// @desc    Get single earning
// @route   GET /api/earnings/:id
// @access  Private
const getEarning = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const earningId = req.params.id;

  try {
    // Get user's vehicles
    const userVehicles = await Vehicle.find({ 
      $or: [
        { owner: userId },
        { driver: userId }
      ]
    }).select('_id');

    const vehicleIds = userVehicles.map(v => v._id);

    const booking = await VehicleBooking.findOne({
      _id: earningId,
      vehicle: { $in: vehicleIds }
    })
    .populate('vehicle', 'name make model vehicleType')
    .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Earning not found'
      });
    }

    const totalPrice = booking.pricing?.totalPrice || 0;
    const commission = totalPrice * 0.1;
    const netAmount = totalPrice - commission;

    const earning = {
      _id: booking._id,
      type: 'vehicle_booking',
      amount: totalPrice,
      netAmount: netAmount,
      commission: commission,
      fees: 0,
      taxes: 0,
      status: booking.bookingStatus,
      description: `Vehicle booking - ${booking.vehicle?.name || 'Vehicle'}`,
      bookingReference: booking.bookingReference,
      vehicle: booking.vehicle,
      customer: {
        name: `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
        email: booking.guestDetails.email,
        phone: booking.guestDetails.phone
      },
      tripDetails: booking.tripDetails,
      passengers: booking.passengers,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: earning
    });

  } catch (error) {
    console.error('Error fetching earning:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earning'
    });
  }
});

// @desc    Get earnings statistics
// @route   GET /api/earnings/stats
// @access  Private
const getEarningsStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'this_month' } = req.query;

  try {
    // Get user's vehicles
    const userVehicles = await Vehicle.find({ 
      $or: [
        { owner: userId },
        { driver: userId }
      ]
    }).select('_id');

    const vehicleIds = userVehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalEarnings: 0,
            netEarnings: 0,
            totalTrips: 0,
            completedTrips: 0,
            averageEarningsPerTrip: 0,
            monthlyEarnings: 0,
            weeklyEarnings: 0,
            dailyEarnings: 0,
            topVehicle: null,
            earningsByStatus: {},
            earningsByMonth: []
          }
        }
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 7);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get all bookings for the period
    const bookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: startDate, $lt: endDate }
    }).populate('vehicle', 'name make model vehicleType');

    // Calculate basic stats
    const totalEarnings = bookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    const completedBookings = bookings.filter(booking => booking.bookingStatus === 'completed');
    const completedEarnings = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    const commission = completedEarnings * 0.1;
    const netEarnings = completedEarnings - commission;

    const totalTrips = bookings.length;
    const completedTrips = completedBookings.length;
    const averageEarningsPerTrip = completedTrips > 0 ? completedEarnings / completedTrips : 0;

    // Calculate monthly earnings
    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: monthlyStart, $lt: monthlyEnd },
      bookingStatus: 'completed'
    });
    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Calculate weekly earnings
    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay());
    weeklyStart.setHours(0, 0, 0, 0);
    const weeklyEnd = new Date(weeklyStart);
    weeklyEnd.setDate(weeklyStart.getDate() + 7);
    const weeklyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: weeklyStart, $lt: weeklyEnd },
      bookingStatus: 'completed'
    });
    const weeklyEarnings = weeklyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Calculate daily earnings
    const dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dailyBookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: dailyStart, $lt: dailyEnd },
      bookingStatus: 'completed'
    });
    const dailyEarnings = dailyBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalPrice || 0);
    }, 0);

    // Find top earning vehicle
    const vehicleEarnings = {};
    bookings.forEach(booking => {
      const vehicleId = booking.vehicle._id.toString();
      if (!vehicleEarnings[vehicleId]) {
        vehicleEarnings[vehicleId] = {
          vehicle: booking.vehicle,
          earnings: 0,
          trips: 0
        };
      }
      vehicleEarnings[vehicleId].earnings += booking.pricing?.totalPrice || 0;
      vehicleEarnings[vehicleId].trips += 1;
    });

    const topVehicle = Object.values(vehicleEarnings).reduce((top, current) => {
      return current.earnings > top.earnings ? current : top;
    }, { earnings: 0, vehicle: null });

    // Calculate earnings by status
    const earningsByStatus = {};
    bookings.forEach(booking => {
      const status = booking.bookingStatus;
      if (!earningsByStatus[status]) {
        earningsByStatus[status] = {
          count: 0,
          earnings: 0
        };
      }
      earningsByStatus[status].count += 1;
      earningsByStatus[status].earnings += booking.pricing?.totalPrice || 0;
    });

    // Calculate earnings by month (last 12 months)
    const earningsByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthBookings = await VehicleBooking.find({
        vehicle: { $in: vehicleIds },
        createdAt: { $gte: monthStart, $lt: monthEnd },
        bookingStatus: 'completed'
      });
      
      const monthEarnings = monthBookings.reduce((sum, booking) => {
        return sum + (booking.pricing?.totalPrice || 0);
      }, 0);

      earningsByMonth.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        earnings: monthEarnings,
        trips: monthBookings.length
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalEarnings,
          netEarnings,
          totalTrips,
          completedTrips,
          averageEarningsPerTrip,
          monthlyEarnings,
          weeklyEarnings,
          dailyEarnings,
          topVehicle: topVehicle.vehicle,
          earningsByStatus,
          earningsByMonth
        }
      }
    });

  } catch (error) {
    console.error('Error fetching earnings stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earnings statistics'
    });
  }
});

// @desc    Get payouts
// @route   GET /api/earnings/payouts
// @access  Private
const getPayouts = asyncHandler(async (req, res) => {
  // For now, return empty payouts since we don't have a payout system yet
  res.status(200).json({
    status: 'success',
    data: {
      payouts: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
        limit: 10
      }
    }
  });
});

// @desc    Export earnings data
// @route   GET /api/earnings/export
// @access  Private
const exportEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = 'this_month' } = req.query;

  try {
    // Get user's vehicles
    const userVehicles = await Vehicle.find({ 
      $or: [
        { owner: userId },
        { driver: userId }
      ]
    }).select('_id');

    const vehicleIds = userVehicles.map(v => v._id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No earnings data to export'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 7);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get all bookings for the period
    const bookings = await VehicleBooking.find({
      vehicle: { $in: vehicleIds },
      createdAt: { $gte: startDate, $lt: endDate }
    })
    .populate('vehicle', 'name make model vehicleType licensePlate')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });

    // Transform to CSV format
    const csvData = bookings.map(booking => {
      const totalPrice = booking.pricing?.totalPrice || 0;
      const commission = totalPrice * 0.1;
      const netAmount = totalPrice - commission;

      return {
        'Booking Reference': booking.bookingReference,
        'Date': booking.createdAt.toISOString().split('T')[0],
        'Customer Name': `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
        'Customer Email': booking.guestDetails.email,
        'Customer Phone': booking.guestDetails.phone,
        'Vehicle': booking.vehicle?.name || `${booking.vehicle?.make} ${booking.vehicle?.model}`,
        'Vehicle Type': booking.vehicle?.vehicleType,
        'License Plate': booking.vehicle?.licensePlate,
        'Pickup Location': booking.tripDetails?.pickupLocation?.address,
        'Dropoff Location': booking.tripDetails?.dropoffLocation?.address,
        'Start Date': booking.tripDetails?.startDate,
        'End Date': booking.tripDetails?.endDate,
        'Total Amount': totalPrice,
        'Commission': commission,
        'Net Amount': netAmount,
        'Status': booking.bookingStatus,
        'Passengers': `${booking.passengers?.adults || 0} adults, ${booking.passengers?.children || 0} children, ${booking.passengers?.infants || 0} infants`
      };
    });

    // Convert to CSV string
    if (csvData.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No data to export'
      });
    }

    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="earnings-${period}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvString);

  } catch (error) {
    console.error('Error exporting earnings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export earnings data'
    });
  }
});

module.exports = {
  getEarningsOverview,
  getEarnings,
  getEarning,
  getEarningsStats,
  getPayouts,
  exportEarnings
};
