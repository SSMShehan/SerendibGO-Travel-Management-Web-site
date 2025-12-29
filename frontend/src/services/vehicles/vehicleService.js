import axios from 'axios';
import { API_BASE_URL } from '../../api/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Vehicle API functions
export const vehicleAPI = {
  // Get all vehicles
  getVehicles: async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  // Get my vehicles (for vehicle owner)
  getMyVehicles: async (params = {}) => {
    const response = await api.get('/vehicles/my-vehicles', { params });
    return response.data;
  },

  // Get single vehicle
  getVehicle: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  // Add new vehicle
  addVehicle: async (vehicleData) => {
    const formData = new FormData();

    // Handle nested objects and files
    Object.keys(vehicleData).forEach(key => {
      if (key === 'images' && Array.isArray(vehicleData[key])) {
        vehicleData[key].forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images[${index}]`, image);
          } else {
            formData.append(`images[${index}]`, JSON.stringify(image));
          }
        });
      } else if (key === 'documents' && typeof vehicleData[key] === 'object') {
        Object.keys(vehicleData[key]).forEach(docKey => {
          if (vehicleData[key][docKey] instanceof File) {
            formData.append(`documents.${docKey}`, vehicleData[key][docKey]);
          } else {
            formData.append(`documents.${docKey}`, vehicleData[key][docKey]);
          }
        });
      } else if (key === 'amenities' && typeof vehicleData[key] === 'object') {
        formData.append(key, JSON.stringify(vehicleData[key]));
      } else if (key === 'capacity' && typeof vehicleData[key] === 'object') {
        formData.append(key, JSON.stringify(vehicleData[key]));
      } else if (key === 'pricing' && typeof vehicleData[key] === 'object') {
        formData.append(key, JSON.stringify(vehicleData[key]));
      } else if (key === 'serviceAreas' && Array.isArray(vehicleData[key])) {
        formData.append(key, JSON.stringify(vehicleData[key]));
      } else if (key === 'availability' && typeof vehicleData[key] === 'object') {
        formData.append(key, JSON.stringify(vehicleData[key]));
      } else {
        formData.append(key, vehicleData[key]);
      }
    });

    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update vehicle
  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  },

  // Update vehicle status
  updateVehicleStatus: async (vehicleId, statusData) => {
    const response = await api.put(`/vehicles/${vehicleId}/status`, statusData);
    return response.data;
  },

  // Get vehicle availability
  getVehicleAvailability: async (vehicleId, params = {}) => {
    const response = await api.get(`/vehicles/${vehicleId}/availability`, { params });
    return response.data;
  },

  // Update vehicle availability
  updateVehicleAvailability: async (vehicleId, availabilityData) => {
    const response = await api.put(`/vehicles/${vehicleId}/availability`, availabilityData);
    return response.data;
  }
};

// Vehicle Booking API functions
export const vehicleBookingAPI = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/vehicle-bookings', bookingData);
    return response.data;
  },

  // Get my bookings (for vehicle owner)
  getMyBookings: async (params = {}) => {
    const response = await api.get('/vehicle-bookings/my-bookings', { params });
    return response.data;
  },

  // Get user bookings (for tourists)
  getUserBookings: async (params = {}) => {
    const response = await api.get('/vehicle-bookings/user', { params });
    return response.data;
  },

  // Get single booking
  getBooking: async (bookingId) => {
    const response = await api.get(`/vehicle-bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, statusData) => {
    const response = await api.put(`/vehicle-bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    const response = await api.put(`/vehicle-bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  // Get booking stats
  getBookingStats: async (params = {}) => {
    const response = await api.get('/vehicle-bookings/stats', { params });
    return response.data;
  }
};

// Vehicle Owner API functions
export const vehicleOwnerAPI = {
  // Register as vehicle owner
  register: async (ownerData) => {
    const formData = new FormData();

    Object.keys(ownerData).forEach(key => {
      if (key === 'driverLicense' || key === 'ownershipProof' || key === 'emergencyContact' || key === 'bankDetails') {
        Object.keys(ownerData[key]).forEach(subKey => {
          if (ownerData[key][subKey] instanceof File) {
            formData.append(`${key}.${subKey}`, ownerData[key][subKey]);
          } else {
            formData.append(`${key}.${subKey}`, ownerData[key][subKey]);
          }
        });
      } else {
        formData.append(key, ownerData[key]);
      }
    });

    const response = await api.post('/vehicle-owners/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get vehicle owner profile
  getProfile: async () => {
    const response = await api.get('/vehicle-owners/profile');
    return response.data;
  },

  // Update vehicle owner profile
  updateProfile: async (profileData) => {
    const response = await api.put('/vehicle-owners/profile', profileData);
    return response.data;
  },

  // Get vehicle owner stats
  getStats: async (params = {}) => {
    const response = await api.get('/vehicle-owners/stats', { params });
    return response.data;
  },

  // Get earnings
  getEarnings: async (params = {}) => {
    const response = await api.get('/vehicle-owners/earnings', { params });
    return response.data;
  }
};

// Vehicle Search API functions
export const vehicleSearchAPI = {
  // Search vehicles
  searchVehicles: async (searchParams) => {
    const response = await api.get('/vehicles/search', { params: searchParams });
    return response.data;
  },

  // Get vehicle types
  getVehicleTypes: async () => {
    const response = await api.get('/vehicles/types');
    return response.data;
  },

  // Get service areas
  getServiceAreas: async () => {
    const response = await api.get('/vehicles/service-areas');
    return response.data;
  },

  // Get vehicle amenities
  getVehicleAmenities: async () => {
    const response = await api.get('/vehicles/amenities');
    return response.data;
  }
};

// Utility functions
export const vehicleUtils = {
  // Calculate trip price
  calculateTripPrice: (vehicle, distance, duration, startDate, endDate) => {
    let totalPrice = 0;

    // Base price
    totalPrice += vehicle.pricing.basePrice;

    // Distance-based pricing
    if (vehicle.pricing.perKmRate > 0 && distance > 0) {
      totalPrice += distance * vehicle.pricing.perKmRate;
    }

    // Time-based pricing
    if (vehicle.pricing.hourlyRate > 0 && duration > 0) {
      totalPrice += duration * vehicle.pricing.hourlyRate;
    }

    // Check for seasonal rates
    const now = new Date();
    const seasonalRate = vehicle.pricing.seasonalRates?.find(rate =>
      rate.isActive &&
      now >= new Date(rate.startDate) &&
      now <= new Date(rate.endDate)
    );

    if (seasonalRate) {
      totalPrice *= seasonalRate.priceMultiplier;
    }

    return totalPrice;
  },

  // Format price
  formatPrice: (price, currency = 'LKR') => {
    return `${currency} ${price.toLocaleString()}`;
  },

  // Get vehicle status color
  getStatusColor: (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.pending;
  },

  // Get booking status color
  getBookingStatusColor: (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.pending;
  },

  // Check if vehicle is available
  isVehicleAvailable: (vehicle, startDate, endDate) => {
    if (!vehicle.availability.isAvailable || vehicle.status !== 'active') {
      return false;
    }

    // Check working hours and days
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Additional availability logic can be added here
    return true;
  },

  // Get primary image
  getPrimaryImage: (vehicle) => {
    if (!vehicle.images || vehicle.images.length === 0) {
      return '/placeholder-vehicle.jpg';
    }

    const primaryImg = vehicle.images.find(img => img.isPrimary);
    return primaryImg ? primaryImg.url : vehicle.images[0].url;
  },

  // Calculate vehicle rating
  calculateRating: (vehicle) => {
    if (!vehicle.ratings || vehicle.reviewCount === 0) return 0;

    const { overall, cleanliness, comfort, driver, value } = vehicle.ratings;
    return (overall + cleanliness + comfort + driver + value) / 5;
  },

  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format date and time
  formatDateTime: (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Default export
export default {
  vehicleAPI,
  vehicleBookingAPI,
  vehicleOwnerAPI,
  vehicleSearchAPI,
  vehicleUtils
};
