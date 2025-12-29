import api from '../../api';

const analyticsService = {
  // Platform Overview Analytics
  getPlatformOverview: async (params = {}) => {
    const response = await api.get('/admin/analytics/overview', { params });
    return response.data;
  },

  // User Analytics
  getUserAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/users', { params });
    return response.data;
  },

  getUserGrowth: async (params = {}) => {
    const response = await api.get('/admin/analytics/users/growth', { params });
    return response.data;
  },

  getUserDemographics: async (params = {}) => {
    const response = await api.get('/admin/analytics/users/demographics', { params });
    return response.data;
  },

  getUserActivity: async (params = {}) => {
    const response = await api.get('/admin/analytics/users/activity', { params });
    return response.data;
  },

  // Hotel Analytics
  getHotelAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/hotels', { params });
    return response.data;
  },

  getHotelPerformance: async (params = {}) => {
    const response = await api.get('/admin/analytics/hotels/performance', { params });
    return response.data;
  },

  getHotelRevenue: async (params = {}) => {
    const response = await api.get('/admin/analytics/hotels/revenue', { params });
    return response.data;
  },

  getHotelOccupancy: async (params = {}) => {
    const response = await api.get('/admin/analytics/hotels/occupancy', { params });
    return response.data;
  },

  getTopPerformingHotels: async (params = {}) => {
    const response = await api.get('/admin/analytics/hotels/top-performing', { params });
    return response.data;
  },

  // Booking Analytics
  getBookingAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/bookings', { params });
    return response.data;
  },

  getBookingTrends: async (params = {}) => {
    const response = await api.get('/admin/analytics/bookings/trends', { params });
    return response.data;
  },

  getBookingRevenue: async (params = {}) => {
    const response = await api.get('/admin/analytics/bookings/revenue', { params });
    return response.data;
  },

  getBookingCancellations: async (params = {}) => {
    const response = await api.get('/admin/analytics/bookings/cancellations', { params });
    return response.data;
  },

  getBookingSources: async (params = {}) => {
    const response = await api.get('/admin/analytics/bookings/sources', { params });
    return response.data;
  },

  // Financial Analytics
  getFinancialAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/financial', { params });
    return response.data;
  },

  getRevenueAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  getCommissionAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/commission', { params });
    return response.data;
  },

  getPaymentAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/payments', { params });
    return response.data;
  },

  // Geographic Analytics
  getGeographicAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/geographic', { params });
    return response.data;
  },

  getLocationAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/locations', { params });
    return response.data;
  },

  getRegionalPerformance: async (params = {}) => {
    const response = await api.get('/admin/analytics/regional', { params });
    return response.data;
  },

  // Performance Analytics
  getPerformanceMetrics: async (params = {}) => {
    const response = await api.get('/admin/analytics/performance', { params });
    return response.data;
  },

  getSystemMetrics: async (params = {}) => {
    const response = await api.get('/admin/analytics/system', { params });
    return response.data;
  },

  getResponseTimeAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/response-time', { params });
    return response.data;
  },

  // Review Analytics
  getReviewAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/reviews', { params });
    return response.data;
  },

  getReviewTrends: async (params = {}) => {
    const response = await api.get('/admin/analytics/reviews/trends', { params });
    return response.data;
  },

  getReviewSentiment: async (params = {}) => {
    const response = await api.get('/admin/analytics/reviews/sentiment', { params });
    return response.data;
  },

  getReviewRatings: async (params = {}) => {
    const response = await api.get('/admin/analytics/reviews/ratings', { params });
    return response.data;
  },

  // Staff Analytics
  getStaffAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/staff', { params });
    return response.data;
  },

  getStaffPerformance: async (params = {}) => {
    const response = await api.get('/admin/analytics/staff/performance', { params });
    return response.data;
  },

  getStaffProductivity: async (params = {}) => {
    const response = await api.get('/admin/analytics/staff/productivity', { params });
    return response.data;
  },

  // Marketing Analytics
  getMarketingAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/marketing', { params });
    return response.data;
  },

  getCampaignAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/campaigns', { params });
    return response.data;
  },

  getConversionAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/conversion', { params });
    return response.data;
  },

  // Custom Reports
  generateCustomReport: async (reportConfig) => {
    const response = await api.post('/admin/analytics/custom-report', reportConfig);
    return response.data;
  },

  getReportTemplates: async () => {
    const response = await api.get('/admin/analytics/report-templates');
    return response.data;
  },

  saveReportTemplate: async (template) => {
    const response = await api.post('/admin/analytics/report-templates', template);
    return response.data;
  },

  updateReportTemplate: async (templateId, template) => {
    const response = await api.put(`/admin/analytics/report-templates/${templateId}`, template);
    return response.data;
  },

  deleteReportTemplate: async (templateId) => {
    const response = await api.delete(`/admin/analytics/report-templates/${templateId}`);
    return response.data;
  },

  // Export Analytics
  exportAnalytics: async (type, params = {}) => {
    const response = await api.get(`/admin/analytics/export/${type}`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportReport: async (reportId, format = 'pdf') => {
    const response = await api.get(`/admin/analytics/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Real-time Analytics
  getRealTimeMetrics: async () => {
    const response = await api.get('/admin/analytics/real-time');
    return response.data;
  },

  getLiveBookings: async () => {
    const response = await api.get('/admin/analytics/live-bookings');
    return response.data;
  },

  getLiveUsers: async () => {
    const response = await api.get('/admin/analytics/live-users');
    return response.data;
  },

  // Dashboard Widgets
  getDashboardWidgets: async () => {
    const response = await api.get('/admin/analytics/dashboard-widgets');
    return response.data;
  },

  updateDashboardWidgets: async (widgets) => {
    const response = await api.put('/admin/analytics/dashboard-widgets', { widgets });
    return response.data;
  },

  // Alerts and Notifications
  getAnalyticsAlerts: async (params = {}) => {
    const response = await api.get('/admin/analytics/alerts', { params });
    return response.data;
  },

  createAnalyticsAlert: async (alert) => {
    const response = await api.post('/admin/analytics/alerts', alert);
    return response.data;
  },

  updateAnalyticsAlert: async (alertId, alert) => {
    const response = await api.put(`/admin/analytics/alerts/${alertId}`, alert);
    return response.data;
  },

  deleteAnalyticsAlert: async (alertId) => {
    const response = await api.delete(`/admin/analytics/alerts/${alertId}`);
    return response.data;
  },

  // Data Insights
  getDataInsights: async (params = {}) => {
    const response = await api.get('/admin/analytics/insights', { params });
    return response.data;
  },

  getTrendingData: async (params = {}) => {
    const response = await api.get('/admin/analytics/trending', { params });
    return response.data;
  },

  getAnomalyDetection: async (params = {}) => {
    const response = await api.get('/admin/analytics/anomalies', { params });
    return response.data;
  }
};

export default analyticsService;
