const express = require('express');
const router = express.Router();
const {
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
} = require('../../controllers/vehicles/tripController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Create a new trip from booking request
// @route   POST /api/trips
// @access  Private
router.post('/', [
  protect,
  body('bookingRequest').isMongoId().withMessage('Invalid booking request ID'),
  body('vehicle').isMongoId().withMessage('Invalid vehicle ID'),
  body('tripType').isIn(['one_way', 'round_trip', 'multi_city', 'city_tour', 'airport_transfer', 'custom']).withMessage('Invalid trip type'),
  body('tripCategory').isIn(['business', 'leisure', 'airport', 'city_tour', 'long_distance', 'event', 'wedding', 'other']).withMessage('Invalid trip category'),
  body('scheduledStartTime').isISO8601().withMessage('Invalid scheduled start time'),
  body('scheduledEndTime').isISO8601().withMessage('Invalid scheduled end time'),
  body('totalDistance').isFloat({ min: 0 }).withMessage('Total distance must be a positive number'),
  body('estimatedDuration').isInt({ min: 0 }).withMessage('Estimated duration must be a positive integer'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('pricing.totalPrice').isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  handleValidationErrors
], createTrip);

// @desc    Get trips for a user
// @route   GET /api/trips
// @access  Private
router.get('/', [
  protect,
  query('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'delayed', 'no_show']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date from'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date to'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getUserTrips);

// @desc    Get active trips
// @route   GET /api/trips/active
// @access  Private
router.get('/active', [
  protect,
  authorize('driver', 'vehicle_owner', 'admin')
], getActiveTrips);

// @desc    Get trip statistics
// @route   GET /api/trips/stats
// @access  Private
router.get('/stats', [
  protect,
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getTripStats);

// @desc    Get a specific trip
// @route   GET /api/trips/:tripId
// @access  Private
router.get('/:tripId', [
  protect,
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  handleValidationErrors
], getTrip);

// @desc    Update trip status
// @route   PATCH /api/trips/:tripId/status
// @access  Private
router.patch('/:tripId/status', [
  protect,
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'delayed', 'no_show']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('location.latitude').optional().isFloat().withMessage('Invalid latitude'),
  body('location.longitude').optional().isFloat().withMessage('Invalid longitude'),
  body('location.address').optional().isString().withMessage('Address must be a string'),
  handleValidationErrors
], updateTripStatus);

// @desc    Update trip tracking
// @route   PATCH /api/trips/:tripId/tracking
// @access  Private (Driver)
router.patch('/:tripId/tracking', [
  protect,
  authorize('driver', 'admin'),
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  body('latitude').isFloat().withMessage('Latitude must be a number'),
  body('longitude').isFloat().withMessage('Longitude must be a number'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('speed').optional().isFloat({ min: 0 }).withMessage('Speed must be a positive number'),
  body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360'),
  body('accuracy').optional().isFloat({ min: 0 }).withMessage('Accuracy must be a positive number'),
  handleValidationErrors
], updateTripTracking);

// @desc    Add communication message
// @route   POST /api/trips/:tripId/messages
// @access  Private
router.post('/:tripId/messages', [
  protect,
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['message', 'status_update', 'location_update', 'delay_notification', 'system']).withMessage('Invalid message type'),
  handleValidationErrors
], addMessage);

// @desc    Assign driver to trip
// @route   PATCH /api/trips/:tripId/assign-driver
// @access  Private (Vehicle Owner)
router.patch('/:tripId/assign-driver', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  body('driverId').isMongoId().withMessage('Invalid driver ID'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
], assignDriver);

// @desc    Cancel trip
// @route   PATCH /api/trips/:tripId/cancel
// @access  Private
router.patch('/:tripId/cancel', [
  protect,
  param('tripId').isMongoId().withMessage('Invalid trip ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be a positive number'),
  handleValidationErrors
], cancelTrip);

module.exports = router;
