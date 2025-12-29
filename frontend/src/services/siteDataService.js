import api from './api'

/**
 * Service to fetch site data for AI chatbot
 */
export const siteDataService = {
  /**
   * Get featured tours for AI recommendations
   */
  async getFeaturedTours() {
    try {
      const response = await api.get('/tours?isFeatured=true&limit=5')
      return response.data.success ? response.data.data.tours : []
    } catch (error) {
      console.error('Error fetching featured tours:', error)
      return []
    }
  },

  /**
   * Get featured hotels for AI recommendations
   */
  async getFeaturedHotels() {
    try {
      const response = await api.get('/hotels?featured=true&limit=5')
      return response.data.success ? response.data.data.hotels : []
    } catch (error) {
      console.error('Error fetching featured hotels:', error)
      return []
    }
  },

  /**
   * Get featured vehicles for AI recommendations
   */
  async getFeaturedVehicles() {
    try {
      const response = await api.get('/vehicles?featured=true&limit=5')
      return response.data.success ? response.data.data.vehicles : []
    } catch (error) {
      console.error('Error fetching featured vehicles:', error)
      return []
    }
  },

  /**
   * Search tours by query
   */
  async searchTours(query) {
    try {
      const response = await api.get(`/tours?search=${encodeURIComponent(query)}&limit=3`)
      return response.data.success ? response.data.data.tours : []
    } catch (error) {
      console.error('Error searching tours:', error)
      return []
    }
  },

  /**
   * Search hotels by query
   */
  async searchHotels(query) {
    try {
      const response = await api.get(`/hotels?search=${encodeURIComponent(query)}&limit=3`)
      return response.data.success ? response.data.data.hotels : []
    } catch (error) {
      console.error('Error searching hotels:', error)
      return []
    }
  },

  /**
   * Search vehicles by query
   */
  async searchVehicles(query) {
    try {
      const response = await api.get(`/vehicles?search=${encodeURIComponent(query)}&limit=3`)
      return response.data.success ? response.data.data.vehicles : []
    } catch (error) {
      console.error('Error searching vehicles:', error)
      return []
    }
  },

  /**
   * Get user's booking history (if authenticated)
   */
  async getUserBookings() {
    try {
      const response = await api.get('/bookings/user')
      return response.data.success ? response.data.data.bookings : []
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }
  },

  /**
   * Get all site data for AI context
   */
  async getSiteData() {
    try {
      const [tours, hotels, vehicles] = await Promise.all([
        this.getFeaturedTours(),
        this.getFeaturedHotels(),
        this.getFeaturedVehicles()
      ])

      return {
        tours,
        hotels,
        vehicles,
        totalTours: tours.length,
        totalHotels: hotels.length,
        totalVehicles: vehicles.length
      }
    } catch (error) {
      console.error('Error fetching site data:', error)
      return {
        tours: [],
        hotels: [],
        vehicles: [],
        totalTours: 0,
        totalHotels: 0,
        totalVehicles: 0
      }
    }
  }
}

export default siteDataService
