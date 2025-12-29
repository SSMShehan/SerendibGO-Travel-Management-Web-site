import api from '../api';

const pricingService = {
  // Get pricing overview
  getPricingOverview: async (params = {}) => {
    const response = await api.get('/pricing/overview', { params });
    return response.data;
  },

  // Get pricing rules
  getPricingRules: async (params = {}) => {
    const response = await api.get('/pricing/rules', { params });
    return response.data;
  },

  // Get single pricing rule
  getPricingRule: async (ruleId) => {
    const response = await api.get(`/pricing/rules/${ruleId}`);
    return response.data;
  },

  // Create pricing rule
  createPricingRule: async (ruleData) => {
    const response = await api.post('/pricing/rules', ruleData);
    return response.data;
  },

  // Update pricing rule
  updatePricingRule: async (ruleId, ruleData) => {
    const response = await api.put(`/pricing/rules/${ruleId}`, ruleData);
    return response.data;
  },

  // Delete pricing rule
  deletePricingRule: async (ruleId) => {
    const response = await api.delete(`/pricing/rules/${ruleId}`);
    return response.data;
  },

  // Get pricing statistics
  getPricingStats: async (params = {}) => {
    const response = await api.get('/pricing/stats', { params });
    return response.data;
  },

  // Get pricing by hotel
  getPricingByHotel: async (hotelId, params = {}) => {
    const response = await api.get(`/pricing/hotel/${hotelId}`, { params });
    return response.data;
  },

  // Get pricing by room
  getPricingByRoom: async (roomId, params = {}) => {
    const response = await api.get(`/pricing/room/${roomId}`, { params });
    return response.data;
  },

  // Get pricing by date range
  getPricingByDateRange: async (startDate, endDate, params = {}) => {
    const response = await api.get('/pricing/date-range', { 
      params: { startDate, endDate, ...params }
    });
    return response.data;
  },

  // Get pricing calendar
  getPricingCalendar: async (params = {}) => {
    const response = await api.get('/pricing/calendar', { params });
    return response.data;
  },

  // Update pricing calendar
  updatePricingCalendar: async (calendarData) => {
    const response = await api.put('/pricing/calendar', calendarData);
    return response.data;
  },

  // Get pricing templates
  getPricingTemplates: async () => {
    const response = await api.get('/pricing/templates');
    return response.data;
  },

  // Create pricing template
  createPricingTemplate: async (templateData) => {
    const response = await api.post('/pricing/templates', templateData);
    return response.data;
  },

  // Update pricing template
  updatePricingTemplate: async (templateId, templateData) => {
    const response = await api.put(`/pricing/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete pricing template
  deletePricingTemplate: async (templateId) => {
    const response = await api.delete(`/pricing/templates/${templateId}`);
    return response.data;
  },

  // Apply pricing template
  applyPricingTemplate: async (templateId, targetData) => {
    const response = await api.post(`/pricing/templates/${templateId}/apply`, targetData);
    return response.data;
  },

  // Get pricing history
  getPricingHistory: async (params = {}) => {
    const response = await api.get('/pricing/history', { params });
    return response.data;
  },

  // Get pricing changes
  getPricingChanges: async (params = {}) => {
    const response = await api.get('/pricing/changes', { params });
    return response.data;
  },

  // Revert pricing change
  revertPricingChange: async (changeId) => {
    const response = await api.post(`/pricing/changes/${changeId}/revert`);
    return response.data;
  },

  // Get pricing analytics
  getPricingAnalytics: async (params = {}) => {
    const response = await api.get('/pricing/analytics', { params });
    return response.data;
  },

  // Get pricing performance
  getPricingPerformance: async (params = {}) => {
    const response = await api.get('/pricing/performance', { params });
    return response.data;
  },

  // Get pricing recommendations
  getPricingRecommendations: async (params = {}) => {
    const response = await api.get('/pricing/recommendations', { params });
    return response.data;
  },

  // Get pricing alerts
  getPricingAlerts: async () => {
    const response = await api.get('/pricing/alerts');
    return response.data;
  },

  // Create pricing alert
  createPricingAlert: async (alertData) => {
    const response = await api.post('/pricing/alerts', alertData);
    return response.data;
  },

  // Update pricing alert
  updatePricingAlert: async (alertId, alertData) => {
    const response = await api.put(`/pricing/alerts/${alertId}`, alertData);
    return response.data;
  },

  // Delete pricing alert
  deletePricingAlert: async (alertId) => {
    const response = await api.delete(`/pricing/alerts/${alertId}`);
    return response.data;
  },

  // Get pricing settings
  getPricingSettings: async () => {
    const response = await api.get('/pricing/settings');
    return response.data;
  },

  // Update pricing settings
  updatePricingSettings: async (settings) => {
    const response = await api.put('/pricing/settings', settings);
    return response.data;
  },

  // Get pricing rules validation
  validatePricingRules: async (rules) => {
    const response = await api.post('/pricing/validate', { rules });
    return response.data;
  },

  // Bulk update pricing
  bulkUpdatePricing: async (updateData) => {
    const response = await api.post('/pricing/bulk-update', updateData);
    return response.data;
  },

  // Bulk delete pricing
  bulkDeletePricing: async (ruleIds) => {
    const response = await api.post('/pricing/bulk-delete', { ruleIds });
    return response.data;
  },

  // Duplicate pricing rule
  duplicatePricingRule: async (ruleId) => {
    const response = await api.post(`/pricing/rules/${ruleId}/duplicate`);
    return response.data;
  },

  // Activate pricing rule
  activatePricingRule: async (ruleId) => {
    const response = await api.post(`/pricing/rules/${ruleId}/activate`);
    return response.data;
  },

  // Deactivate pricing rule
  deactivatePricingRule: async (ruleId) => {
    const response = await api.post(`/pricing/rules/${ruleId}/deactivate`);
    return response.data;
  },

  // Schedule pricing rule
  schedulePricingRule: async (ruleId, scheduleData) => {
    const response = await api.post(`/pricing/rules/${ruleId}/schedule`, scheduleData);
    return response.data;
  },

  // Get pricing reports
  getPricingReports: async (params = {}) => {
    const response = await api.get('/pricing/reports', { params });
    return response.data;
  },

  // Generate pricing report
  generatePricingReport: async (reportData) => {
    const response = await api.post('/pricing/reports/generate', reportData);
    return response.data;
  },

  // Export pricing data
  exportPricing: async (params = {}) => {
    const response = await api.get('/pricing/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import pricing data
  importPricing: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/pricing/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get pricing comparison
  getPricingComparison: async (params = {}) => {
    const response = await api.get('/pricing/comparison', { params });
    return response.data;
  },

  // Get pricing trends
  getPricingTrends: async (params = {}) => {
    const response = await api.get('/pricing/trends', { params });
    return response.data;
  },

  // Get pricing forecast
  getPricingForecast: async (params = {}) => {
    const response = await api.get('/pricing/forecast', { params });
    return response.data;
  },

  // Get pricing insights
  getPricingInsights: async (params = {}) => {
    const response = await api.get('/pricing/insights', { params });
    return response.data;
  },

  // Get pricing optimization
  getPricingOptimization: async (params = {}) => {
    const response = await api.get('/pricing/optimization', { params });
    return response.data;
  },

  // Apply pricing optimization
  applyPricingOptimization: async (optimizationData) => {
    const response = await api.post('/pricing/optimization/apply', optimizationData);
    return response.data;
  },

  // Get pricing rules conflicts
  getPricingConflicts: async (params = {}) => {
    const response = await api.get('/pricing/conflicts', { params });
    return response.data;
  },

  // Resolve pricing conflict
  resolvePricingConflict: async (conflictId, resolution) => {
    const response = await api.post(`/pricing/conflicts/${conflictId}/resolve`, resolution);
    return response.data;
  },

  // Get pricing rules impact
  getPricingImpact: async (params = {}) => {
    const response = await api.get('/pricing/impact', { params });
    return response.data;
  },

  // Test pricing rule
  testPricingRule: async (ruleData) => {
    const response = await api.post('/pricing/test', ruleData);
    return response.data;
  },

  // Get pricing rules preview
  getPricingPreview: async (params = {}) => {
    const response = await api.get('/pricing/preview', { params });
    return response.data;
  },

  // Get pricing rules simulation
  getPricingSimulation: async (simulationData) => {
    const response = await api.post('/pricing/simulation', simulationData);
    return response.data;
  }
};

export default pricingService;
