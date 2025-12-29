const express = require('express');
const router = express.Router();
const {
  calculateRevenue,
  getUserRevenue,
  getRevenueRecord,
  updateRevenueStatus,
  processPayout,
  getRevenueStats,
  addRevenueTransaction
} = require('../../controllers/vehicles/revenueController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Calculate revenue for a specific period
// @route   POST /api/revenue/calculate
// @access  Private
router.post('/calculate', [
  protect,
  authorize('vehicle_owner', 'admin'),
  body('vehicleOwnerId').isMongoId().withMessage('Invalid vehicle owner ID'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  handleValidationErrors
], calculateRevenue);

// @desc    Get revenue records for a user
// @route   GET /api/revenue
// @access  Private
router.get('/', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('status').optional().isIn(['draft', 'review', 'approved', 'paid', 'disputed']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getUserRevenue);

// @desc    Get revenue statistics
// @route   GET /api/revenue/stats
// @access  Private
router.get('/stats', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('period').optional().isIn(['month', 'quarter', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getRevenueStats);

// @desc    Get a specific revenue record
// @route   GET /api/revenue/:revenueId
// @access  Private
router.get('/:revenueId', [
  protect,
  param('revenueId').isMongoId().withMessage('Invalid revenue ID'),
  handleValidationErrors
], getRevenueRecord);

// @desc    Update revenue record status
// @route   PATCH /api/revenue/:revenueId/status
// @access  Private
router.patch('/:revenueId/status', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('revenueId').isMongoId().withMessage('Invalid revenue ID'),
  body('status').isIn(['draft', 'review', 'approved', 'paid', 'disputed']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
], updateRevenueStatus);

// @desc    Process payout
// @route   POST /api/revenue/:revenueId/payout
// @access  Private (Admin)
router.post('/:revenueId/payout', [
  protect,
  authorize('admin'),
  param('revenueId').isMongoId().withMessage('Invalid revenue ID'),
  body('payoutMethod').isIn(['bank_transfer', 'check', 'cash', 'mobile_money']).withMessage('Invalid payout method'),
  body('bankDetails.accountNumber').optional().isString().withMessage('Account number must be a string'),
  body('bankDetails.bankName').optional().isString().withMessage('Bank name must be a string'),
  body('bankDetails.branchName').optional().isString().withMessage('Branch name must be a string'),
  body('bankDetails.accountHolderName').optional().isString().withMessage('Account holder name must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
], processPayout);

// @desc    Add revenue transaction
// @route   POST /api/revenue/:revenueId/transactions
// @access  Private
router.post('/:revenueId/transactions', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('revenueId').isMongoId().withMessage('Invalid revenue ID'),
  body('type').isIn(['booking', 'commission', 'refund', 'penalty', 'bonus', 'adjustment', 'payout']).withMessage('Invalid transaction type'),
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('currency').optional().isIn(['USD', 'LKR', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'mobile_money', 'check', 'other']).withMessage('Invalid payment method'),
  handleValidationErrors
], addRevenueTransaction);

module.exports = router;
