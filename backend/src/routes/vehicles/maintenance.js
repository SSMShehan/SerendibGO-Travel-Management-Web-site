const express = require('express');
const router = express.Router();
const {
  createMaintenanceRecord,
  getVehicleMaintenance,
  getUserMaintenance,
  getMaintenanceRecord,
  updateMaintenanceStatus,
  updateMaintenanceRecord,
  addMaintenanceItem,
  updateMaintenanceItem,
  getMaintenanceStats,
  deleteMaintenanceRecord
} = require('../../controllers/vehicles/maintenanceController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Create a new maintenance record
// @route   POST /api/maintenance
// @access  Private
router.post('/', [
  protect,
  authorize('vehicle_owner', 'admin'),
  body('vehicle').isMongoId().withMessage('Invalid vehicle ID'),
  body('maintenanceType').isIn(['routine', 'repair', 'inspection', 'emergency', 'recall', 'upgrade']).withMessage('Invalid maintenance type'),
  body('scheduledDate').isISO8601().withMessage('Invalid scheduled date'),
  body('odometerReading').isInt({ min: 0 }).withMessage('Odometer reading must be a positive integer'),
  body('serviceProvider.name').notEmpty().withMessage('Service provider name is required'),
  body('serviceProvider.type').isIn(['dealership', 'independent_garage', 'mobile_service', 'owner', 'other']).withMessage('Invalid service provider type'),
  body('costs.totalCost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
  handleValidationErrors
], createMaintenanceRecord);

// @desc    Get maintenance records for a vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId
// @access  Private
router.get('/vehicle/:vehicleId', [
  protect,
  param('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).withMessage('Invalid status'),
  query('maintenanceType').optional().isIn(['routine', 'repair', 'inspection', 'emergency', 'recall', 'upgrade']).withMessage('Invalid maintenance type'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date from'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date to'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getVehicleMaintenance);

// @desc    Get all maintenance records for a user
// @route   GET /api/maintenance
// @access  Private
router.get('/', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).withMessage('Invalid status'),
  query('maintenanceType').optional().isIn(['routine', 'repair', 'inspection', 'emergency', 'recall', 'upgrade']).withMessage('Invalid maintenance type'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date from'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date to'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getUserMaintenance);

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private
router.get('/stats', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('vehicleId').optional().isMongoId().withMessage('Invalid vehicle ID'),
  query('period').optional().isIn(['month', 'quarter', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getMaintenanceStats);

// @desc    Get a specific maintenance record
// @route   GET /api/maintenance/:maintenanceId
// @access  Private
router.get('/:maintenanceId', [
  protect,
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  handleValidationErrors
], getMaintenanceRecord);

// @desc    Update maintenance record status
// @route   PATCH /api/maintenance/:maintenanceId/status
// @access  Private
router.patch('/:maintenanceId/status', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  body('status').isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
], updateMaintenanceStatus);

// @desc    Update maintenance record
// @route   PATCH /api/maintenance/:maintenanceId
// @access  Private
router.patch('/:maintenanceId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  body('maintenanceType').optional().isIn(['routine', 'repair', 'inspection', 'emergency', 'recall', 'upgrade']).withMessage('Invalid maintenance type'),
  body('scheduledDate').optional().isISO8601().withMessage('Invalid scheduled date'),
  body('odometerReading').optional().isInt({ min: 0 }).withMessage('Odometer reading must be a positive integer'),
  body('costs.totalCost').optional().isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
  handleValidationErrors
], updateMaintenanceRecord);

// @desc    Add maintenance item
// @route   POST /api/maintenance/:maintenanceId/items
// @access  Private
router.post('/:maintenanceId/items', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  body('itemName').notEmpty().withMessage('Item name is required'),
  body('category').isIn(['engine', 'brakes', 'tires', 'electrical', 'body', 'interior', 'safety', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('estimatedCost').optional().isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
  handleValidationErrors
], addMaintenanceItem);

// @desc    Update maintenance item
// @route   PATCH /api/maintenance/:maintenanceId/items/:itemIndex
// @access  Private
router.patch('/:maintenanceId/items/:itemIndex', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  param('itemIndex').isInt({ min: 0 }).withMessage('Invalid item index'),
  body('itemName').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('category').optional().isIn(['engine', 'brakes', 'tires', 'electrical', 'body', 'interior', 'safety', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('actualCost').optional().isFloat({ min: 0 }).withMessage('Actual cost must be a positive number'),
  handleValidationErrors
], updateMaintenanceItem);

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:maintenanceId
// @access  Private
router.delete('/:maintenanceId', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('maintenanceId').isMongoId().withMessage('Invalid maintenance ID'),
  handleValidationErrors
], deleteMaintenanceRecord);

module.exports = router;
