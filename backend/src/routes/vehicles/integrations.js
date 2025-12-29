const express = require('express');
const router = express.Router();
const {
  getVehicleIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  toggleIntegration,
  getIntegrationAnalytics,
  getAvailablePlatforms,
  syncAllIntegrations
} = require('../../controllers/vehicles/integrationController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Get all external booking integrations for a vehicle
// @route   GET /api/vehicles/:vehicleId/integrations
// @access  Private (Vehicle Owner)
router.get('/:vehicleId/integrations', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('platform').optional().isIn(['uber', 'lyft', 'grab', 'ola', 'bolt', 'custom', 'api']).withMessage('Invalid platform'),
  query('status').optional().isIn(['active', 'inactive', 'pending', 'error', 'suspended']).withMessage('Invalid status'),
  query('integrationType').optional().isIn(['api', 'webhook', 'manual', 'csv', 'xml']).withMessage('Invalid integration type'),
  handleValidationErrors
], getVehicleIntegrations);

// @desc    Create a new external booking integration
// @route   POST /api/vehicles/:vehicleId/integrations
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/integrations', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('platform').isIn(['uber', 'lyft', 'grab', 'ola', 'bolt', 'custom', 'api']).withMessage('Invalid platform'),
  body('platformName').trim().notEmpty().withMessage('Platform name is required'),
  body('integrationType').isIn(['api', 'webhook', 'manual', 'csv', 'xml']).withMessage('Invalid integration type'),
  body('credentials.apiKey').optional().isString().withMessage('API key must be a string'),
  body('credentials.apiSecret').optional().isString().withMessage('API secret must be a string'),
  body('credentials.accessToken').optional().isString().withMessage('Access token must be a string'),
  body('credentials.refreshToken').optional().isString().withMessage('Refresh token must be a string'),
  body('credentials.webhookUrl').optional().isURL().withMessage('Webhook URL must be a valid URL'),
  body('credentials.endpoint').optional().isURL().withMessage('Endpoint must be a valid URL'),
  body('settings.autoAccept').optional().isBoolean().withMessage('Auto accept must be a boolean'),
  body('settings.autoReject').optional().isBoolean().withMessage('Auto reject must be a boolean'),
  body('settings.minAdvanceBooking').optional().isInt({ min: 0 }).withMessage('Minimum advance booking must be a non-negative integer'),
  body('settings.maxAdvanceBooking').optional().isInt({ min: 0 }).withMessage('Maximum advance booking must be a non-negative integer'),
  body('settings.workingHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('settings.workingHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
  body('settings.workingDays').optional().isArray().withMessage('Working days must be an array'),
  body('settings.workingDays.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day'),
  body('settings.pricingRules.usePlatformPricing').optional().isBoolean().withMessage('Use platform pricing must be a boolean'),
  body('settings.pricingRules.markupPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Markup percentage must be between 0 and 100'),
  body('settings.pricingRules.markupAmount').optional().isFloat({ min: 0 }).withMessage('Markup amount must be a positive number'),
  body('settings.pricingRules.currency').optional().isIn(['USD', 'LKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('settings.syncSettings.syncFrequency').optional().isIn(['realtime', '5min', '15min', '30min', '1hour', 'manual']).withMessage('Invalid sync frequency'),
  body('settings.syncSettings.syncBookings').optional().isBoolean().withMessage('Sync bookings must be a boolean'),
  body('settings.syncSettings.syncAvailability').optional().isBoolean().withMessage('Sync availability must be a boolean'),
  body('settings.syncSettings.syncPricing').optional().isBoolean().withMessage('Sync pricing must be a boolean'),
  body('settings.syncSettings.syncStatus').optional().isBoolean().withMessage('Sync status must be a boolean'),
  handleValidationErrors
], createIntegration);

// @desc    Update an external booking integration
// @route   PUT /api/vehicles/:vehicleId/integrations/:integrationId
// @access  Private (Vehicle Owner)
router.put('/:vehicleId/integrations/:integrationId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  body('platform').optional().isIn(['uber', 'lyft', 'grab', 'ola', 'bolt', 'custom', 'api']).withMessage('Invalid platform'),
  body('platformName').optional().trim().notEmpty().withMessage('Platform name cannot be empty'),
  body('integrationType').optional().isIn(['api', 'webhook', 'manual', 'csv', 'xml']).withMessage('Invalid integration type'),
  body('credentials.apiKey').optional().isString().withMessage('API key must be a string'),
  body('credentials.apiSecret').optional().isString().withMessage('API secret must be a string'),
  body('credentials.accessToken').optional().isString().withMessage('Access token must be a string'),
  body('credentials.refreshToken').optional().isString().withMessage('Refresh token must be a string'),
  body('credentials.webhookUrl').optional().isURL().withMessage('Webhook URL must be a valid URL'),
  body('credentials.endpoint').optional().isURL().withMessage('Endpoint must be a valid URL'),
  body('settings.autoAccept').optional().isBoolean().withMessage('Auto accept must be a boolean'),
  body('settings.autoReject').optional().isBoolean().withMessage('Auto reject must be a boolean'),
  body('settings.minAdvanceBooking').optional().isInt({ min: 0 }).withMessage('Minimum advance booking must be a non-negative integer'),
  body('settings.maxAdvanceBooking').optional().isInt({ min: 0 }).withMessage('Maximum advance booking must be a non-negative integer'),
  body('settings.workingHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('settings.workingHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
  body('settings.workingDays').optional().isArray().withMessage('Working days must be an array'),
  body('settings.workingDays.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day'),
  body('settings.pricingRules.usePlatformPricing').optional().isBoolean().withMessage('Use platform pricing must be a boolean'),
  body('settings.pricingRules.markupPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Markup percentage must be between 0 and 100'),
  body('settings.pricingRules.markupAmount').optional().isFloat({ min: 0 }).withMessage('Markup amount must be a positive number'),
  body('settings.pricingRules.currency').optional().isIn(['USD', 'LKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('settings.syncSettings.syncFrequency').optional().isIn(['realtime', '5min', '15min', '30min', '1hour', 'manual']).withMessage('Invalid sync frequency'),
  body('settings.syncSettings.syncBookings').optional().isBoolean().withMessage('Sync bookings must be a boolean'),
  body('settings.syncSettings.syncAvailability').optional().isBoolean().withMessage('Sync availability must be a boolean'),
  body('settings.syncSettings.syncPricing').optional().isBoolean().withMessage('Sync pricing must be a boolean'),
  body('settings.syncSettings.syncStatus').optional().isBoolean().withMessage('Sync status must be a boolean'),
  handleValidationErrors
], updateIntegration);

// @desc    Delete an external booking integration
// @route   DELETE /api/vehicles/:vehicleId/integrations/:integrationId
// @access  Private (Vehicle Owner)
router.delete('/:vehicleId/integrations/:integrationId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  handleValidationErrors
], deleteIntegration);

// @desc    Test integration connection
// @route   POST /api/vehicles/:vehicleId/integrations/:integrationId/test
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/integrations/:integrationId/test', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  handleValidationErrors
], testIntegration);

// @desc    Sync integration
// @route   POST /api/vehicles/:vehicleId/integrations/:integrationId/sync
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/integrations/:integrationId/sync', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  handleValidationErrors
], syncIntegration);

// @desc    Toggle integration status
// @route   PATCH /api/vehicles/:vehicleId/integrations/:integrationId/toggle
// @access  Private (Vehicle Owner)
router.patch('/:vehicleId/integrations/:integrationId/toggle', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  handleValidationErrors
], toggleIntegration);

// @desc    Get integration analytics
// @route   GET /api/vehicles/:vehicleId/integrations/:integrationId/analytics
// @access  Private (Vehicle Owner)
router.get('/:vehicleId/integrations/:integrationId/analytics', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  param('integrationId').isMongoId().withMessage('Invalid integration ID'),
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getIntegrationAnalytics);

// @desc    Get available platforms
// @route   GET /api/vehicles/integrations/platforms
// @access  Public
router.get('/integrations/platforms', getAvailablePlatforms);

// @desc    Bulk sync all integrations
// @route   POST /api/vehicles/:vehicleId/integrations/sync-all
// @access  Private (Vehicle Owner)
router.post('/:vehicleId/integrations/sync-all', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  handleValidationErrors
], syncAllIntegrations);

module.exports = router;
