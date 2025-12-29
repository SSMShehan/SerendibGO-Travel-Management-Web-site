const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} = require('../../controllers/vehicles/vehicleBookingController');
const { protect, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Create new booking
// @route   POST /api/vehicle-bookings
// @access  Private
router.post('/', [
  protect,
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('tripDetails.pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('tripDetails.pickupLocation.city').notEmpty().withMessage('Pickup city is required'),
  body('tripDetails.pickupLocation.district').notEmpty().withMessage('Pickup district is required'),
  body('tripDetails.dropoffLocation.address').notEmpty().withMessage('Dropoff address is required'),
  body('tripDetails.dropoffLocation.city').notEmpty().withMessage('Dropoff city is required'),
  body('tripDetails.dropoffLocation.district').notEmpty().withMessage('Dropoff district is required'),
  body('tripDetails.startDate').isISO8601().withMessage('Valid start date is required'),
  body('tripDetails.endDate').isISO8601().withMessage('Valid end date is required'),
  body('tripDetails.startTime').notEmpty().withMessage('Start time is required'),
  body('tripDetails.endTime').notEmpty().withMessage('End time is required'),
  body('passengers.adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
  body('passengers.children').isInt({ min: 0 }).withMessage('Children count cannot be negative'),
  body('passengers.infants').isInt({ min: 0 }).withMessage('Infants count cannot be negative'),
  body('guestDetails.firstName').notEmpty().withMessage('First name is required'),
  body('guestDetails.lastName').notEmpty().withMessage('Last name is required'),
  body('guestDetails.email').isEmail().withMessage('Valid email is required'),
  body('guestDetails.phone').notEmpty().withMessage('Phone number is required'),
  handleValidationErrors
], createBooking);

// @desc    Get all bookings for a specific user
// @route   GET /api/vehicle-bookings/user
// @access  Private
router.get('/user', protect, getUserBookings);

// @desc    Get all bookings for vehicle owner/driver
// @route   GET /api/vehicle-bookings/my-bookings
// @access  Private (Vehicle Owner/Driver)
router.get('/my-bookings', [
  protect,
  authorize('vehicle_owner', 'driver')
], getMyBookings);

// @desc    Get single booking
// @route   GET /api/vehicle-bookings/:id
// @access  Private
router.get('/:id', protect, getBooking);

// @desc    Update booking status
// @route   PUT /api/vehicle-bookings/:id/status
// @access  Private
router.put('/:id/status', [
  protect,
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid status'),
  handleValidationErrors
], updateBookingStatus);

// @desc    Cancel booking
// @route   PUT /api/vehicle-bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', [
  protect,
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  handleValidationErrors
], cancelBooking);

// @desc    Get booking stats
// @route   GET /api/vehicle-bookings/stats
// @access  Private
router.get('/stats', protect, getBookingStats);

module.exports = router;
