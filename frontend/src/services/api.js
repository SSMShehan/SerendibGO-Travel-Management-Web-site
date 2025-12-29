import axios from 'axios';
import { API_BASE_URL } from '../api/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL + '/api', // Use config URL and append /api
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    // Suppress console errors for expected 404 responses
    if (error.response?.status === 404) {
      // Don't log 404 errors to console as they're often expected
      // (e.g., driver profile not found, user not found, etc.)
      error.suppressConsoleError = true
    }

    return Promise.reject(error)
  }
)

export default api
