import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const NotificationContext = createContext()

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: true,
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
      }
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      }
    default:
      return state
  }
}

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications)
        notifications.forEach(notification => {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
        })
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(state.notifications))
  }, [state.notifications])

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification,
    }
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
    
    // Show toast notification
    if (notification.type === 'success') {
      toast.success(notification.message)
    } else if (notification.type === 'error') {
      toast.error(notification.message)
    } else if (notification.type === 'warning') {
      toast(notification.message, { icon: '⚠️' })
    } else {
      toast(notification.message)
    }
  }

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId })
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
  }

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
  }

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })
  }

  const setConnectionStatus = (isConnected) => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: isConnected })
  }

  // Helper functions for common notification types
  const notifySuccess = (message, title = 'Success') => {
    addNotification({
      type: 'success',
      title,
      message,
    })
  }

  const notifyError = (message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message,
    })
  }

  const notifyWarning = (message, title = 'Warning') => {
    addNotification({
      type: 'warning',
      title,
      message,
    })
  }

  const notifyInfo = (message, title = 'Information') => {
    addNotification({
      type: 'info',
      title,
      message,
    })
  }

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setConnectionStatus,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
