import api from '../api';

const roomAvailabilityService = {
  // Get room availability for date range (for users)
  getRoomAvailability: async (roomId, params = {}) => {
    const response = await api.get(`/room-availability/${roomId}`, { params });
    return response.data;
  },

  // Get room availability for booking (simplified for users)
  getRoomAvailabilityForBooking: async (roomId, checkIn, checkOut) => {
    try {
      const response = await api.get(`/room-availability/${roomId}`, {
        params: {
          startDate: checkIn,
          endDate: checkOut
        }
      });
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        // Fix the logic: room is only available if isAvailable is true AND there are available rooms
        const isActuallyAvailable = data.isAvailable && data.totalAvailableRooms > 0;
        
        return {
          isAvailable: isActuallyAvailable,
          totalAvailableRooms: data.totalAvailableRooms,
          details: data.details,
          message: isActuallyAvailable ? 
            `Room is available for selected dates (${data.totalAvailableRooms} rooms available)` : 
            data.totalAvailableRooms === 0 ? 
              'No rooms available for selected dates' :
              'Room is not available for selected dates'
        };
      } else {
        return {
          isAvailable: false,
          totalAvailableRooms: 0,
          details: [],
          message: response.data.message || 'Unable to check availability'
        };
      }
    } catch (error) {
      console.error('Error checking room availability:', error);
      // Fallback: allow booking with warning when API fails
      return {
        isAvailable: true, // Allow booking when API fails
        totalAvailableRooms: 1,
        details: [],
        message: 'Availability check failed, but booking can proceed. Please contact hotel directly if needed.',
        warning: true // Flag to show warning
      };
    }
  },

  // Get availability calendar for a room
  getAvailabilityCalendar: async (roomId, params = {}) => {
    const response = await api.get(`/hotels/rooms/${roomId}/availability/calendar`, { params });
    return response.data;
  },

  // Update room availability for specific date
  updateRoomAvailability: async (roomId, date, availabilityData) => {
    const response = await api.put(`/hotels/rooms/${roomId}/availability/${date}`, availabilityData);
    return response.data;
  },

  // Bulk update room availability
  bulkUpdateAvailability: async (roomId, bulkData) => {
    const response = await api.put(`/hotels/rooms/${roomId}/availability/bulk`, bulkData);
    return response.data;
  },

  // Add offline booking
  addOfflineBooking: async (roomId, bookingData) => {
    const response = await api.post(`/hotels/rooms/${roomId}/availability/offline-booking`, bookingData);
    return response.data;
  },

  // Schedule maintenance
  scheduleMaintenance: async (roomId, maintenanceData) => {
    const response = await api.post(`/hotels/rooms/${roomId}/availability/maintenance`, maintenanceData);
    return response.data;
  },

  // Get availability conflicts
  getAvailabilityConflicts: async (roomId, params = {}) => {
    const response = await api.get(`/hotels/rooms/${roomId}/availability/conflicts`, { params });
    return response.data;
  }
};

export default roomAvailabilityService;
