import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Calendar, 
  User, 
  DollarSign, 
  MessageSquare, 
  Star, 
  Filter, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff 
} from 'lucide-react'
import { notificationService } from '../services/notificationService'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [showRead, setShowRead] = useState(true)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, unread: 0 })

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = {
        type: filter === 'all' ? undefined : filter,
        limit: 50
      }
      
      const response = await notificationService.getNotifications(params)
      
      if (response.success) {
        setNotifications(response.data.notifications)
        setStats({
          total: response.data.pagination.totalCount,
          unread: response.data.unreadCount
        })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return Calendar
      case 'payment':
        return DollarSign
      case 'review':
        return Star
      case 'message':
        return MessageSquare
      case 'system':
        return Info
      default:
        return Bell
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-600'
    if (priority === 'medium') return 'text-yellow-600'
    if (priority === 'low') return 'text-blue-600'
    
    switch (type) {
      case 'booking':
        return 'text-green-600'
      case 'payment':
        return 'text-blue-600'
      case 'review':
        return 'text-yellow-600'
      case 'message':
        return 'text-purple-600'
      case 'system':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const filteredNotifications = notifications.filter(notif => 
    showRead || !notif.isRead
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Read</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total - stats.unread}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="booking">Bookings</option>
                <option value="payment">Payments</option>
                <option value="review">Reviews</option>
                <option value="message">Messages</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRead(!showRead)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                  showRead ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {showRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{showRead ? 'Show Read' : 'Hide Read'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type)
                const iconColor = getNotificationColor(notification.type, notification.priority)
                
                return (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 ${iconColor}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
