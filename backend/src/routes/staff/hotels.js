// Staff Hotel Management Routes
const express = require('express');
const router = express.Router();
const { 
  getHotels,
  getHotelStatistics,
  createHotel,
  updateHotel,
  deleteHotel,
  bulkHotelAction
} = require('../../controllers/staff/hotelController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Hotel routes
router.get('/', getHotels);
router.get('/statistics', getHotelStatistics);
router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);
router.post('/bulk-action', bulkHotelAction);

module.exports = router;
