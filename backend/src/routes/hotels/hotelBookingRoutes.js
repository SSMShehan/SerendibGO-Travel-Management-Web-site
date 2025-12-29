const express = require('express');
const {
  createBooking,
  getHotelBookings,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  getBookingStats
} = require('../../controllers/hotels/hotelBookingController');
const { protect, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors, asyncHandler } = require('../../middleware/errorHandler');

const router = express.Router();

// Simple test route
router.post('/simple-test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Simple test route works',
    body: req.body
  });
});

// Test route without authentication for debugging
router.post('/test', [
  body('hotel')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .isMongoId()
    .withMessage('Invalid hotel ID'),
  body('room')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Invalid check-out date format'),
  body('numberOfRooms')
    .isInt({ min: 1 })
    .withMessage('Number of rooms must be at least 1'),
  body('guests.adults')
    .isInt({ min: 1 })
    .withMessage('At least one adult is required'),
  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Children count cannot be negative'),
  body('guests.infants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Infant count cannot be negative'),
  body('guestDetails.firstName')
    .notEmpty()
    .withMessage('Guest first name is required')
    .trim(),
  body('guestDetails.lastName')
    .notEmpty()
    .withMessage('Guest last name is required')
    .trim(),
  body('guestDetails.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('guestDetails.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    // Add a test user ID for testing
    req.user = { id: '68cd0fb9abd147fb9d3a8898' }; // john@example.com user ID
    console.log('Test booking request:', req.body);
    console.log('Test user:', req.user);
    await createBooking(req, res);
  } catch (error) {
    console.error('Test booking error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Test booking failed',
      error: error.message,
      stack: error.stack
    });
  }
}));

// @desc    Create new booking
// @route   POST /api/hotel-bookings
// @access  Private
router.post('/', [
  protect,
  body('hotel')
    .notEmpty()
    .withMessage('Hotel ID is required')
    .isMongoId()
    .withMessage('Invalid hotel ID'),
  body('room')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Invalid check-out date format'),
  body('numberOfRooms')
    .isInt({ min: 1 })
    .withMessage('Number of rooms must be at least 1'),
  body('guests.adults')
    .isInt({ min: 1 })
    .withMessage('At least one adult is required'),
  body('guests.children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Children count cannot be negative'),
  body('guests.infants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Infant count cannot be negative'),
  body('guestDetails.firstName')
    .notEmpty()
    .withMessage('Guest first name is required')
    .trim(),
  body('guestDetails.lastName')
    .notEmpty()
    .withMessage('Guest last name is required')
    .trim(),
  body('guestDetails.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('guestDetails.phone')
    .notEmpty()
    .withMessage('Guest phone number is required')
    .trim(),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
], asyncHandler(createBooking));

// @desc    Get all bookings for a specific hotel
// @route   GET /api/hotels/:hotelId/bookings
// @access  Private (Hotel Owner)
router.get('/:hotelId/bookings', [
  protect,
  authorize('hotel_owner', 'admin')
], getHotelBookings);

// @desc    Get booking statistics for hotel
// @route   GET /api/hotels/:hotelId/bookings/stats
// @access  Private (Hotel Owner)
router.get('/:hotelId/bookings/stats', [
  protect,
  authorize('hotel_owner', 'admin')
], getBookingStats);

// @desc    Get all bookings for current user
// @route   GET /api/hotel-bookings/user
// @access  Private
router.get('/user', protect, getUserBookings);

// @desc    Get all bookings for admin
// @route   GET /api/hotel-bookings/admin
// @access  Private (Admin)
router.get('/admin', [
  protect,
  authorize('admin')
], getAllBookings);

// @desc    Get single booking by ID
// @route   GET /api/hotel-bookings/:id
// @access  Private
router.get('/:id', protect, getBookingById);

// @desc    Update booking status
// @route   PUT /api/hotel-bookings/:id/status
// @access  Private (Hotel Owner/Admin)
router.put('/:id/status', [
  protect,
  authorize('hotel_owner', 'admin'),
  body('bookingStatus')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid booking status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'partially_paid', 'refunded', 'failed'])
    .withMessage('Invalid payment status'),
  body('cancellationReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
], updateBookingStatus);

// @desc    Cancel booking
// @route   PUT /api/hotel-bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', [
  protect,
  body('cancellationReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
], cancelBooking);

// @desc    Delete booking
// @route   DELETE /api/hotel-bookings/:id
// @access  Private (Admin/Hotel Owner)
router.delete('/:id', [
  protect,
  authorize('hotel_owner', 'admin')
], deleteBooking);

module.exports = router;
