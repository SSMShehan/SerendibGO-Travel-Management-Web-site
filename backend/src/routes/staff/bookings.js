// Staff Booking Management Routes
const express = require('express');
const router = express.Router();
const { 
  getAllBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  createManualBooking,
  getBookingStatistics,
  getBookingConflicts
} = require('../../controllers/staff/bookingController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Booking routes
router.get('/', getAllBookings);
router.get('/statistics', getBookingStatistics);
router.get('/conflicts', getBookingConflicts);
router.get('/:id', getBookingDetails);
router.post('/', createManualBooking);
router.put('/:id', updateBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
