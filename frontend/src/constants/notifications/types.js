export const NOTIFICATION_TYPES = {
  // Booking Notifications
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_MODIFIED: 'booking_modified',
  BOOKING_REMINDER: 'booking_reminder',
  BOOKING_CHECK_IN: 'booking_check_in',
  BOOKING_CHECK_OUT: 'booking_check_out',
  
  // Payment Notifications
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded',
  PAYMENT_PENDING: 'payment_pending',
  
  // Hotel Notifications
  HOTEL_APPROVED: 'hotel_approved',
  HOTEL_REJECTED: 'hotel_rejected',
  HOTEL_SUSPENDED: 'hotel_suspended',
  HOTEL_ACTIVATED: 'hotel_activated',
  
  // Review Notifications
  REVIEW_RECEIVED: 'review_received',
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  REVIEW_FLAGGED: 'review_flagged',
  
  // User Notifications
  USER_REGISTERED: 'user_registered',
  USER_VERIFIED: 'user_verified',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  
  // Staff Notifications
  STAFF_CREATED: 'staff_created',
  STAFF_UPDATED: 'staff_updated',
  STAFF_DEACTIVATED: 'staff_deactivated',
  STAFF_PERMISSIONS_CHANGED: 'staff_permissions_changed',
  
  // System Notifications
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  SECURITY_ALERT: 'security_alert',
  DATA_BACKUP: 'data_backup',
  
  // Marketing Notifications
  PROMOTION_OFFER: 'promotion_offer',
  NEWSLETTER: 'newsletter',
  SURVEY_REQUEST: 'survey_request',
  FEEDBACK_REQUEST: 'feedback_request'
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WEBHOOK: 'webhook'
};

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked'
};

export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.BOOKING_CONFIRMED]: {
    subject: 'Booking Confirmed - {{hotelName}}',
    template: 'booking-confirmed',
    priority: NOTIFICATION_PRIORITIES.HIGH,
    channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP]
  },
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: {
    subject: 'Booking Cancelled - {{hotelName}}',
    template: 'booking-cancelled',
    priority: NOTIFICATION_PRIORITIES.HIGH,
    channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP]
  },
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: {
    subject: 'Payment Successful - {{hotelName}}',
    template: 'payment-success',
    priority: NOTIFICATION_PRIORITIES.HIGH,
    channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP]
  },
  [NOTIFICATION_TYPES.HOTEL_APPROVED]: {
    subject: 'Hotel Approved - {{hotelName}}',
    template: 'hotel-approved',
    priority: NOTIFICATION_PRIORITIES.HIGH,
    channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP]
  },
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: {
    subject: 'New Review Received - {{hotelName}}',
    template: 'review-received',
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    channels: [NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP]
  }
};

export const NOTIFICATION_LABELS = {
  [NOTIFICATION_TYPES.BOOKING_CONFIRMED]: 'Booking Confirmed',
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: 'Booking Cancelled',
  [NOTIFICATION_TYPES.BOOKING_MODIFIED]: 'Booking Modified',
  [NOTIFICATION_TYPES.BOOKING_REMINDER]: 'Booking Reminder',
  [NOTIFICATION_TYPES.BOOKING_CHECK_IN]: 'Check-in Reminder',
  [NOTIFICATION_TYPES.BOOKING_CHECK_OUT]: 'Check-out Reminder',
  
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: 'Payment Successful',
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: 'Payment Failed',
  [NOTIFICATION_TYPES.PAYMENT_REFUNDED]: 'Payment Refunded',
  [NOTIFICATION_TYPES.PAYMENT_PENDING]: 'Payment Pending',
  
  [NOTIFICATION_TYPES.HOTEL_APPROVED]: 'Hotel Approved',
  [NOTIFICATION_TYPES.HOTEL_REJECTED]: 'Hotel Rejected',
  [NOTIFICATION_TYPES.HOTEL_SUSPENDED]: 'Hotel Suspended',
  [NOTIFICATION_TYPES.HOTEL_ACTIVATED]: 'Hotel Activated',
  
  [NOTIFICATION_TYPES.REVIEW_RECEIVED]: 'Review Received',
  [NOTIFICATION_TYPES.REVIEW_APPROVED]: 'Review Approved',
  [NOTIFICATION_TYPES.REVIEW_REJECTED]: 'Review Rejected',
  [NOTIFICATION_TYPES.REVIEW_FLAGGED]: 'Review Flagged',
  
  [NOTIFICATION_TYPES.USER_REGISTERED]: 'User Registered',
  [NOTIFICATION_TYPES.USER_VERIFIED]: 'User Verified',
  [NOTIFICATION_TYPES.USER_SUSPENDED]: 'User Suspended',
  [NOTIFICATION_TYPES.USER_ACTIVATED]: 'User Activated',
  
  [NOTIFICATION_TYPES.STAFF_CREATED]: 'Staff Created',
  [NOTIFICATION_TYPES.STAFF_UPDATED]: 'Staff Updated',
  [NOTIFICATION_TYPES.STAFF_DEACTIVATED]: 'Staff Deactivated',
  [NOTIFICATION_TYPES.STAFF_PERMISSIONS_CHANGED]: 'Permissions Changed',
  
  [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: 'System Maintenance',
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: 'System Update',
  [NOTIFICATION_TYPES.SECURITY_ALERT]: 'Security Alert',
  [NOTIFICATION_TYPES.DATA_BACKUP]: 'Data Backup',
  
  [NOTIFICATION_TYPES.PROMOTION_OFFER]: 'Promotion Offer',
  [NOTIFICATION_TYPES.NEWSLETTER]: 'Newsletter',
  [NOTIFICATION_TYPES.SURVEY_REQUEST]: 'Survey Request',
  [NOTIFICATION_TYPES.FEEDBACK_REQUEST]: 'Feedback Request'
};

export const PRIORITY_LABELS = {
  [NOTIFICATION_PRIORITIES.LOW]: 'Low',
  [NOTIFICATION_PRIORITIES.MEDIUM]: 'Medium',
  [NOTIFICATION_PRIORITIES.HIGH]: 'High',
  [NOTIFICATION_PRIORITIES.URGENT]: 'Urgent'
};

export const CHANNEL_LABELS = {
  [NOTIFICATION_CHANNELS.EMAIL]: 'Email',
  [NOTIFICATION_CHANNELS.SMS]: 'SMS',
  [NOTIFICATION_CHANNELS.PUSH]: 'Push Notification',
  [NOTIFICATION_CHANNELS.IN_APP]: 'In-App',
  [NOTIFICATION_CHANNELS.WEBHOOK]: 'Webhook'
};

export const STATUS_LABELS = {
  [NOTIFICATION_STATUS.PENDING]: 'Pending',
  [NOTIFICATION_STATUS.SENT]: 'Sent',
  [NOTIFICATION_STATUS.DELIVERED]: 'Delivered',
  [NOTIFICATION_STATUS.FAILED]: 'Failed',
  [NOTIFICATION_STATUS.BOUNCED]: 'Bounced',
  [NOTIFICATION_STATUS.OPENED]: 'Opened',
  [NOTIFICATION_STATUS.CLICKED]: 'Clicked'
};

export const PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITIES.LOW]: 'bg-gray-100 text-gray-800',
  [NOTIFICATION_PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-800',
  [NOTIFICATION_PRIORITIES.HIGH]: 'bg-yellow-100 text-yellow-800',
  [NOTIFICATION_PRIORITIES.URGENT]: 'bg-red-100 text-red-800'
};

export const STATUS_COLORS = {
  [NOTIFICATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [NOTIFICATION_STATUS.SENT]: 'bg-blue-100 text-blue-800',
  [NOTIFICATION_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [NOTIFICATION_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [NOTIFICATION_STATUS.BOUNCED]: 'bg-orange-100 text-orange-800',
  [NOTIFICATION_STATUS.OPENED]: 'bg-purple-100 text-purple-800',
  [NOTIFICATION_STATUS.CLICKED]: 'bg-indigo-100 text-indigo-800'
};

export const CHANNEL_ICONS = {
  [NOTIFICATION_CHANNELS.EMAIL]: '📧',
  [NOTIFICATION_CHANNELS.SMS]: '📱',
  [NOTIFICATION_CHANNELS.PUSH]: '🔔',
  [NOTIFICATION_CHANNELS.IN_APP]: '💬',
  [NOTIFICATION_CHANNELS.WEBHOOK]: '🔗'
};

export const getNotificationTemplate = (type) => {
  return NOTIFICATION_TEMPLATES[type] || {
    subject: 'Notification from SerendibGo',
    template: 'default',
    priority: NOTIFICATION_PRIORITIES.MEDIUM,
    channels: [NOTIFICATION_CHANNELS.EMAIL]
  };
};

export const getNotificationLabel = (type) => {
  return NOTIFICATION_LABELS[type] || 'Unknown Notification';
};

export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || 'Unknown';
};

export const getChannelLabel = (channel) => {
  return CHANNEL_LABELS[channel] || 'Unknown';
};

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Unknown';
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS[NOTIFICATION_PRIORITIES.MEDIUM];
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[NOTIFICATION_STATUS.PENDING];
};

export const getChannelIcon = (channel) => {
  return CHANNEL_ICONS[channel] || '📧';
};
