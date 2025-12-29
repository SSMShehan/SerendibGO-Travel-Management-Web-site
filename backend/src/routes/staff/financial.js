// Staff Financial Management Routes
const express = require('express');
const router = express.Router();
const { 
  getFinancialOverview,
  getCommissionRates,
  updateCommissionRates,
  getServiceProviderEarnings,
  processPayout,
  getFinancialReports,
  getPaymentStatus
} = require('../../controllers/staff/financialController');
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// Financial routes
router.get('/overview', getFinancialOverview);
router.get('/commission-rates', getCommissionRates);
router.put('/commission-rates', updateCommissionRates);
router.get('/earnings', getServiceProviderEarnings);
router.post('/payouts', processPayout);
router.get('/reports', getFinancialReports);
router.get('/payments', getPaymentStatus);

module.exports = router;


