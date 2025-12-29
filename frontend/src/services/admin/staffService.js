import api from '../api';

const staffService = {
  // Get all staff members
  getStaffMembers: async (params = {}) => {
    const response = await api.get('/admin/staff', { params });
    return response.data;
  },

  // Get single staff member
  getStaffMember: async (staffId) => {
    const response = await api.get(`/admin/staff/${staffId}`);
    return response.data;
  },

  // Create new staff member
  createStaffMember: async (staffData) => {
    const response = await api.post('/admin/staff', staffData);
    return response.data;
  },

  // Update staff member
  updateStaffMember: async (staffId, staffData) => {
    const response = await api.put(`/admin/staff/${staffId}`, staffData);
    return response.data;
  },

  // Delete staff member
  deleteStaffMember: async (staffId) => {
    const response = await api.delete(`/admin/staff/${staffId}`);
    return response.data;
  },

  // Update staff permissions
  updateStaffPermissions: async (staffId, permissions) => {
    const response = await api.put(`/admin/staff/${staffId}/permissions`, { permissions });
    return response.data;
  },

  // Update staff status
  updateStaffStatus: async (staffId, status) => {
    const response = await api.put(`/admin/staff/${staffId}/status`, { status });
    return response.data;
  },

  // Get staff performance metrics
  getStaffPerformance: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/performance`, { params });
    return response.data;
  },

  // Get staff activity log
  getStaffActivity: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/activity`, { params });
    return response.data;
  },

  // Get staff statistics
  getStaffStats: async (params = {}) => {
    const response = await api.get('/admin/staff/stats', { params });
    return response.data;
  },

  // Update staff status
  updateStaffStatus: async (staffId, status) => {
    const response = await api.patch(`/admin/staff/${staffId}/toggle-status`, { status });
    return response.data;
  },

  // Export staff data
  exportStaffData: async (options = {}) => {
    const response = await api.post('/admin/staff/export', options, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Import staff data
  importStaffData: async (formData) => {
    const response = await api.post('/admin/staff/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin dashboard methods
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentUsers: async (params = {}) => {
    const response = await api.get('/admin/users/recent', { params });
    return response.data;
  },

  getRecentBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings/recent', { params });
    return response.data;
  },

  getRecentHotels: async (params = {}) => {
    const response = await api.get('/admin/hotels/recent', { params });
    return response.data;
  },

  getPendingHotels: async (params = {}) => {
    const response = await api.get('/admin/hotels/pending', { params });
    return response.data;
  },

  getUnverifiedUsers: async (params = {}) => {
    const response = await api.get('/admin/users/unverified', { params });
    return response.data;
  },

  // Get staff permissions
  getStaffPermissions: async (staffId) => {
    const response = await api.get(`/admin/staff/${staffId}/permissions`);
    return response.data;
  },

  // Assign staff to hotel
  assignStaffToHotel: async (staffId, hotelId) => {
    const response = await api.post(`/admin/staff/${staffId}/assign-hotel`, { hotelId });
    return response.data;
  },

  // Remove staff from hotel
  removeStaffFromHotel: async (staffId, hotelId) => {
    const response = await api.delete(`/admin/staff/${staffId}/assign-hotel/${hotelId}`);
    return response.data;
  },

  // Get staff assigned hotels
  getStaffAssignedHotels: async (staffId) => {
    const response = await api.get(`/admin/staff/${staffId}/assigned-hotels`);
    return response.data;
  },

  // Get staff workload
  getStaffWorkload: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/workload`, { params });
    return response.data;
  },

  // Get staff schedule
  getStaffSchedule: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/schedule`, { params });
    return response.data;
  },

  // Update staff schedule
  updateStaffSchedule: async (staffId, scheduleData) => {
    const response = await api.put(`/admin/staff/${staffId}/schedule`, scheduleData);
    return response.data;
  },

  // Get staff training records
  getStaffTraining: async (staffId) => {
    const response = await api.get(`/admin/staff/${staffId}/training`);
    return response.data;
  },

  // Add training record
  addStaffTraining: async (staffId, trainingData) => {
    const response = await api.post(`/admin/staff/${staffId}/training`, trainingData);
    return response.data;
  },

  // Get staff reviews
  getStaffReviews: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/reviews`, { params });
    return response.data;
  },

  // Add staff review
  addStaffReview: async (staffId, reviewData) => {
    const response = await api.post(`/admin/staff/${staffId}/reviews`, reviewData);
    return response.data;
  },

  // Get staff documents
  getStaffDocuments: async (staffId) => {
    const response = await api.get(`/admin/staff/${staffId}/documents`);
    return response.data;
  },

  // Upload staff document
  uploadStaffDocument: async (staffId, documentData) => {
    const formData = new FormData();
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });

    const response = await api.post(`/admin/staff/${staffId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete staff document
  deleteStaffDocument: async (staffId, documentId) => {
    const response = await api.delete(`/admin/staff/${staffId}/documents/${documentId}`);
    return response.data;
  },

  // Get staff notifications
  getStaffNotifications: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/notifications`, { params });
    return response.data;
  },

  // Send notification to staff
  sendStaffNotification: async (staffId, notificationData) => {
    const response = await api.post(`/admin/staff/${staffId}/notifications`, notificationData);
    return response.data;
  },

  // Get staff login history
  getStaffLoginHistory: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/login-history`, { params });
    return response.data;
  },

  // Reset staff password
  resetStaffPassword: async (staffId) => {
    const response = await api.post(`/admin/staff/${staffId}/reset-password`);
    return response.data;
  },

  // Get staff audit trail
  getStaffAuditTrail: async (staffId, params = {}) => {
    const response = await api.get(`/admin/staff/${staffId}/audit-trail`, { params });
    return response.data;
  },

  // Export staff data
  exportStaffData: async (params = {}) => {
    const response = await api.get('/admin/staff/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import staff data
  importStaffData: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/staff/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get staff templates
  getStaffTemplates: async () => {
    const response = await api.get('/admin/staff/templates');
    return response.data;
  },

  // Create staff template
  createStaffTemplate: async (templateData) => {
    const response = await api.post('/admin/staff/templates', templateData);
    return response.data;
  },

  // Update staff template
  updateStaffTemplate: async (templateId, templateData) => {
    const response = await api.put(`/admin/staff/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete staff template
  deleteStaffTemplate: async (templateId) => {
    const response = await api.delete(`/admin/staff/templates/${templateId}`);
    return response.data;
  }
};

export default staffService;
