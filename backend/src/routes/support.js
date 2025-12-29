// User Support Routes
const express = require('express');
const router = express.Router();
const {
  submitSupportTicket,
  getUserSupportTickets,
  getSupportTicket,
  addSupportMessage,
  rateSupportTicket
} = require('../controllers/staff/supportController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   POST /api/support/tickets
// @desc    Submit a support ticket
// @access  Private
router.post('/tickets', submitSupportTicket);

// @route   GET /api/support/tickets
// @desc    Get user's support tickets
// @access  Private
router.get('/tickets', getUserSupportTickets);

// @route   GET /api/support/tickets/:id
// @desc    Get specific support ticket
// @access  Private
router.get('/tickets/:id', getSupportTicket);

// @route   POST /api/support/tickets/:id/messages
// @desc    Add message to support ticket
// @access  Private
router.post('/tickets/:id/messages', addSupportMessage);

// @route   POST /api/support/tickets/:id/rate
// @desc    Rate support ticket resolution
// @access  Private
router.post('/tickets/:id/rate', rateSupportTicket);

module.exports = router;
