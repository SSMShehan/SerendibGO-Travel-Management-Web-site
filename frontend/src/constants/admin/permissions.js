export const ADMIN_PERMISSIONS = {
  STAFF_MANAGEMENT: 'staff_management',
  SYSTEM_SETTINGS: 'system_settings',
  PLATFORM_ANALYTICS: 'platform_analytics',
  FINANCIAL_OVERSIGHT: 'financial_oversight',
  USER_MANAGEMENT: 'user_management',
  CONTENT_MODERATION: 'content_moderation',
  SECURITY_MANAGEMENT: 'security_management',
  BACKUP_MANAGEMENT: 'backup_management'
};

export const STAFF_PERMISSIONS = {
  HOTEL_APPROVAL: 'hotel_approval',
  HOTEL_MANAGEMENT: 'hotel_management',
  BOOKING_OVERSIGHT: 'booking_oversight',
  USER_MANAGEMENT: 'user_management',
  REPORTING: 'reporting',
  PAYMENT_MANAGEMENT: 'payment_management',
  REVIEW_MODERATION: 'review_moderation',
  CUSTOMER_SUPPORT: 'customer_support'
};

export const PERMISSION_LABELS = {
  [ADMIN_PERMISSIONS.STAFF_MANAGEMENT]: 'Staff Management',
  [ADMIN_PERMISSIONS.SYSTEM_SETTINGS]: 'System Settings',
  [ADMIN_PERMISSIONS.PLATFORM_ANALYTICS]: 'Platform Analytics',
  [ADMIN_PERMISSIONS.FINANCIAL_OVERSIGHT]: 'Financial Oversight',
  [ADMIN_PERMISSIONS.USER_MANAGEMENT]: 'User Management',
  [ADMIN_PERMISSIONS.CONTENT_MODERATION]: 'Content Moderation',
  [ADMIN_PERMISSIONS.SECURITY_MANAGEMENT]: 'Security Management',
  [ADMIN_PERMISSIONS.BACKUP_MANAGEMENT]: 'Backup Management',
  
  [STAFF_PERMISSIONS.HOTEL_APPROVAL]: 'Hotel Approval',
  [STAFF_PERMISSIONS.HOTEL_MANAGEMENT]: 'Hotel Management',
  [STAFF_PERMISSIONS.BOOKING_OVERSIGHT]: 'Booking Oversight',
  [STAFF_PERMISSIONS.USER_MANAGEMENT]: 'User Management',
  [STAFF_PERMISSIONS.REPORTING]: 'Reporting',
  [STAFF_PERMISSIONS.PAYMENT_MANAGEMENT]: 'Payment Management',
  [STAFF_PERMISSIONS.REVIEW_MODERATION]: 'Review Moderation',
  [STAFF_PERMISSIONS.CUSTOMER_SUPPORT]: 'Customer Support'
};

export const PERMISSION_DESCRIPTIONS = {
  [ADMIN_PERMISSIONS.STAFF_MANAGEMENT]: 'Create, edit, and manage staff accounts and permissions',
  [ADMIN_PERMISSIONS.SYSTEM_SETTINGS]: 'Configure system-wide settings and parameters',
  [ADMIN_PERMISSIONS.PLATFORM_ANALYTICS]: 'View comprehensive platform analytics and reports',
  [ADMIN_PERMISSIONS.FINANCIAL_OVERSIGHT]: 'Monitor financial transactions and platform revenue',
  [ADMIN_PERMISSIONS.USER_MANAGEMENT]: 'Manage all user accounts and roles',
  [ADMIN_PERMISSIONS.CONTENT_MODERATION]: 'Moderate all platform content and reviews',
  [ADMIN_PERMISSIONS.SECURITY_MANAGEMENT]: 'Manage security settings and access controls',
  [ADMIN_PERMISSIONS.BACKUP_MANAGEMENT]: 'Manage system backups and data recovery',
  
  [STAFF_PERMISSIONS.HOTEL_APPROVAL]: 'Approve or reject hotel registration requests',
  [STAFF_PERMISSIONS.HOTEL_MANAGEMENT]: 'Manage hotel listings and information',
  [STAFF_PERMISSIONS.BOOKING_OVERSIGHT]: 'Monitor and manage booking operations',
  [STAFF_PERMISSIONS.USER_MANAGEMENT]: 'Manage user accounts and support requests',
  [STAFF_PERMISSIONS.REPORTING]: 'Generate and view operational reports',
  [STAFF_PERMISSIONS.PAYMENT_MANAGEMENT]: 'Handle payment issues and refunds',
  [STAFF_PERMISSIONS.REVIEW_MODERATION]: 'Moderate hotel reviews and ratings',
  [STAFF_PERMISSIONS.CUSTOMER_SUPPORT]: 'Provide customer support and assistance'
};

export const PERMISSION_CATEGORIES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  SYSTEM: 'system',
  USER: 'user',
  CONTENT: 'content',
  FINANCIAL: 'financial'
};

export const PERMISSION_CATEGORY_LABELS = {
  [PERMISSION_CATEGORIES.ADMIN]: 'Administration',
  [PERMISSION_CATEGORIES.STAFF]: 'Staff Management',
  [PERMISSION_CATEGORIES.SYSTEM]: 'System',
  [PERMISSION_CATEGORIES.USER]: 'User Management',
  [PERMISSION_CATEGORIES.CONTENT]: 'Content',
  [PERMISSION_CATEGORIES.FINANCIAL]: 'Financial'
};

export const getPermissionsByCategory = (category) => {
  const categoryPermissions = {
    [PERMISSION_CATEGORIES.ADMIN]: [
      ADMIN_PERMISSIONS.STAFF_MANAGEMENT,
      ADMIN_PERMISSIONS.SYSTEM_SETTINGS,
      ADMIN_PERMISSIONS.SECURITY_MANAGEMENT,
      ADMIN_PERMISSIONS.BACKUP_MANAGEMENT
    ],
    [PERMISSION_CATEGORIES.STAFF]: [
      STAFF_PERMISSIONS.HOTEL_APPROVAL,
      STAFF_PERMISSIONS.HOTEL_MANAGEMENT,
      STAFF_PERMISSIONS.BOOKING_OVERSIGHT,
      STAFF_PERMISSIONS.CUSTOMER_SUPPORT
    ],
    [PERMISSION_CATEGORIES.USER]: [
      ADMIN_PERMISSIONS.USER_MANAGEMENT,
      STAFF_PERMISSIONS.USER_MANAGEMENT
    ],
    [PERMISSION_CATEGORIES.CONTENT]: [
      ADMIN_PERMISSIONS.CONTENT_MODERATION,
      STAFF_PERMISSIONS.REVIEW_MODERATION
    ],
    [PERMISSION_CATEGORIES.FINANCIAL]: [
      ADMIN_PERMISSIONS.FINANCIAL_OVERSIGHT,
      STAFF_PERMISSIONS.PAYMENT_MANAGEMENT
    ],
    [PERMISSION_CATEGORIES.SYSTEM]: [
      ADMIN_PERMISSIONS.PLATFORM_ANALYTICS,
      STAFF_PERMISSIONS.REPORTING
    ]
  };
  
  return categoryPermissions[category] || [];
};

export const getPermissionCategory = (permission) => {
  for (const [category, permissions] of Object.entries(getPermissionsByCategory)) {
    if (permissions.includes(permission)) {
      return category;
    }
  }
  return PERMISSION_CATEGORIES.SYSTEM;
};
