import api from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData)
    return response
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password })
    return response
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`)
    return response
  },

  // Resend verification email
  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification')
    return response
  },
}
