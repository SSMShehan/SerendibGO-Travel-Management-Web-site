// Staff Custom Trip Management Routes
const express = require('express');
const router = express.Router();
const { 
  getCustomTrips,
  getCustomTripStatistics,
  respondToCustomTrip,
  deleteCustomTrip,
  bulkCustomTripAction
} = require('../../controllers/staff/customTripController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Custom trip routes
router.get('/', getCustomTrips);
router.get('/statistics', getCustomTripStatistics);
router.post('/:id/respond', respondToCustomTrip);
router.delete('/:id', deleteCustomTrip);
router.post('/bulk-action', bulkCustomTripAction);

module.exports = router;
