// Staff Guide Management Routes
const express = require('express');
const router = express.Router();
const { 
  getGuides,
  getGuideStatistics,
  deleteGuide,
  bulkGuideAction
} = require('../../controllers/staff/guideController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Guide routes
router.get('/', getGuides);
router.get('/statistics', getGuideStatistics);
router.delete('/:id', deleteGuide);
router.post('/bulk-action', bulkGuideAction);

module.exports = router;
