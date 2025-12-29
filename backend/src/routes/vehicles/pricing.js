const express = require('express');
const router = express.Router();
const {
  getVehiclePricing,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  calculatePrice,
  getPricingAnalytics,
  togglePricingRule,
  duplicatePricingRule
} = require('../../controllers/vehicles/pricingController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Get all pricing rules for a vehicle
// @route   GET /api/vehicles/:vehicleId/pricing
// @access  Private (Vehicle Owner)
router.get('/:vehicleId/pricing', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('pricingType').optional().isIn(['standard', 'dynamic', 'seasonal', 'event', 'custom']).withMessage('Invalid pricing type'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  handleValidationErrors
], getVehiclePricing);

// @desc    Create a new pricing rule
// @route   POST /api/vehicles/:vehicleId/pricing
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/pricing', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('pricingType').isIn(['standard', 'dynamic', 'seasonal', 'event', 'custom']).withMessage('Invalid pricing type'),
  body('name').trim().notEmpty().withMessage('Pricing rule name is required'),
  body('basePricing.hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('basePricing.dailyRate').optional().isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  body('basePricing.weeklyRate').optional().isFloat({ min: 0 }).withMessage('Weekly rate must be a positive number'),
  body('basePricing.monthlyRate').optional().isFloat({ min: 0 }).withMessage('Monthly rate must be a positive number'),
  body('basePricing.perKmRate').optional().isFloat({ min: 0 }).withMessage('Per-km rate must be a positive number'),
  body('basePricing.minimumCharge').optional().isFloat({ min: 0 }).withMessage('Minimum charge must be a positive number'),
  body('basePricing.currency').optional().isIn(['USD', 'LKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
  handleValidationErrors
], createPricingRule);

// @desc    Update a pricing rule
// @route   PUT /api/vehicles/:vehicleId/pricing/:pricingId
// @access  Private (Vehicle Owner)
router.put('/:vehicleId/pricing/:pricingId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('pricingId').isMongoId().withMessage('Invalid pricing ID'),
  body('pricingType').optional().isIn(['standard', 'dynamic', 'seasonal', 'event', 'custom']).withMessage('Invalid pricing type'),
  body('name').optional().trim().notEmpty().withMessage('Pricing rule name cannot be empty'),
  body('basePricing.hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('basePricing.dailyRate').optional().isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  body('basePricing.weeklyRate').optional().isFloat({ min: 0 }).withMessage('Weekly rate must be a positive number'),
  body('basePricing.monthlyRate').optional().isFloat({ min: 0 }).withMessage('Monthly rate must be a positive number'),
  body('basePricing.perKmRate').optional().isFloat({ min: 0 }).withMessage('Per-km rate must be a positive number'),
  body('basePricing.minimumCharge').optional().isFloat({ min: 0 }).withMessage('Minimum charge must be a positive number'),
  body('basePricing.currency').optional().isIn(['USD', 'LKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
  handleValidationErrors
], updatePricingRule);

// @desc    Delete a pricing rule
// @route   DELETE /api/vehicles/:vehicleId/pricing/:pricingId
// @access  Private (Vehicle Owner)
router.delete('/:vehicleId/pricing/:pricingId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('pricingId').isMongoId().withMessage('Invalid pricing ID'),
  handleValidationErrors
], deletePricingRule);

// @desc    Calculate price for a booking
// @route   POST /api/vehicles/:vehicleId/pricing/calculate
// @access  Public
router.post('/:vehicleId/pricing/calculate', [
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('distance').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  handleValidationErrors
], calculatePrice);

// @desc    Get pricing analytics for a vehicle
// @route   GET /api/vehicles/:vehicleId/pricing/analytics
// @access  Private (Vehicle Owner)
router.get('/:vehicleId/pricing/analytics', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getPricingAnalytics);

// @desc    Toggle pricing rule status
// @route   PATCH /api/vehicles/:vehicleId/pricing/:pricingId/toggle
// @access  Private (Vehicle Owner)
router.patch('/:vehicleId/pricing/:pricingId/toggle', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('pricingId').isMongoId().withMessage('Invalid pricing ID'),
  handleValidationErrors
], togglePricingRule);

// @desc    Duplicate a pricing rule
// @route   POST /api/vehicles/:vehicleId/pricing/:pricingId/duplicate
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/pricing/:pricingId/duplicate', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('pricingId').isMongoId().withMessage('Invalid pricing ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  handleValidationErrors
], duplicatePricingRule);

module.exports = router;
