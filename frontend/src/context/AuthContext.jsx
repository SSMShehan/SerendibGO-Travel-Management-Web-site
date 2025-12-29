import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          // Use localStorage user data first, then verify token
          const user = JSON.parse(userData)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token,
            },
          })
          
          // Verify token in background
          try {
            const response = await authService.getMe()
            // Update with fresh data if available
            if (response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user))
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: response.data.user,
                  token,
                },
              })
            }
          } catch (error) {
            // Token verification failed, clear auth data
            console.warn('Token verification failed, clearing auth data')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('staffToken')
            dispatch({
              type: 'AUTH_FAILURE',
              payload: 'Session expired. Please log in again.',
            })
          }
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('staffToken')
          dispatch({
            type: 'AUTH_FAILURE',
            payload: error.response?.data?.message || 'Authentication failed',
          })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(credentials)
      const { user, token } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // If user is staff, also store staff token for staff-specific features
      const staffRoles = ['staff', 'admin', 'super_admin', 'manager', 'support_staff']
      if (staffRoles.includes(user.role)) {
        localStorage.setItem('staffToken', token)
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      })
      
      toast.success(`Welcome back, ${user.firstName}!`)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.register(userData)
      const { user, token } = response.data.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      })
      
      toast.success(`Welcome to SerendibGo, ${user.firstName}!`)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('staffToken') // Also clear staff token
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user,
      })
      toast.success('Profile updated successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const updatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData)
      toast.success('Password updated successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password update failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email)
      toast.success('Password reset email sent')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email'
      toast.error(errorMessage)
      throw error
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password)
      const { user, token: newToken } = response.data.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: newToken },
      })
      
      toast.success('Password reset successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
