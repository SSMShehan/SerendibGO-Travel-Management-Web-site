const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../../middleware/errorHandler');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomAvailability,
  getRoomAvailability,
  getRoomPricing,
  getRoomStats
} = require('../../controllers/hotels/roomController');

const router = express.Router();

// @desc    Get all rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
router.get('/:hotelId/rooms', asyncHandler(getRooms));

// @desc    Get single room by ID
// @route   GET /api/hotels/rooms/:id
// @access  Public
router.get('/rooms/:id', asyncHandler(getRoom));

// @desc    Get room availability for date range
// @route   GET /api/hotels/rooms/:id/availability
// @access  Public
// NOTE: This route is now handled by roomAvailabilityRoutes.js
// router.get('/rooms/:id/availability', asyncHandler(getRoomAvailability));

// @desc    Get room pricing for date range
// @route   GET /api/hotels/rooms/:id/pricing
// @access  Public
router.get('/rooms/:id/pricing', asyncHandler(getRoomPricing));

// @desc    Get room statistics
// @route   GET /api/hotels/rooms/:id/stats
// @access  Private (Hotel Owner/Admin)
router.get('/rooms/:id/stats', protect, asyncHandler(getRoomStats));

// @desc    Create new room
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Hotel Owner)
router.post('/:hotelId/rooms', [
  protect,
  authorize('hotel_owner'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Room name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Room name must be between 2 and 100 characters'),
  body('roomType')
    .notEmpty()
    .withMessage('Room type is required'),
  body('maxOccupancy.adults')
    .isInt({ min: 1, max: 10 })
    .withMessage('Adult occupancy must be between 1 and 10'),
  body('maxOccupancy.children')
    .optional()
    .isInt({ min: 0, max: 8 })
    .withMessage('Children occupancy must be between 0 and 8'),
  body('maxOccupancy.infants')
    .optional()
    .isInt({ min: 0, max: 4 })
    .withMessage('Infant occupancy must be between 0 and 4'),
  body('size')
    .optional()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Room size must be between 10 and 500 square meters'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('availability.totalRooms')
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  handleValidationErrors
], asyncHandler(createRoom));

// @desc    Update room
// @route   PUT /api/hotels/rooms/:id
// @access  Private (Hotel Owner)
router.put('/rooms/:id', [
  protect,
  authorize('hotel_owner'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Room name must be between 2 and 100 characters'),
  body('maxOccupancy.adults')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Adult occupancy must be between 1 and 10'),
  body('maxOccupancy.children')
    .optional()
    .isInt({ min: 0, max: 8 })
    .withMessage('Children occupancy must be between 0 and 8'),
  body('maxOccupancy.infants')
    .optional()
    .isInt({ min: 0, max: 4 })
    .withMessage('Infant occupancy must be between 0 and 4'),
  body('size')
    .optional()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Room size must be between 10 and 500 square meters'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  handleValidationErrors
], asyncHandler(updateRoom));

// @desc    Update room availability
// @route   PUT /api/hotels/rooms/:id/availability
// @access  Private (Hotel Owner)
// NOTE: This route is now handled by roomAvailabilityRoutes.js
// router.put('/rooms/:id/availability', [
//   protect,
//   authorize('hotel_owner'),
//   body('availableRooms')
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage('Available rooms must be a non-negative integer'),
//   body('blockedRooms')
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage('Blocked rooms must be a non-negative integer'),
//   body('maintenanceRooms')
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage('Maintenance rooms must be a non-negative integer'),
//   handleValidationErrors
// ], asyncHandler(updateRoomAvailability));

// @desc    Delete room
// @route   DELETE /api/hotels/rooms/:id
// @access  Private (Hotel Owner/Admin)
router.delete('/rooms/:id', protect, asyncHandler(deleteRoom));

module.exports = router;
