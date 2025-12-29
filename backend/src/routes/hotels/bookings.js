const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../../middleware/errorHandler');
const {
  createBooking,
  getMyBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getHotelBookings,
  processCheckIn,
  processCheckOut,
  getBookingStats
} = require('../../controllers/hotels/bookingController');

const router = express.Router();

// @desc    Get all bookings for a user
// @route   GET /api/hotel-bookings
// @access  Private
router.get('/', protect, asyncHandler(getMyBookings));

// @desc    Get all bookings for a user (alternative route)
// @route   GET /api/hotel-bookings/user
// @access  Private
router.get('/user', protect, asyncHandler(getMyBookings));

// @desc    Get booking statistics
// @route   GET /api/hotel-bookings/stats
// @access  Private
router.get('/stats', protect, asyncHandler(getBookingStats));

// @desc    Get single booking by ID (must be after specific routes)
// @route   GET /api/hotel-bookings/:id
// @access  Private
router.get('/:id', protect, asyncHandler(getBooking));

// @desc    Get hotel bookings (for hotel owners)
// @route   GET /api/hotels/:hotelId/bookings
// @access  Private (Hotel Owner)
router.get('/hotels/:hotelId/bookings', protect, authorize('hotel_owner'), asyncHandler(getHotelBookings));

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', [
  protect,
  body('hotel')
    .isMongoId()
    .withMessage('Valid hotel ID is required'),
  body('room')
    .isMongoId()
    .withMessage('Valid room ID is required'),
  body('checkIn')
    .isISO8601()
    .withMessage('Valid check-in date is required')
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  body('checkOut')
    .isISO8601()
    .withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      const checkOutDate = new Date(value);
      const checkInDate = new Date(req.body.checkIn);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guestDetails.firstName')
    .trim()
    .notEmpty()
    .withMessage('Guest first name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('guestDetails.lastName')
    .trim()
    .notEmpty()
    .withMessage('Guest last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('guestDetails.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid guest email is required'),
  body('guestDetails.phone')
    .notEmpty()
    .withMessage('Guest phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('occupancy.adults')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of adults must be between 1 and 10'),
  body('occupancy.children')
    .optional()
    .isInt({ min: 0, max: 8 })
    .withMessage('Number of children must be between 0 and 8'),
  body('occupancy.infants')
    .optional()
    .isInt({ min: 0, max: 4 })
    .withMessage('Number of infants must be between 0 and 4'),
  handleValidationErrors
], asyncHandler(createBooking));

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', [
  protect,
  body('guestDetails.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('guestDetails.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('guestDetails.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid guest email is required'),
  body('guestDetails.phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
], asyncHandler(updateBooking));

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', [
  protect,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters'),
  handleValidationErrors
], asyncHandler(cancelBooking));

// @desc    Process check-in
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Hotel Owner)
router.put('/:id/checkin', [
  protect,
  authorize('hotel_owner'),
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  body('staffName')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required'),
  handleValidationErrors
], asyncHandler(processCheckIn));

// @desc    Process check-out
// @route   PUT /api/bookings/:id/checkout
// @access  Private (Hotel Owner)
router.put('/:id/checkout', [
  protect,
  authorize('hotel_owner'),
  body('staffName')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required'),
  handleValidationErrors
], asyncHandler(processCheckOut));

module.exports = router;
