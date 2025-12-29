import api from './api';

// Review service functions
export const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a specific guide
  getGuideReviews: async (guideId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/reviews/guide/${guideId}?${queryParams.toString()}`);
    return response.data;
  },

  // Get reviews for a specific tour
  getTourReviews: async (tourId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/reviews/tour/${tourId}?${queryParams.toString()}`);
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

  // Mark review as helpful/not helpful
  markReviewHelpful: async (reviewId, helpful) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, { helpful });
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/reviews/user/${userId}?${queryParams.toString()}`);
    return response.data;
  }
};

export default reviewService;

