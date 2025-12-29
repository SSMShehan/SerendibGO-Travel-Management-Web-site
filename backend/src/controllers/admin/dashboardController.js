const { asyncHandler } = require('../../middleware/errorHandler');
const User = require('../../models/User');
const Hotel = require('../../models/hotels/Hotel');
const HotelBooking = require('../../models/hotels/HotelBooking');

// @desc    Get recent users
// @route   GET /api/admin/users/recent
// @access  Private (Admin only)
const getRecentUsers = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.find()
      .select('firstName lastName email role isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users'
    });
  }
});

// @desc    Get unverified users
// @route   GET /api/admin/users/unverified
// @access  Private (Admin only)
const getUnverifiedUsers = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.find({ isVerified: false })
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching unverified users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unverified users'
    });
  }
});

// @desc    Get recent bookings
// @route   GET /api/admin/bookings/recent
// @access  Private (Admin only)
const getRecentBookings = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const bookings = await HotelBooking.find()
      .populate('hotel', 'name')
      .populate('user', 'firstName lastName email')
      .select('bookingNumber status totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent bookings'
    });
  }
});

// @desc    Get recent hotels
// @route   GET /api/admin/hotels/recent
// @access  Private (Admin only)
const getRecentHotels = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const hotels = await Hotel.find()
      .populate('owner', 'firstName lastName email')
      .select('name location status rating createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        hotels,
        count: hotels.length
      }
    });
  } catch (error) {
    console.error('Error fetching recent hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent hotels'
    });
  }
});

// @desc    Get pending hotels
// @route   GET /api/admin/hotels/pending
// @access  Private (Admin only)
const getPendingHotels = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const hotels = await Hotel.find({ status: 'pending' })
      .populate('owner', 'firstName lastName email profile')
      .select('name location description status createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        hotels,
        count: hotels.length
      }
    });
  } catch (error) {
    console.error('Error fetching pending hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending hotels'
    });
  }
});

module.exports = {
  getRecentUsers,
  getUnverifiedUsers,
  getRecentBookings,
  getRecentHotels,
  getPendingHotels
};
