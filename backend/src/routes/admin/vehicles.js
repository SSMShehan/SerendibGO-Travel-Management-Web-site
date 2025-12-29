const express = require('express');
const router = express.Router();
const {
  getAdminVehicles,
  getVehicleStats,
  getPendingVehicles,
  bulkUpdateVehicleStatus,
  getVehicleHistory,
  exportVehicles
} = require('../../controllers/admin/vehicleController');
const { protect, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Get all vehicles for admin
// @route   GET /api/admin/vehicles
// @access  Private (Admin)
router.get('/', [
  protect,
  authorize('admin')
], getAdminVehicles);

// @desc    Get vehicle statistics for admin
// @route   GET /api/admin/vehicles/stats
// @access  Private (Admin)
router.get('/stats', [
  protect,
  authorize('admin')
], getVehicleStats);

// @desc    Get pending vehicles for admin
// @route   GET /api/admin/vehicles/pending
// @access  Private (Admin)
router.get('/pending', [
  protect,
  authorize('admin')
], getPendingVehicles);

// @desc    Bulk update vehicle status
// @route   PUT /api/admin/vehicles/bulk-status
// @access  Private (Admin)
router.put('/bulk-status', [
  protect,
  authorize('admin'),
  body('vehicleIds').isArray().withMessage('Vehicle IDs must be an array'),
  body('status').isIn(['pending', 'approved', 'active', 'suspended', 'rejected', 'maintenance'])
    .withMessage('Invalid status'),
  handleValidationErrors
], bulkUpdateVehicleStatus);

// @desc    Get vehicle approval history
// @route   GET /api/admin/vehicles/:id/history
// @access  Private (Admin)
router.get('/:id/history', [
  protect,
  authorize('admin')
], getVehicleHistory);

// @desc    Export vehicles data
// @route   GET /api/admin/vehicles/export
// @access  Private (Admin)
router.get('/export', [
  protect,
  authorize('admin')
], exportVehicles);

module.exports = router;
