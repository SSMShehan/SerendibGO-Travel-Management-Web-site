const express = require('express');
const {
  getRoomAvailability,
  getAvailabilityCalendar,
  updateRoomAvailability,
  bulkUpdateAvailability,
  addOfflineBooking,
  scheduleMaintenance,
  getAvailabilityConflicts
} = require('../../controllers/hotels/roomAvailabilityController');
const { protect, authorize } = require('../../middleware/auth');
const { handleValidationErrors } = require('../../middleware/errorHandler');
const { body, param, query } = require('express-validator');

const router = express.Router();

// @desc    Get room availability for date range
// @route   GET /api/rooms/:roomId/availability
// @access  Public
router.get('/room-availability/:roomId', getRoomAvailability);

// @desc    Get availability calendar for a room
// @route   GET /api/hotels/rooms/:roomId/availability/calendar
// @access  Private (Hotel Owner)
router.get('/rooms/:roomId/availability/calendar', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Invalid year'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid month')
], getAvailabilityCalendar);

// @desc    Update room availability for specific date
// @route   PUT /api/hotels/rooms/:roomId/availability/:date
// @access  Private (Hotel Owner)
router.put('/rooms/:roomId/availability/:date', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  param('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['available', 'booked', 'offline_booked', 'maintenance', 'blocked', 'out_of_order'])
    .withMessage('Invalid status'),
  body('availableRooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available rooms must be a non-negative integer'),
  body('totalRooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),
  body('pricing.currency')
    .optional()
    .isIn(['LKR', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  body('maintenance.reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Maintenance reason cannot exceed 200 characters'),
  body('maintenance.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Maintenance description cannot exceed 500 characters'),
  body('maintenance.priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('blocking.reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Blocking reason cannot exceed 200 characters'),
  body('blocking.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Blocking description cannot exceed 500 characters')
], updateRoomAvailability);

// @desc    Bulk update room availability
// @route   PUT /api/hotels/rooms/:roomId/availability/bulk
// @access  Private (Hotel Owner)
router.put('/rooms/:roomId/availability/bulk', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('updates.status')
    .optional()
    .isIn(['available', 'booked', 'offline_booked', 'maintenance', 'blocked', 'out_of_order'])
    .withMessage('Invalid status'),
  body('updates.availableRooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available rooms must be a non-negative integer'),
  body('updates.totalRooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1')
], bulkUpdateAvailability);

// @desc    Add offline booking
// @route   POST /api/hotels/rooms/:roomId/availability/offline-booking
// @access  Private (Hotel Owner)
router.post('/rooms/:roomId/availability/offline-booking', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('guestDetails.name')
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ max: 100 })
    .withMessage('Guest name cannot exceed 100 characters'),
  body('guestDetails.contact')
    .notEmpty()
    .withMessage('Guest contact is required')
    .isLength({ max: 100 })
    .withMessage('Guest contact cannot exceed 100 characters'),
  body('numberOfRooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of rooms must be at least 1'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], addOfflineBooking);

// @desc    Schedule maintenance
// @route   POST /api/hotels/rooms/:roomId/availability/maintenance
// @access  Private (Hotel Owner)
router.post('/rooms/:roomId/availability/maintenance', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('reason')
    .notEmpty()
    .withMessage('Maintenance reason is required')
    .isLength({ max: 200 })
    .withMessage('Maintenance reason cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Maintenance description cannot exceed 500 characters'),
  body('estimatedCompletion')
    .optional()
    .isISO8601()
    .withMessage('Invalid estimated completion date format'),
  body('assignedTo')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Assigned to cannot exceed 100 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], scheduleMaintenance);

// @desc    Get availability conflicts
// @route   GET /api/hotels/rooms/:roomId/availability/conflicts
// @access  Private (Hotel Owner)
router.get('/rooms/:roomId/availability/conflicts', [
  protect,
  authorize('hotel_owner', 'admin'),
  param('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
], getAvailabilityConflicts);

module.exports = router;
