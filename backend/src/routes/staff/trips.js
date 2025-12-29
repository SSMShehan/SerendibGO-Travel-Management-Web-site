// Staff Trip Management Routes
const express = require('express');
const router = express.Router();
const { 
  getTrips,
  getTripStatistics,
  createTrip,
  updateTrip,
  deleteTrip,
  bulkTripAction
} = require('../../controllers/staff/tripController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Trip routes
router.get('/', getTrips);
router.get('/statistics', getTripStatistics);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/bulk-action', bulkTripAction);

module.exports = router;
