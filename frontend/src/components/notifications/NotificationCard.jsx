import React, { useState } from 'react';
import { 
  Mail, 
  Bell, 
  MessageSquare, 
  Smartphone, 
  Link,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  Send,
  Copy
} from 'lucide-react';
import { 
  getNotificationLabel, 
  getPriorityLabel, 
  getChannelLabel, 
  getStatusLabel,
  getPriorityColor,
  getStatusColor,
  getChannelIcon,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS
} from '../../constants/notifications/types';
import { formatDateTime, getRelativeTime } from '../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const NotificationCard = ({ 
  notification, 
  onEdit, 
  onDelete, 
  onView, 
  onResend,
  showActions = true,
  compact = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getChannelIconComponent = (channel) => {
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
      [NOTIFICATION_STATUS.BOUNCED]: AlertCircle,
      [NOTIFICATION_STATUS.OPENED]: Eye,
      [NOTIFICATION_STATUS.CLICKED]: Eye
    };
    return icons[status] || Clock;
  };

  const handleAction = (action) => {
    switch (action) {
      case 'view':
        if (onView) onView(notification);
        break;
      case 'edit':
        if (onEdit) onEdit(notification);
        break;
      case 'delete':
        if (onDelete) onDelete(notification);
        break;
      case 'resend':
        if (onResend) onResend(notification);
        break;
      case 'copy':
        navigator.clipboard.writeText(notification.content);
        toast.success('Notification content copied to clipboard');
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  const canResend = notification.status === NOTIFICATION_STATUS.FAILED || 
                   notification.status === NOTIFICATION_STATUS.BOUNCED;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
            {React.createElement(getChannelIconComponent(notification.channel), { 
              className: "w-4 h-4" 
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getNotificationLabel(notification.type)}
            </p>
            <p className="text-xs text-gray-500">
              {getRelativeTime(notification.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
            {getStatusLabel(notification.status)}
          </span>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleAction('view')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-3" />
                      View Details
                    </button>
                    {canResend && (
                      <button
                        onClick={() => handleAction('resend')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Send className="w-4 h-4 mr-3" />
                        Resend
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('copy')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="w-4 h-4 mr-3" />
                      Copy Content
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleAction('delete')}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${getPriorityColor(notification.priority)}`}>
            {React.createElement(getChannelIconComponent(notification.channel), { 
              className: "w-6 h-6" 
            })}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {getNotificationLabel(notification.type)}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                {getPriorityLabel(notification.priority)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                {React.createElement(getStatusIcon(notification.status), { className: "w-3 h-3 mr-1" })}
                {getStatusLabel(notification.status)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium">Channel:</span>
                <span className="ml-2">{getChannelLabel(notification.channel)}</span>
                <span className="ml-2">{getChannelIcon(notification.channel)}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Recipient:</span>
                <span className="ml-2">{notification.recipient}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Subject:</span>
                <span className="ml-2">{notification.subject}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Created:</span>
                <span className="ml-2">{formatDateTime(notification.createdAt)}</span>
              </div>
              
              {notification.sentAt && (
                <div className="flex items-center">
                  <span className="font-medium">Sent:</span>
                  <span className="ml-2">{formatDateTime(notification.sentAt)}</span>
                </div>
              )}
              
              {notification.deliveredAt && (
                <div className="flex items-center">
                  <span className="font-medium">Delivered:</span>
                  <span className="ml-2">{formatDateTime(notification.deliveredAt)}</span>
                </div>
              )}
            </div>

            {/* Content Preview */}
            {notification.content && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {notification.content}
                </p>
              </div>
            )}

            {/* Error Message */}
            {notification.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Error:</span> {notification.error}
                </p>
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleAction('view')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleAction('edit')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit
                  </button>
                  {canResend && (
                    <button
                      onClick={() => handleAction('resend')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Send className="w-4 h-4 mr-3" />
                      Resend
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('copy')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Copy Content
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => handleAction('delete')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
