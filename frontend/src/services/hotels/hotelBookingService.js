import api from '../api';

const hotelBookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/hotel-bookings', bookingData);
    return response.data;
  },

  // Get all bookings for a specific hotel
  getHotelBookings: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/bookings`, { params });
    return response.data;
  },

  // Get booking statistics for hotel
  getHotelBookingStats: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/bookings/stats`, { params });
    return response.data;
  },

  // Get all bookings for current user
  getUserBookings: async (params = {}) => {
    const response = await api.get('/hotel-bookings/user', { params });
    return response.data;
  },

  // Get single booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/hotel-bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, statusData) => {
    const response = await api.put(`/hotel-bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, cancellationReason) => {
    const response = await api.put(`/hotel-bookings/${bookingId}/cancel`, {
      cancellationReason
    });
    return response.data;
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    const response = await api.delete(`/hotel-bookings/${bookingId}`);
    return response.data;
  }
};

export default hotelBookingService;
