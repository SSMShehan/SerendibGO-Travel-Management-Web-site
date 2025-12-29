// Staff Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import staffService from '../../services/staff/staffService';

const StaffAuthContext = createContext();

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};

export const StaffAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await staffService.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        setPermissions(response.data.permissions || []);
      } else {
        localStorage.removeItem('staffToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('staffToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await staffService.login(email, password);
      
      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('staffToken', token);
        setUser(user);
        setIsAuthenticated(true);
        setPermissions(user.permissions || []);
        setIsLoading(false); // Set loading to false after successful authentication
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await staffService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('staffToken');
      setUser(null);
      setIsAuthenticated(false);
      setPermissions([]);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check specific permissions
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await staffService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message || 'Update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await staffService.changePassword({
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error.message || 'Password change failed' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    updateProfile,
    changePassword,
    checkAuthStatus
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export default StaffAuthContext;


