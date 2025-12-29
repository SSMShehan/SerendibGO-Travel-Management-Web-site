const express = require('express');
const router = express.Router();
const {
  createBookingRequest,
  getOwnerBookingRequests,
  getCustomerBookingRequests,
  getBookingRequest,
  updateBookingStatus,
  customerResponse,
  addMessage,
  cancelBookingRequest,
  getBookingStats
} = require('../../controllers/vehicles/bookingRequestController');
const { protect, authorize } = require('../../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/errorHandler');

// @desc    Create a new booking request
// @route   POST /api/vehicle-bookings/requests
// @access  Private
router.post('/requests', [
  protect,
  body('vehicle').isMongoId().withMessage('Invalid vehicle ID'),
  body('tripDetails.pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('tripDetails.pickupLocation.city').notEmpty().withMessage('Pickup city is required'),
  body('tripDetails.pickupLocation.district').notEmpty().withMessage('Pickup district is required'),
  body('tripDetails.pickupLocation.coordinates.latitude').isFloat().withMessage('Invalid pickup latitude'),
  body('tripDetails.pickupLocation.coordinates.longitude').isFloat().withMessage('Invalid pickup longitude'),
  body('tripDetails.dropoffLocation.address').notEmpty().withMessage('Dropoff address is required'),
  body('tripDetails.dropoffLocation.city').notEmpty().withMessage('Dropoff city is required'),
  body('tripDetails.dropoffLocation.district').notEmpty().withMessage('Dropoff district is required'),
  body('tripDetails.dropoffLocation.coordinates.latitude').isFloat().withMessage('Invalid dropoff latitude'),
  body('tripDetails.dropoffLocation.coordinates.longitude').isFloat().withMessage('Invalid dropoff longitude'),
  body('tripDetails.estimatedDistance').isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('tripDetails.estimatedDuration').isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
  body('timing.pickupDateTime').isISO8601().withMessage('Invalid pickup date and time'),
  body('timing.dropoffDateTime').isISO8601().withMessage('Invalid dropoff date and time'),
  body('passengers.adults').isInt({ min: 1 }).withMessage('At least one adult passenger is required'),
  body('passengers.totalPassengers').isInt({ min: 1 }).withMessage('Total passengers must be at least 1'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('pricing.subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('pricing.totalPrice').isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  body('contactInfo.primaryContact.name').notEmpty().withMessage('Primary contact name is required'),
  body('contactInfo.primaryContact.phone').notEmpty().withMessage('Primary contact phone is required'),
  body('contactInfo.primaryContact.email').isEmail().withMessage('Invalid primary contact email'),
  handleValidationErrors
], createBookingRequest);

// @desc    Get booking requests for vehicle owner
// @route   GET /api/vehicle-bookings/requests/owner
// @access  Private (Vehicle Owner)
router.get('/requests/owner', [
  protect,
  authorize('vehicle_owner', 'admin'),
  query('status').optional().isIn(['pending', 'confirmed', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date from'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date to'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getOwnerBookingRequests);

// @desc    Get booking requests for customer
// @route   GET /api/vehicle-bookings/requests/customer
// @access  Private (Customer)
router.get('/requests/customer', [
  protect,
  query('status').optional().isIn(['pending', 'confirmed', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date from'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date to'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], getCustomerBookingRequests);

// @desc    Get a specific booking request
// @route   GET /api/vehicle-bookings/requests/:requestId
// @access  Private
router.get('/requests/:requestId', [
  protect,
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  handleValidationErrors
], getBookingRequest);

// @desc    Update booking request status (Vehicle Owner)
// @route   PATCH /api/vehicle-bookings/requests/:requestId/status
// @access  Private (Vehicle Owner)
router.patch('/requests/:requestId/status', [
  protect,
  authorize('vehicle_owner', 'admin'),
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  body('status').isIn(['accepted', 'rejected', 'confirmed', 'cancelled', 'completed', 'no_show']).withMessage('Invalid status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('counterOffer.price').optional().isFloat({ min: 0 }).withMessage('Counter offer price must be a positive number'),
  body('counterOffer.timing.pickupDateTime').optional().isISO8601().withMessage('Invalid counter offer pickup date'),
  body('counterOffer.timing.dropoffDateTime').optional().isISO8601().withMessage('Invalid counter offer dropoff date'),
  body('counterOffer.terms').optional().isString().withMessage('Counter offer terms must be a string'),
  handleValidationErrors
], updateBookingStatus);

// @desc    Customer response to booking request
// @route   PATCH /api/vehicle-bookings/requests/:requestId/customer-response
// @access  Private (Customer)
router.patch('/requests/:requestId/customer-response', [
  protect,
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  body('status').isIn(['accepted', 'rejected', 'cancelled']).withMessage('Invalid customer response status'),
  body('message').optional().isString().withMessage('Message must be a string'),
  handleValidationErrors
], customerResponse);

// @desc    Add communication message
// @route   POST /api/vehicle-bookings/requests/:requestId/messages
// @access  Private
router.post('/requests/:requestId/messages', [
  protect,
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional().isIn(['message', 'counter_offer', 'status_update', 'system']).withMessage('Invalid message type'),
  handleValidationErrors
], addMessage);

// @desc    Cancel booking request
// @route   PATCH /api/vehicle-bookings/requests/:requestId/cancel
// @access  Private
router.patch('/requests/:requestId/cancel', [
  protect,
  param('requestId').isMongoId().withMessage('Invalid request ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be a positive number'),
  handleValidationErrors
], cancelBookingRequest);

// @desc    Get booking request statistics
// @route   GET /api/vehicle-bookings/requests/stats
// @access  Private
router.get('/requests/stats', [
  protect,
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], getBookingStats);

module.exports = router;
