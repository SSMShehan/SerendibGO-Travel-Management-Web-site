// Staff Analytics & Monitoring Routes
const express = require('express');
const router = express.Router();
const { 
  getAnalyticsOverview,
  getUserAnalytics,
  getBookingAnalytics,
  getPerformanceMetrics,
  getMonitoringData
} = require('../../controllers/staff/analyticsController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Analytics routes
router.get('/overview', getAnalyticsOverview);
router.get('/users', getUserAnalytics);
router.get('/bookings', getBookingAnalytics);
router.get('/performance', getPerformanceMetrics);
router.get('/monitoring', getMonitoringData);

module.exports = router;
