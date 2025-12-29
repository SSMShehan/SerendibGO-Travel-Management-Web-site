// Staff Authentication Routes
const express = require('express');
const router = express.Router();
const { staffLogin, staffLogout, getCurrentStaff, updateStaffProfile } = require('../../controllers/staff/authController');
const { staffAuth } = require('../../middleware/staffAuth');

// Public routes
router.post('/login', staffLogin);

// Protected routes
router.use(staffAuth); // Apply staff authentication middleware to all routes below

router.post('/logout', staffLogout);
router.get('/me', getCurrentStaff);
router.put('/profile', updateStaffProfile);

module.exports = router;


