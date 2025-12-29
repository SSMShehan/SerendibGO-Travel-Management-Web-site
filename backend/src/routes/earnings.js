const express = require('express');
const router = express.Router();
const {
  getEarningsOverview,
  getEarnings,
  getEarning,
  getEarningsStats,
  getPayouts,
  exportEarnings
} = require('../controllers/earningsController');
const { protect } = require('../middleware/auth');

// @desc    Get earnings overview
// @route   GET /api/earnings/overview
// @access  Private
router.get('/overview', protect, getEarningsOverview);

// @desc    Get earnings list
// @route   GET /api/earnings
// @access  Private
router.get('/', protect, getEarnings);

// @desc    Get single earning
// @route   GET /api/earnings/:id
// @access  Private
router.get('/:id', protect, getEarning);

// @desc    Get earnings statistics
// @route   GET /api/earnings/stats
// @access  Private
router.get('/stats', protect, getEarningsStats);

// @desc    Get payouts
// @route   GET /api/earnings/payouts
// @access  Private
router.get('/payouts', protect, getPayouts);

// @desc    Export earnings data
// @route   GET /api/earnings/export
// @access  Private
router.get('/export', protect, exportEarnings);

module.exports = router;
