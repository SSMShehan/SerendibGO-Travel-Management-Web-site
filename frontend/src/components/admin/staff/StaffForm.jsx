import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  DollarSign,
  Shield,
  X,
  Upload,
  Camera,
  Lock
} from 'lucide-react';
import { formatDate, formatDateForAPI } from '../../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const StaffForm = ({ 
  staff = null, 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    department: '',
    position: '',
    hireDate: '',
    salary: '',
    permissions: [],
    isActive: true,
    isVerified: true
  });

  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Available permissions
  const availablePermissions = [
    { id: 'hotel_management', label: 'Hotel Management', description: 'Manage hotels and bookings' },
    { id: 'user_management', label: 'User Management', description: 'Manage user accounts' },
    { id: 'content_moderation', label: 'Content Moderation', description: 'Moderate reviews and content' },
    { id: 'financial_reports', label: 'Financial Reports', description: 'Access financial data' },
    { id: 'analytics', label: 'Analytics', description: 'View platform analytics' },
    { id: 'notifications', label: 'Notifications', description: 'Send notifications' },
    { id: 'settings', label: 'Settings', description: 'Modify platform settings' },
    { id: 'staff_management', label: 'Staff Management', description: 'Manage other staff members' }
  ];

  // Available departments
  const departments = [
    { value: 'hotel_management', label: 'Hotel Management' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'content_moderation', label: 'Content Moderation' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'hr', label: 'Human Resources' }
  ];

  // Available positions
  const positions = [
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'assistant', label: 'Assistant' }
  ];

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'staff',
        department: staff.profile?.department || '',
        position: staff.profile?.position || '',
        hireDate: staff.profile?.hireDate ? formatDateForAPI(staff.profile.hireDate) : '',
        salary: staff.profile?.salary || '',
        permissions: staff.profile?.permissions || [],
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        isVerified: staff.isVerified !== undefined ? staff.isVerified : true
      });
      setSelectedPermissions(staff.profile?.permissions || []);
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
      setFormData(prev => ({
        ...prev,
        permissions: newPermissions
      }));
      
      return newPermissions;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!staff && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!staff && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = 'Salary must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        profile: {
          department: formData.department,
          position: formData.position,
          hireDate: formData.hireDate ? new Date(formData.hireDate) : null,
          salary: formData.salary ? parseFloat(formData.salary) : 0,
          permissions: selectedPermissions,
          // Add required fields for staff profile
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          maxBookingsPerDay: 3,
          advanceBookingDays: 30
        }
      };

      // Remove profile fields from main object
      delete submitData.department;
      delete submitData.position;
      delete submitData.hireDate;
      delete submitData.salary;
      delete submitData.permissions;

      onSave(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {!staff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Work Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Work Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select position</option>
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className="text-red-500 text-xs mt-1">{errors.position}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary (LKR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.salary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter salary"
                min="0"
                step="1000"
              />
            </div>
            {errors.salary && (
              <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
            )}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePermissions.map(permission => (
            <div
              key={permission.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedPermissions.includes(permission.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePermissionToggle(permission.id)}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{permission.label}</h4>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleInputChange}
              className="mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Verified</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Create Staff')}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
