export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  HOTEL_OWNER: 'hotel_owner',
  GUIDE: 'guide',
  DRIVER: 'driver',
  TOURIST: 'tourist'
};

export const STAFF_PERMISSIONS = {
  HOTEL_APPROVAL: 'hotel_approval',
  HOTEL_MANAGEMENT: 'hotel_management',
  BOOKING_OVERSIGHT: 'booking_oversight',
  USER_MANAGEMENT: 'user_management',
  REPORTING: 'reporting',
  PAYMENT_MANAGEMENT: 'payment_management'
};

export const ADMIN_PERMISSIONS = {
  ...STAFF_PERMISSIONS,
  STAFF_MANAGEMENT: 'staff_management',
  SYSTEM_SETTINGS: 'system_settings',
  PLATFORM_ANALYTICS: 'platform_analytics',
  FINANCIAL_OVERSIGHT: 'financial_oversight'
};

export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 5,
  [USER_ROLES.STAFF]: 4,
  [USER_ROLES.HOTEL_OWNER]: 3,
  [USER_ROLES.GUIDE]: 3,
  [USER_ROLES.DRIVER]: 3,
  [USER_ROLES.TOURIST]: 1
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.STAFF]: 'Staff Member',
  [USER_ROLES.HOTEL_OWNER]: 'Hotel Owner',
  [USER_ROLES.GUIDE]: 'Tour Guide',
  [USER_ROLES.DRIVER]: 'Driver',
  [USER_ROLES.TOURIST]: 'Tourist'
};

export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'purple',
  [USER_ROLES.STAFF]: 'blue',
  [USER_ROLES.HOTEL_OWNER]: 'green',
  [USER_ROLES.GUIDE]: 'orange',
  [USER_ROLES.DRIVER]: 'yellow',
  [USER_ROLES.TOURIST]: 'gray'
};
