import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Mail, 
  Smartphone,
  MessageSquare,
  Link,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import NotificationCard from '../../components/notifications/NotificationCard';
import notificationService from '../../services/notifications/notificationService';
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_CHANNELS, 
  NOTIFICATION_STATUS, 
  NOTIFICATION_PRIORITIES,
  getNotificationLabel,
  getChannelLabel,
  getStatusLabel,
  getPriorityLabel
} from '../../constants/notifications/types';
import { formatDateTime } from '../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    channel: '',
    status: '',
    priority: '',
    dateRange: '30d'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleEditNotification = (notification) => {
    setSelectedNotification(notification);
    setShowCreateForm(true);
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
  };

  const handleDeleteNotification = async (notification) => {
    if (window.confirm(`Are you sure you want to delete this notification?`)) {
      try {
        await notificationService.deleteNotification(notification._id);
        toast.success('Notification deleted successfully');
        fetchNotifications();
        fetchStats();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  const handleResendNotification = async (notification) => {
    try {
      await notificationService.retryNotification(notification._id);
      toast.success('Notification resent successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error('Failed to resend notification');
    }
  };

  const handleNotificationCreated = () => {
    setShowCreateForm(false);
    setSelectedNotification(null);
    fetchNotifications();
    fetchStats();
  };

  const handleExportData = async () => {
    try {
      const response = await notificationService.exportNotifications();
      
      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Notifications exported successfully');
    } catch (error) {
      console.error('Error exporting notifications:', error);
      toast.error('Failed to export notifications');
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    fetchStats();
  };

  const getChannelIcon = (channel) => {
    const icons = {
      [NOTIFICATION_CHANNELS.EMAIL]: Mail,
      [NOTIFICATION_CHANNELS.SMS]: Smartphone,
      [NOTIFICATION_CHANNELS.PUSH]: Bell,
      [NOTIFICATION_CHANNELS.IN_APP]: MessageSquare,
      [NOTIFICATION_CHANNELS.WEBHOOK]: Link
    };
    return icons[channel] || Mail;
  };

  const getStatusIcon = (status) => {
    const icons = {
      [NOTIFICATION_STATUS.PENDING]: Clock,
      [NOTIFICATION_STATUS.SENT]: CheckCircle,
      [NOTIFICATION_STATUS.DELIVERED]: CheckCircle,
      [NOTIFICATION_STATUS.FAILED]: XCircle,
      [NOTIFICATION_STATUS.BOUNCED]: AlertCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
              <p className="text-sm text-gray-600">Manage email notifications and communication</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(NOTIFICATION_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getNotificationLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={filters.channel}
                onChange={(e) => handleFilterChange('channel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Channels</option>
                {Object.values(NOTIFICATION_CHANNELS).map(channel => (
                  <option key={channel} value={channel}>
                    {getChannelLabel(channel)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.values(NOTIFICATION_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.values(NOTIFICATION_PRIORITIES).map(priority => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 mb-4">Get started by sending your first notification.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Notification
              </button>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onEdit={handleEditNotification}
                onDelete={handleDeleteNotification}
                onView={handleViewNotification}
                onResend={handleResendNotification}
                showActions={true}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Notification Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedNotification ? 'Edit Notification' : 'Send New Notification'}
              </h2>
              {/* Notification form would go here */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotificationCreated}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedNotification ? 'Update' : 'Send'} Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showNotificationDetails && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-600">Type:</span> {getNotificationLabel(selectedNotification.type)}</p>
                    <p><span className="text-gray-600">Channel:</span> {getChannelLabel(selectedNotification.channel)}</p>
                    <p><span className="text-gray-600">Status:</span> {getStatusLabel(selectedNotification.status)}</p>
                    <p><span className="text-gray-600">Priority:</span> {getPriorityLabel(selectedNotification.priority)}</p>
                    <p><span className="text-gray-600">Recipient:</span> {selectedNotification.recipient}</p>
                    <p><span className="text-gray-600">Subject:</span> {selectedNotification.subject}</p>
                    <p><span className="text-gray-600">Created:</span> {formatDateTime(selectedNotification.createdAt)}</p>
                  </div>
                </div>
                
                {selectedNotification.content && (
                  <div>
                    <h3 className="font-medium text-gray-900">Content</h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedNotification.content}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedNotification.error && (
                  <div>
                    <h3 className="font-medium text-gray-900">Error Details</h3>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{selectedNotification.error}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNotificationDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowNotificationDetails(false);
                    handleEditNotification(selectedNotification);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;
