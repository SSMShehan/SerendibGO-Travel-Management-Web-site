import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../../utils/date/dateUtils';

const StaffCard = ({ 
  staff, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange,
  showActions = true 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      staff: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      supervisor: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        roleColors[role] || roleColors.staff
      }`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const handleStatusToggle = () => {
    const newStatus = staff.isActive ? 'inactive' : 'active';
    if (onStatusChange) {
      onStatusChange(staff._id, newStatus);
    }
    setShowMenu(false);
  };

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        if (onEdit) onEdit(staff);
        break;
      case 'delete':
        if (onDelete) onDelete(staff);
        break;
      case 'view':
        if (onView) onView(staff);
        break;
      case 'settings':
        if (onStatusChange) onStatusChange(staff._id, 'settings');
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {staff.firstName} {staff.lastName}
              </h3>
              {getStatusBadge(staff.isActive ? 'active' : 'inactive')}
              {getRoleBadge(staff.role)}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {formatDate(staff.createdAt)}</span>
              </div>
            </div>

            {/* Work Information */}
            {staff.profile?.department && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Work Info:</p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                    {staff.profile.department.replace('_', ' ')}
                  </span>
                  {staff.profile.position && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      {staff.profile.position}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Permissions */}
            {staff.profile?.permissions && staff.profile.permissions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {staff.profile.permissions.slice(0, 3).map((permission, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                  {staff.profile.permissions.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      +{staff.profile.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {staff.performance && (
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tasks Completed:</span>
                  <span className="ml-2 font-medium">{staff.performance.tasksCompleted || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="ml-2 font-medium">
                    {staff.performance.rating ? `${staff.performance.rating}/5` : 'N/A'}
                  </span>
                </div>
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
                    Edit Staff
                  </button>
                  <button
                    onClick={() => handleAction('settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Permissions
                  </button>
                  <button
                    onClick={handleStatusToggle}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                      staff.isActive ? 'text-red-700' : 'text-green-700'
                    }`}
                  >
                    {staff.isActive ? (
                      <>
                        <XCircle className="w-4 h-4 mr-3" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-3" />
                        Activate
                      </>
                    )}
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => handleAction('delete')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Staff
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

export default StaffCard;
