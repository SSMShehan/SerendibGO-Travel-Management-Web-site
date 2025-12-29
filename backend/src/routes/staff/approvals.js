// Staff Approval Routes
const express = require('express');
const router = express.Router();
const { 
  getPendingApprovals,
  getApprovalDetails,
  approveServiceProvider,
  rejectServiceProvider,
  bulkApproveServiceProviders,
  getApprovalStatistics
} = require('../../controllers/staff/approvalController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Approval routes
router.get('/pending', getPendingApprovals);
router.get('/statistics', getApprovalStatistics);
router.get('/:id', getApprovalDetails);
router.post('/:id/approve', approveServiceProvider);
router.post('/:id/reject', rejectServiceProvider);
router.post('/bulk-approve', bulkApproveServiceProviders);

module.exports = router;
