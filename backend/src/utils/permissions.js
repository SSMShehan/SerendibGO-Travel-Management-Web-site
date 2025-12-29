// Staff Permissions Configuration
const STAFF_PERMISSIONS = {
  super_admin: {
    modules: ['all'],
    actions: ['read', 'write', 'delete', 'approve', 'manage']
  },
  manager: {
    modules: ['users', 'bookings', 'approvals', 'support', 'analytics', 'settings', 'vehicles'],
    actions: ['read', 'write', 'approve']
  },
  support_staff: {
    modules: ['users', 'bookings', 'support', 'reviews'],
    actions: ['read', 'write']
  },
  staff: {
    modules: ['users', 'bookings', 'approvals', 'vehicles'],
    actions: ['read', 'write', 'approve']
  }
};

// Module definitions
const MODULES = {
  users: {
    name: 'User Management',
    description: 'Manage platform users and accounts',
    permissions: ['read', 'write', 'delete', 'approve']
  },
  bookings: {
    name: 'Booking Management',
    description: 'Manage reservations and bookings',
    permissions: ['read', 'write', 'delete', 'approve']
  },
  approvals: {
    name: 'Approval System',
    description: 'Approve guides, hotels, and vehicles',
    permissions: ['read', 'approve', 'reject']
  },
  support: {
    name: 'Customer Support',
    description: 'Handle support tickets and inquiries',
    permissions: ['read', 'write', 'resolve']
  },
  reviews: {
    name: 'Review Management',
    description: 'Moderate reviews and ratings',
    permissions: ['read', 'write', 'delete', 'approve']
  },
  analytics: {
    name: 'Analytics & Reports',
    description: 'View platform analytics and reports',
    permissions: ['read', 'export']
  },
  settings: {
    name: 'Platform Settings',
    description: 'Configure platform settings',
    permissions: ['read', 'write']
  },
  financial: {
    name: 'Financial Management',
    description: 'Manage payments and commissions',
    permissions: ['read', 'write', 'approve']
  },
  content: {
    name: 'Content Management',
    description: 'Manage platform content',
    permissions: ['read', 'write', 'delete', 'approve']
  },
  vehicles: {
    name: 'Vehicle Management',
    description: 'Manage vehicles and approvals',
    permissions: ['read', 'write', 'delete', 'approve']
  }
};

// Check if user has permission for specific action
const hasPermission = (userRole, module, action, userPermissions = []) => {
  // First check if user has the specific permission in their profile
  if (userPermissions && userPermissions.includes(`${module}:${action}`)) {
    return true;
  }
  
  // Fallback to role-based permissions
  const rolePermissions = STAFF_PERMISSIONS[userRole];
  
  if (!rolePermissions) return false;
  
  // Super admin has all permissions
  if (rolePermissions.modules.includes('all')) return true;
  
  // Check if module is allowed
  if (!rolePermissions.modules.includes(module)) return false;
  
  // Check if action is allowed
  return rolePermissions.actions.includes(action);
};

// Get user's accessible modules
const getUserModules = (userRole) => {
  const rolePermissions = STAFF_PERMISSIONS[userRole];
  
  if (!rolePermissions) return [];
  
  if (rolePermissions.modules.includes('all')) {
    return Object.keys(MODULES);
  }
  
  return rolePermissions.modules;
};

// Get user's allowed actions for a module
const getUserActions = (userRole, module) => {
  const rolePermissions = STAFF_PERMISSIONS[userRole];
  
  if (!rolePermissions) return [];
  
  if (rolePermissions.modules.includes('all')) {
    return MODULES[module]?.permissions || [];
  }
  
  if (!rolePermissions.modules.includes(module)) return [];
  
  return rolePermissions.actions;
};

module.exports = {
  STAFF_PERMISSIONS,
  MODULES,
  hasPermission,
  getUserModules,
  getUserActions
};


