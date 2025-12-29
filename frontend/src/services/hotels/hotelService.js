import axios from 'axios';
import { API_BASE_URL } from '../../api/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hotel API functions
export const hotelAPI = {
  // Get all hotels with filtering
  getHotels: async (params = {}) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },

  // Get single hotel by ID
  getHotel: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // Search hotels by location
  searchByLocation: async (lat, lng, radius = 10, limit = 20) => {
    const response = await api.get('/hotels/search/location', {
      params: { lat, lng, radius, limit }
    });
    return response.data;
  },

  // Create new hotel
  createHotel: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  // Update hotel
  updateHotel: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // Delete hotel
  deleteHotel: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },

  // Get my hotels (for hotel owners)
  getMyHotels: async () => {
    const response = await api.get('/hotels/owner/my-hotels');
    return response.data;
  },

  // Get hotel statistics
  getHotelStats: async (id) => {
    const response = await api.get(`/hotels/${id}/stats`);
    return response.data;
  },

  // Get pending hotels (for admins)
  getPendingHotels: async () => {
    const response = await api.get('/hotels/pending');
    return response.data;
  },

  // Approve/Reject hotel (for admins)
  approveHotel: async (id, status, rejectionReason = '') => {
    const response = await api.put(`/hotels/${id}/approve`, {
      status,
      rejectionReason
    });
    return response.data;
  }
};

// Room API functions
export const roomAPI = {
  // Get all rooms for a hotel
  getRooms: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/rooms`, { params });
    return response.data;
  },

  // Get single room by ID
  getRoom: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Get single room from hotel
  getRoomFromHotel: async (hotelId, roomId) => {
    const response = await api.get(`/hotels/${hotelId}/rooms/${roomId}`);
    return response.data;
  },

  // Create new room
  createRoom: async (hotelId, roomData) => {
    const response = await api.post(`/hotels/${hotelId}/rooms`, roomData);
    return response.data;
  },

  // Update room
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/hotels/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room
  deleteRoom: async (id) => {
    const response = await api.delete(`/hotels/rooms/${id}`);
    return response.data;
  },

  // Update room availability
  updateRoomAvailability: async (id, availabilityData) => {
    const response = await api.put(`/hotels/rooms/${id}/availability`, availabilityData);
    return response.data;
  },

  // Get room availability for date range
  getRoomAvailability: async (id, checkIn, checkOut) => {
    const response = await api.get(`/rooms/${id}/availability`, {
      params: { checkIn, checkOut }
    });
    return response.data;
  },

  // Get room pricing for date range
  getRoomPricing: async (id, checkIn, checkOut, quantity = 1) => {
    const response = await api.get(`/rooms/${id}/pricing`, {
      params: { checkIn, checkOut, quantity }
    });
    return response.data;
  },

  // Get room statistics
  getRoomStats: async (id) => {
    const response = await api.get(`/rooms/${id}/stats`);
    return response.data;
  }
};

// Booking API functions
export const bookingAPI = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/hotel-bookings', bookingData);
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/hotel-bookings/user', { params });
    return response.data;
  },

  // Get single booking by ID
  getBooking: async (id) => {
    const response = await api.get(`/hotel-bookings/${id}`);
    return response.data;
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/hotel-bookings/${id}`, bookingData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id, reason = '') => {
    const response = await api.put(`/hotel-bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Get hotel bookings (for hotel owners)
  getHotelBookings: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/bookings`, { params });
    return response.data;
  },

  // Get hotel booking stats
  getHotelBookingStats: async (hotelId, params = {}) => {
    const response = await api.get(`/hotels/${hotelId}/bookings/stats`, { params });
    return response.data;
  },

  // Get all bookings (for admin)
  getAllBookings: async (params = {}) => {
    const response = await api.get('/hotel-bookings/admin', { params });
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, statusData) => {
    const response = await api.put(`/hotel-bookings/${id}/status`, statusData);
    return response.data;
  },

  // Process check-in
  processCheckIn: async (id, roomNumber, staffName) => {
    const response = await api.put(`/hotel-bookings/${id}/checkin`, {
      roomNumber,
      staffName
    });
    return response.data;
  },

  // Process check-out
  processCheckOut: async (id, staffName) => {
    const response = await api.put(`/hotel-bookings/${id}/checkout`, {
      staffName
    });
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async (hotelId = null) => {
    const params = hotelId ? { hotelId } : {};
    const response = await api.get('/hotel-bookings/stats', { params });
    return response.data;
  }
};

// Utility functions
export const hotelUtils = {
  // Format price
  formatPrice: (price, currency = 'LKR') => {
    if (!price || price === null || price === undefined || price === 0) {
      return null; // Return null instead of "Price not available"
    }
    if (currency === 'LKR') {
      return `Rs. ${price.toLocaleString()}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  },

  // Calculate number of nights
  calculateNights: (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  },

  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format date for API
  formatDateForAPI: (date) => {
    return new Date(date).toISOString().split('T')[0];
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      'confirmed': 'green',
      'pending': 'yellow',
      'cancelled': 'red',
      'completed': 'blue',
      'no_show': 'gray'
    };
    return colors[status] || 'gray';
  },

  // Get status text
  getStatusText: (status) => {
    const texts = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
      'completed': 'Completed',
      'no_show': 'No Show'
    };
    return texts[status] || status;
  },

  // Validate date range
  validateDateRange: (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return 'Check-in date cannot be in the past';
    }

    if (end <= start) {
      return 'Check-out date must be after check-in date';
    }

    return null;
  },

  // Get amenities list
  getAmenitiesList: (amenities) => {
    const amenityList = [];
    Object.keys(amenities).forEach(key => {
      if (amenities[key] === true) {
        amenityList.push(key);
      }
    });
    return amenityList;
  },

  // Check if hotel is featured
  isFeatured: (hotel) => {
    return hotel.featured || hotel.starRating >= 4 || hotel.ratings.overall >= 4.5;
  },

  // Get hotel rating display
  getRatingDisplay: (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  },

  // Get distance from coordinates
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};

export default {
  hotelAPI,
  roomAPI,
  bookingAPI,
  hotelUtils
};
