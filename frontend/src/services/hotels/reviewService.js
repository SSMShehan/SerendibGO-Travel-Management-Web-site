import api from '../api';

const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a hotel
  getHotelReviews: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/reviews`, { params });
    return response.data;
  },

  // Get a single review
  getReview: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (params = {}) => {
    const response = await api.get('/reviews/user', { params });
    return response.data;
  },

  // Like/Dislike a review
  rateReview: async (reviewId, action) => {
    const response = await api.post(`/reviews/${reviewId}/rate`, { action });
    return response.data;
  },

  // Report a review
  reportReview: async (reviewId, reason, description = '') => {
    const response = await api.post(`/reviews/${reviewId}/report`, {
      reason,
      description
    });
    return response.data;
  },

  // Reply to a review (for hotel owners)
  replyToReview: async (reviewId, reply) => {
    const response = await api.post(`/reviews/${reviewId}/reply`, { reply });
    return response.data;
  },

  // Update reply to a review
  updateReply: async (reviewId, replyId, reply) => {
    const response = await api.put(`/reviews/${reviewId}/reply/${replyId}`, { reply });
    return response.data;
  },

  // Delete reply to a review
  deleteReply: async (reviewId, replyId) => {
    const response = await api.delete(`/reviews/${reviewId}/reply/${replyId}`);
    return response.data;
  },

  // Get review statistics for a hotel
  getHotelReviewStats: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/reviews/stats`);
    return response.data;
  },

  // Get review statistics for a user
  getUserReviewStats: async (userId) => {
    const response = await api.get(`/users/${userId}/reviews/stats`);
    return response.data;
  },

  // Get review analytics (for admins)
  getReviewAnalytics: async (params = {}) => {
    const response = await api.get('/reviews/analytics', { params });
    return response.data;
  },

  // Get pending reviews (for admins)
  getPendingReviews: async (params = {}) => {
    const response = await api.get('/reviews/pending', { params });
    return response.data;
  },

  // Approve/Reject a review (for admins)
  moderateReview: async (reviewId, action, reason = '') => {
    const response = await api.put(`/reviews/${reviewId}/moderate`, {
      action,
      reason
    });
    return response.data;
  },

  // Get flagged reviews (for admins)
  getFlaggedReviews: async (params = {}) => {
    const response = await api.get('/reviews/flagged', { params });
    return response.data;
  },

  // Resolve a flagged review (for admins)
  resolveFlaggedReview: async (reviewId, action, reason = '') => {
    const response = await api.put(`/reviews/${reviewId}/resolve-flag`, {
      action,
      reason
    });
    return response.data;
  },

  // Upload review photos
  uploadReviewPhotos: async (reviewId, photos) => {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos`, photo);
    });

    const response = await api.post(`/reviews/${reviewId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete review photos
  deleteReviewPhotos: async (reviewId, photoIds) => {
    const response = await api.delete(`/reviews/${reviewId}/photos`, {
      data: { photoIds }
    });
    return response.data;
  },

  // Get review photos
  getReviewPhotos: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}/photos`);
    return response.data;
  },

  // Get review summary for a hotel
  getHotelReviewSummary: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/reviews/summary`);
    return response.data;
  },

  // Get recent reviews
  getRecentReviews: async (params = {}) => {
    const response = await api.get('/reviews/recent', { params });
    return response.data;
  },

  // Get top rated hotels
  getTopRatedHotels: async (params = {}) => {
    const response = await api.get('/hotels/top-rated', { params });
    return response.data;
  },

  // Get review trends
  getReviewTrends: async (hotelId, period = 'month') => {
    const response = await api.get(`/hotels/${hotelId}/reviews/trends`, {
      params: { period }
    });
    return response.data;
  },

  // Get review insights
  getReviewInsights: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/reviews/insights`);
    return response.data;
  },

  // Search reviews
  searchReviews: async (query, params = {}) => {
    const response = await api.get('/reviews/search', {
      params: { query, ...params }
    });
    return response.data;
  },

  // Get review categories
  getReviewCategories: async () => {
    const response = await api.get('/reviews/categories');
    return response.data;
  },

  // Get review tags
  getReviewTags: async () => {
    const response = await api.get('/reviews/tags');
    return response.data;
  },

  // Add tags to a review
  addReviewTags: async (reviewId, tags) => {
    const response = await api.post(`/reviews/${reviewId}/tags`, { tags });
    return response.data;
  },

  // Remove tags from a review
  removeReviewTags: async (reviewId, tags) => {
    const response = await api.delete(`/reviews/${reviewId}/tags`, {
      data: { tags }
    });
    return response.data;
  }
};

export default reviewService;
