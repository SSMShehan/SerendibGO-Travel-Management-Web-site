const express = require('express');
const router = express.Router();
const {
  getVehicleAvailability,
  setVehicleAvailability,
  setRecurringAvailability,
  blockVehicle,
  getAvailabilityCalendar,
  checkAvailability,
  deleteAvailability
} = require('../../controllers/vehicles/availabilityController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Get vehicle availability for a date range
// @route   GET /api/vehicles/:vehicleId/availability
// @access  Private (Vehicle Owner)
router.get('/:vehicleId/availability', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  handleValidationErrors
], getVehicleAvailability);

// @desc    Set vehicle availability for a specific date
// @route   POST /api/vehicles/:vehicleId/availability
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/availability', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('date').isISO8601().withMessage('Invalid date'),
  body('timeSlots').optional().isArray().withMessage('Time slots must be an array'),
  body('timeSlots.*.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
  body('timeSlots.*.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  body('timeSlots.*.status').optional().isIn(['available', 'booked', 'maintenance', 'blocked']).withMessage('Invalid status'),
  body('timeSlots.*.price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('reason').optional().isIn(['available', 'maintenance', 'personal_use', 'holiday', 'other']).withMessage('Invalid reason'),
  body('customReason').optional().isLength({ max: 100 }).withMessage('Custom reason too long'),
  handleValidationErrors
], setVehicleAvailability);

// @desc    Set recurring availability
// @route   POST /api/vehicles/:vehicleId/availability/recurring
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/availability/recurring', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('pattern').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid pattern'),
  body('days').optional().isArray().withMessage('Days must be an array'),
  body('days.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day'),
  body('timeSlots').isArray().withMessage('Time slots must be an array'),
  body('timeSlots.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
  body('timeSlots.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  body('timeSlots.*.status').optional().isIn(['available', 'booked', 'maintenance', 'blocked']).withMessage('Invalid status'),
  body('timeSlots.*.price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('reason').optional().isIn(['available', 'maintenance', 'personal_use', 'holiday', 'other']).withMessage('Invalid reason'),
  handleValidationErrors
], setRecurringAvailability);

// @desc    Block vehicle for maintenance or personal use
// @route   POST /api/vehicles/:vehicleId/availability/block
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/availability/block', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').optional().isIn(['maintenance', 'personal_use', 'holiday', 'other']).withMessage('Invalid reason'),
  body('customReason').optional().isLength({ max: 100 }).withMessage('Custom reason too long'),
  body('timeSlots').optional().isArray().withMessage('Time slots must be an array'),
  handleValidationErrors
], blockVehicle);

// @desc    Get availability calendar for vehicle owner
// @route   GET /api/vehicles/availability/calendar
// @access  Private (Vehicle Owner)
router.get('/availability/calendar', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  query('vehicleId').optional().isMongoId().withMessage('Invalid vehicle ID'),
  handleValidationErrors
], getAvailabilityCalendar);

// @desc    Check vehicle availability for booking
// @route   GET /api/vehicles/:vehicleId/availability/check
// @access  Public
router.get('/:vehicleId/availability/check', [
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('date').isISO8601().withMessage('Invalid date'),
  query('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
  query('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  handleValidationErrors
], checkAvailability);

// @desc    Delete vehicle availability
// @route   DELETE /api/vehicles/:vehicleId/availability/:availabilityId
// @access  Private (Vehicle Owner)
router.delete('/:vehicleId/availability/:availabilityId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('availabilityId').isMongoId().withMessage('Invalid availability ID'),
  handleValidationErrors
], deleteAvailability);

module.exports = router;
