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

// GPS API functions
export const gpsService = {
  // Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Watch location changes
  watchLocation: (callback, errorCallback) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser.'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  },

  // Stop watching location
  stopWatchingLocation: (watchId) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  // Update trip location
  updateTripLocation: async (tripId, location) => {
    try {
      const response = await api.put(`/trips/${tripId}/location`, {
        latitude: location.latitude,
        longitude: location.longitude
      });
      return response.data;
    } catch (error) {
      console.error('Error updating trip location:', error);
      throw error;
    }
  },

  // Get trip location history
  getTripLocationHistory: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/location-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trip location history:', error);
      throw error;
    }
  },

  // Calculate distance between two points
  calculateDistance: (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  },

  // Calculate bearing between two points
  calculateBearing: (point1, point2) => {
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  },

  // Get address from coordinates (reverse geocoding)
  reverseGeocode: async (latitude, longitude) => {
    try {
      // Using a free geocoding service (you might want to use Google Maps API or similar)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  },

  // Get directions between two points
  getDirections: async (origin, destination) => {
    try {
      // This would typically use Google Maps Directions API or similar
      // For now, return a simple response
      const distance = gpsService.calculateDistance(origin, destination);
      const bearing = gpsService.calculateBearing(origin, destination);

      return {
        distance: distance,
        duration: distance * 2, // Rough estimate: 2 minutes per km
        bearing: bearing,
        route: [origin, destination] // Simplified route
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  },

  // Format coordinates for display
  formatCoordinates: (latitude, longitude, precision = 6) => {
    return {
      lat: latitude.toFixed(precision),
      lng: longitude.toFixed(precision),
      formatted: `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`
    };
  },

  // Check if location is within radius
  isWithinRadius: (center, point, radiusKm) => {
    const distance = gpsService.calculateDistance(center, point);
    return distance <= radiusKm;
  },

  // Get nearby points
  getNearbyPoints: (center, points, radiusKm) => {
    return points.filter(point =>
      gpsService.isWithinRadius(center, point, radiusKm)
    );
  }
};

export default gpsService;