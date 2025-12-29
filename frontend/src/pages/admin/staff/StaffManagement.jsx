import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users, 
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  X
} from 'lucide-react';
import StaffCard from '../../../components/admin/staff/StaffCard';
import StaffForm from '../../../components/admin/staff/StaffForm';
import StaffFilters from '../../../components/admin/staff/StaffFilters';
import StaffPagination from '../../../components/admin/staff/StaffPagination';
import StaffStats from '../../../components/admin/staff/StaffStats';
import StaffExport from '../../../components/admin/staff/StaffExport';
import staffService from '../../../services/admin/staffService';
import { formatDate } from '../../../utils/date/dateUtils';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    verifiedStaff: 0,
    unverifiedStaff: 0,
    recentStaff: 0,
    performance: {
      averageRating: 0,
      totalTasks: 0
    }
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    department: '',
    hireDateFrom: '',
    hireDateTo: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffDetails, setShowStaffDetails] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, [filters, pagination.current]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await staffService.getStaffMembers(params);
      setStaff(response.data?.staff || []);
      setPagination(prev => ({
        ...prev,
        pages: response.data?.pagination?.pages || 1,
        total: response.data?.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffService.getStaffStats();
      setStats(response.data || {
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        verifiedStaff: 0,
        unverifiedStaff: 0,
        recentStaff: 0,
        performance: {
          averageRating: 0,
          totalTasks: 0
        }
      });
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      // Keep default stats on error
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowCreateForm(true);
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setShowStaffDetails(true);
  };

  const handleDeleteStaff = async (staff) => {
    if (window.confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
      try {
        await staffService.deleteStaffMember(staff._id);
        toast.success('Staff member deleted successfully');
        fetchStaff();
        fetchStats();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handleStatusChange = async (staffId, status) => {
    try {
      await staffService.updateStaffStatus(staffId, status);
      toast.success('Staff status updated successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error('Failed to update staff status');
    }
  };

  const handleStaffCreated = async (staffData) => {
    try {
      console.log('Submitting staff data:', staffData);
      
      if (selectedStaff) {
        // Update existing staff
        await staffService.updateStaffMember(selectedStaff._id, staffData);
        toast.success('Staff member updated successfully');
      } else {
        // Create new staff
        await staffService.createStaffMember(staffData);
        toast.success('Staff member created successfully');
      }
      
      setShowCreateForm(false);
      setSelectedStaff(null);
      fetchStaff();
      fetchStats();
    } catch (error) {
      console.error('Error saving staff:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || 'Failed to save staff member';
      toast.error(errorMessage);
    }
  };

  const handleExportData = async (options) => {
    try {
      const response = await staffService.exportStaffData(options);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff-data-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Staff data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export staff data');
    }
  };

  const handleImportData = async (file, options) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      await staffService.importStaffData(formData);
      toast.success('Staff data imported successfully');
      fetchStaff();
      fetchStats();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import staff data');
    }
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, current: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      role: '',
      department: '',
      hireDateFrom: '',
      hireDateTo: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchStaff();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-sm text-gray-600">Manage your staff members and their permissions</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <StaffExport 
                onExport={handleExportData}
                onImport={handleImportData}
                loading={loading}
              />
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StaffStats stats={stats} loading={loading} />

        {/* Filters */}
        <div className="mb-6">
          <StaffFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onSearch={handleSearch}
          />
        </div>

        {/* Staff List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Staff Member
              </button>
            </div>
          ) : (
            staff.map((staffMember) => (
              <StaffCard
                key={staffMember._id}
                staff={staffMember}
                onEdit={handleEditStaff}
                onDelete={handleDeleteStaff}
                onView={handleViewStaff}
                onStatusChange={handleStatusChange}
                showActions={true}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <StaffPagination 
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </div>

      {/* Create/Edit Staff Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedStaff(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <StaffForm
                staff={selectedStaff}
                onSave={handleStaffCreated}
                onCancel={() => {
                  setShowCreateForm(false);
                  setSelectedStaff(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {showStaffDetails && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Staff Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedStaff.firstName} {selectedStaff.lastName}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedStaff.email}</p>
                    {selectedStaff.phone && <p><span className="text-gray-600">Phone:</span> {selectedStaff.phone}</p>}
                    <p><span className="text-gray-600">Role:</span> {selectedStaff.role}</p>
                    <p><span className="text-gray-600">Status:</span> {selectedStaff.isActive ? 'Active' : 'Inactive'}</p>
                    <p><span className="text-gray-600">Joined:</span> {formatDate(selectedStaff.createdAt)}</p>
                  </div>
                </div>
                
                {selectedStaff.profile?.permissions && selectedStaff.profile.permissions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Permissions</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedStaff.profile.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedStaff.profile?.department && (
                  <div>
                    <h3 className="font-medium text-gray-900">Work Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="text-gray-600">Department:</span> {selectedStaff.profile.department}</p>
                      {selectedStaff.profile.position && <p><span className="text-gray-600">Position:</span> {selectedStaff.profile.position}</p>}
                      {selectedStaff.profile.hireDate && <p><span className="text-gray-600">Hire Date:</span> {formatDate(selectedStaff.profile.hireDate)}</p>}
                      {selectedStaff.profile.salary && <p><span className="text-gray-600">Salary:</span> LKR {selectedStaff.profile.salary.toLocaleString()}</p>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowStaffDetails(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowStaffDetails(false);
                    handleEditStaff(selectedStaff);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
