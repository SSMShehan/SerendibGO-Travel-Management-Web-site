import api from '../api';

const earningsService = {
  // Get earnings overview
  getEarningsOverview: async (params = {}) => {
    const response = await api.get('/earnings/overview', { params });
    return response.data;
  },

  // Get earnings list
  getEarnings: async (params = {}) => {
    const response = await api.get('/earnings', { params });
    return response.data;
  },

  // Get single earning
  getEarning: async (earningId) => {
    const response = await api.get(`/earnings/${earningId}`);
    return response.data;
  },

  // Get earnings statistics
  getEarningsStats: async (params = {}) => {
    const response = await api.get('/earnings/stats', { params });
    return response.data;
  },

  // Get earnings by period
  getEarningsByPeriod: async (period, params = {}) => {
    const response = await api.get(`/earnings/period/${period}`, { params });
    return response.data;
  },

  // Get earnings trends
  getEarningsTrends: async (params = {}) => {
    const response = await api.get('/earnings/trends', { params });
    return response.data;
  },

  // Get earnings by hotel
  getEarningsByHotel: async (hotelId, params = {}) => {
    const response = await api.get(`/earnings/hotel/${hotelId}`, { params });
    return response.data;
  },

  // Get earnings by booking
  getEarningsByBooking: async (bookingId) => {
    const response = await api.get(`/earnings/booking/${bookingId}`);
    return response.data;
  },

  // Get payout history
  getPayouts: async (params = {}) => {
    const response = await api.get('/earnings/payouts', { params });
    return response.data;
  },

  // Get single payout
  getPayout: async (payoutId) => {
    const response = await api.get(`/earnings/payouts/${payoutId}`);
    return response.data;
  },

  // Request payout
  requestPayout: async (payoutData) => {
    const response = await api.post('/earnings/payouts/request', payoutData);
    return response.data;
  },

  // Cancel payout
  cancelPayout: async (payoutId) => {
    const response = await api.post(`/earnings/payouts/${payoutId}/cancel`);
    return response.data;
  },

  // Get payout methods
  getPayoutMethods: async () => {
    const response = await api.get('/earnings/payout-methods');
    return response.data;
  },

  // Add payout method
  addPayoutMethod: async (methodData) => {
    const response = await api.post('/earnings/payout-methods', methodData);
    return response.data;
  },

  // Update payout method
  updatePayoutMethod: async (methodId, methodData) => {
    const response = await api.put(`/earnings/payout-methods/${methodId}`, methodData);
    return response.data;
  },

  // Delete payout method
  deletePayoutMethod: async (methodId) => {
    const response = await api.delete(`/earnings/payout-methods/${methodId}`);
    return response.data;
  },

  // Get payout settings
  getPayoutSettings: async () => {
    const response = await api.get('/earnings/payout-settings');
    return response.data;
  },

  // Update payout settings
  updatePayoutSettings: async (settings) => {
    const response = await api.put('/earnings/payout-settings', settings);
    return response.data;
  },

  // Get commission rates
  getCommissionRates: async () => {
    const response = await api.get('/earnings/commission-rates');
    return response.data;
  },

  // Update commission rates
  updateCommissionRates: async (rates) => {
    const response = await api.put('/earnings/commission-rates', rates);
    return response.data;
  },

  // Get tax information
  getTaxInfo: async () => {
    const response = await api.get('/earnings/tax-info');
    return response.data;
  },

  // Update tax information
  updateTaxInfo: async (taxInfo) => {
    const response = await api.put('/earnings/tax-info', taxInfo);
    return response.data;
  },

  // Get earnings reports
  getEarningsReports: async (params = {}) => {
    const response = await api.get('/earnings/reports', { params });
    return response.data;
  },

  // Generate earnings report
  generateEarningsReport: async (reportData) => {
    const response = await api.post('/earnings/reports/generate', reportData);
    return response.data;
  },

  // Export earnings data
  exportEarnings: async (params = {}) => {
    const response = await api.get('/earnings/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get earnings alerts
  getEarningsAlerts: async () => {
    const response = await api.get('/earnings/alerts');
    return response.data;
  },

  // Create earnings alert
  createEarningsAlert: async (alertData) => {
    const response = await api.post('/earnings/alerts', alertData);
    return response.data;
  },

  // Update earnings alert
  updateEarningsAlert: async (alertId, alertData) => {
    const response = await api.put(`/earnings/alerts/${alertId}`, alertData);
    return response.data;
  },

  // Delete earnings alert
  deleteEarningsAlert: async (alertId) => {
    const response = await api.delete(`/earnings/alerts/${alertId}`);
    return response.data;
  },

  // Get earnings goals
  getEarningsGoals: async () => {
    const response = await api.get('/earnings/goals');
    return response.data;
  },

  // Create earnings goal
  createEarningsGoal: async (goalData) => {
    const response = await api.post('/earnings/goals', goalData);
    return response.data;
  },

  // Update earnings goal
  updateEarningsGoal: async (goalId, goalData) => {
    const response = await api.put(`/earnings/goals/${goalId}`, goalData);
    return response.data;
  },

  // Delete earnings goal
  deleteEarningsGoal: async (goalId) => {
    const response = await api.delete(`/earnings/goals/${goalId}`);
    return response.data;
  },

  // Get earnings milestones
  getEarningsMilestones: async () => {
    const response = await api.get('/earnings/milestones');
    return response.data;
  },

  // Get earnings leaderboard
  getEarningsLeaderboard: async (params = {}) => {
    const response = await api.get('/earnings/leaderboard', { params });
    return response.data;
  },

  // Get earnings comparison
  getEarningsComparison: async (params = {}) => {
    const response = await api.get('/earnings/comparison', { params });
    return response.data;
  },

  // Get earnings forecast
  getEarningsForecast: async (params = {}) => {
    const response = await api.get('/earnings/forecast', { params });
    return response.data;
  },

  // Get earnings insights
  getEarningsInsights: async (params = {}) => {
    const response = await api.get('/earnings/insights', { params });
    return response.data;
  },

  // Get earnings recommendations
  getEarningsRecommendations: async () => {
    const response = await api.get('/earnings/recommendations');
    return response.data;
  },

  // Get earnings performance
  getEarningsPerformance: async (params = {}) => {
    const response = await api.get('/earnings/performance', { params });
    return response.data;
  },

  // Get earnings breakdown
  getEarningsBreakdown: async (params = {}) => {
    const response = await api.get('/earnings/breakdown', { params });
    return response.data;
  },

  // Get earnings summary
  getEarningsSummary: async (params = {}) => {
    const response = await api.get('/earnings/summary', { params });
    return response.data;
  },

  // Get earnings calendar
  getEarningsCalendar: async (params = {}) => {
    const response = await api.get('/earnings/calendar', { params });
    return response.data;
  },

  // Get earnings notifications
  getEarningsNotifications: async (params = {}) => {
    const response = await api.get('/earnings/notifications', { params });
    return response.data;
  },

  // Mark earnings notification as read
  markEarningsNotificationAsRead: async (notificationId) => {
    const response = await api.put(`/earnings/notifications/${notificationId}/read`);
    return response.data;
  },

  // Get earnings disputes
  getEarningsDisputes: async (params = {}) => {
    const response = await api.get('/earnings/disputes', { params });
    return response.data;
  },

  // Create earnings dispute
  createEarningsDispute: async (disputeData) => {
    const response = await api.post('/earnings/disputes', disputeData);
    return response.data;
  },

  // Update earnings dispute
  updateEarningsDispute: async (disputeId, disputeData) => {
    const response = await api.put(`/earnings/disputes/${disputeId}`, disputeData);
    return response.data;
  },

  // Get earnings support
  getEarningsSupport: async () => {
    const response = await api.get('/earnings/support');
    return response.data;
  },

  // Submit earnings support ticket
  submitEarningsSupportTicket: async (ticketData) => {
    const response = await api.post('/earnings/support/tickets', ticketData);
    return response.data;
  }
};

export default earningsService;
