import axios from 'axios';
import { API_BASE_URL } from '../../api/config';

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const vehicleSearchService = {
  // Search vehicles with filters
  searchVehicles: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const response = await api.get(`/vehicles/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  // Get vehicle details
  getVehicleDetails: async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      throw error;
    }
  },

  // Check vehicle availability
  checkAvailability: async (vehicleId, startDate, endDate, startTime, endTime) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/availability/check`, {
        params: {
          startDate,
          endDate,
          startTime,
          endTime
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },

  // Get vehicle pricing
  getVehiclePricing: async (vehicleId, pricingData) => {
    try {
      const response = await api.post(`/vehicles/${vehicleId}/pricing/calculate`, pricingData);
      return response.data;
    } catch (error) {
      console.error('Error getting vehicle pricing:', error);
      throw error;
    }
  },

  // Get popular vehicles
  getPopularVehicles: async (limit = 10) => {
    try {
      const response = await api.get(`/vehicles/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular vehicles:', error);
      throw error;
    }
  },

  // Get nearby vehicles
  getNearbyVehicles: async (latitude, longitude, radius = 50) => {
    try {
      const response = await api.get(`/vehicles/nearby`, {
        params: {
          latitude,
          longitude,
          radius
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby vehicles:', error);
      throw error;
    }
  },

  // Get vehicle reviews
  getVehicleReviews: async (vehicleId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/reviews`, {
        params: {
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle reviews:', error);
      throw error;
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get(`/vehicles/suggestions`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await api.get('/vehicles/filter-options');
      return response.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }
};

export default vehicleSearchService;
