const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../../middleware/errorHandler');
const Hotel = require('../../models/hotels/Hotel');
const {
  getHotels,
  getHotel,
  getRoomFromHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getMyHotels,
  searchHotelsByLocation,
  getHotelStats,
  approveHotel,
  getPendingHotels
} = require('../../controllers/hotels/hotelController');

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/search/location', searchHotelsByLocation);
router.get('/:id', getHotel);
router.get('/:id/rooms/:roomId', getRoomFromHotel);
router.get('/:id/stats', protect, getHotelStats);

// Protected routes for hotel owners
router.post('/', protect, authorize('hotel_owner'), createHotel);
router.put('/:id', protect, authorize('hotel_owner'), updateHotel);
router.delete('/:id', protect, authorize('hotel_owner'), deleteHotel);
router.get('/owner/my-hotels', protect, authorize('hotel_owner'), getMyHotels);

// Admin routes
router.get('/admin/pending', protect, authorize('admin'), getPendingHotels);
router.put('/:id/approve', [
  protect,
  authorize('admin'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a hotel'),
  handleValidationErrors
], asyncHandler(approveHotel));

module.exports = router;