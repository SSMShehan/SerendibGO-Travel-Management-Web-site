// Staff Dashboard Routes
const express = require('express');
const router = express.Router();
const { 
  getDashboardOverview, 
  getStaffPerformance, 
  getPlatformStatistics 
} = require('../../controllers/staff/dashboardController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Dashboard routes
router.get('/overview', getDashboardOverview);
router.get('/performance', getStaffPerformance);
router.get('/statistics', getPlatformStatistics);

module.exports = router;


