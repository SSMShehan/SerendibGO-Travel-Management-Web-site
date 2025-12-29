import api from '../api';

const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get single notification
  getNotification: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Create notification
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Update notification
  updateNotification: async (notificationId, notificationData) => {
    const response = await api.put(`/notifications/${notificationId}`, notificationData);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Get notification templates
  getTemplates: async () => {
    const response = await api.get('/notifications/templates');
    return response.data;
  },

  // Create notification template
  createTemplate: async (templateData) => {
    const response = await api.post('/notifications/templates', templateData);
    return response.data;
  },

  // Update notification template
  updateTemplate: async (templateId, templateData) => {
    const response = await api.put(`/notifications/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete notification template
  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/notifications/templates/${templateId}`);
    return response.data;
  },

  // Send notification
  sendNotification: async (notificationData) => {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
  },

  // Send bulk notifications
  sendBulkNotifications: async (notificationsData) => {
    const response = await api.post('/notifications/send-bulk', notificationsData);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async (params = {}) => {
    const response = await api.get('/notifications/stats', { params });
    return response.data;
  },

  // Get notification logs
  getNotificationLogs: async (params = {}) => {
    const response = await api.get('/notifications/logs', { params });
    return response.data;
  },

  // Get user notification preferences
  getUserPreferences: async (userId) => {
    const response = await api.get(`/notifications/preferences/${userId}`);
    return response.data;
  },

  // Update user notification preferences
  updateUserPreferences: async (userId, preferences) => {
    const response = await api.put(`/notifications/preferences/${userId}`, preferences);
    return response.data;
  },

  // Get notification settings
  getSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  // Test notification
  testNotification: async (notificationData) => {
    const response = await api.post('/notifications/test', notificationData);
    return response.data;
  },

  // Get notification queue
  getNotificationQueue: async (params = {}) => {
    const response = await api.get('/notifications/queue', { params });
    return response.data;
  },

  // Retry failed notification
  retryNotification: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/retry`);
    return response.data;
  },

  // Cancel notification
  cancelNotification: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/cancel`);
    return response.data;
  },

  // Get notification history
  getNotificationHistory: async (params = {}) => {
    const response = await api.get('/notifications/history', { params });
    return response.data;
  },

  // Export notifications
  exportNotifications: async (params = {}) => {
    const response = await api.get('/notifications/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import notifications
  importNotifications: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/notifications/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get notification analytics
  getNotificationAnalytics: async (params = {}) => {
    const response = await api.get('/notifications/analytics', { params });
    return response.data;
  },

  // Get delivery reports
  getDeliveryReports: async (params = {}) => {
    const response = await api.get('/notifications/delivery-reports', { params });
    return response.data;
  },

  // Get bounce reports
  getBounceReports: async (params = {}) => {
    const response = await api.get('/notifications/bounce-reports', { params });
    return response.data;
  },

  // Get open rates
  getOpenRates: async (params = {}) => {
    const response = await api.get('/notifications/open-rates', { params });
    return response.data;
  },

  // Get click rates
  getClickRates: async (params = {}) => {
    const response = await api.get('/notifications/click-rates', { params });
    return response.data;
  },

  // Get unsubscribe list
  getUnsubscribeList: async (params = {}) => {
    const response = await api.get('/notifications/unsubscribe-list', { params });
    return response.data;
  },

  // Add to unsubscribe list
  addToUnsubscribeList: async (email) => {
    const response = await api.post('/notifications/unsubscribe-list', { email });
    return response.data;
  },

  // Remove from unsubscribe list
  removeFromUnsubscribeList: async (email) => {
    const response = await api.delete(`/notifications/unsubscribe-list/${email}`);
    return response.data;
  },

  // Get notification campaigns
  getCampaigns: async (params = {}) => {
    const response = await api.get('/notifications/campaigns', { params });
    return response.data;
  },

  // Create notification campaign
  createCampaign: async (campaignData) => {
    const response = await api.post('/notifications/campaigns', campaignData);
    return response.data;
  },

  // Update notification campaign
  updateCampaign: async (campaignId, campaignData) => {
    const response = await api.put(`/notifications/campaigns/${campaignId}`, campaignData);
    return response.data;
  },

  // Delete notification campaign
  deleteCampaign: async (campaignId) => {
    const response = await api.delete(`/notifications/campaigns/${campaignId}`);
    return response.data;
  },

  // Send campaign
  sendCampaign: async (campaignId) => {
    const response = await api.post(`/notifications/campaigns/${campaignId}/send`);
    return response.data;
  },

  // Get campaign analytics
  getCampaignAnalytics: async (campaignId) => {
    const response = await api.get(`/notifications/campaigns/${campaignId}/analytics`);
    return response.data;
  },

  // Get notification providers
  getProviders: async () => {
    const response = await api.get('/notifications/providers');
    return response.data;
  },

  // Update notification provider
  updateProvider: async (providerId, providerData) => {
    const response = await api.put(`/notifications/providers/${providerId}`, providerData);
    return response.data;
  },

  // Test notification provider
  testProvider: async (providerId) => {
    const response = await api.post(`/notifications/providers/${providerId}/test`);
    return response.data;
  },

  // Get notification webhooks
  getWebhooks: async () => {
    const response = await api.get('/notifications/webhooks');
    return response.data;
  },

  // Create notification webhook
  createWebhook: async (webhookData) => {
    const response = await api.post('/notifications/webhooks', webhookData);
    return response.data;
  },

  // Update notification webhook
  updateWebhook: async (webhookId, webhookData) => {
    const response = await api.put(`/notifications/webhooks/${webhookId}`, webhookData);
    return response.data;
  },

  // Delete notification webhook
  deleteWebhook: async (webhookId) => {
    const response = await api.delete(`/notifications/webhooks/${webhookId}`);
    return response.data;
  },

  // Test notification webhook
  testWebhook: async (webhookId) => {
    const response = await api.post(`/notifications/webhooks/${webhookId}/test`);
    return response.data;
  }
};

export default notificationService;
