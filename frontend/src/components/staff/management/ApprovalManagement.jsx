// Staff Approval Management Component
import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Users,
  Building,
  Car,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  MoreHorizontal,
  User,
  Globe,
  Languages,
  Briefcase,
  Shield,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const ApprovalManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [approvals, setApprovals] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    dateRange: 'all',
    status: 'pending'
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalDetails, setApprovalDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch pending approvals
  const fetchApprovals = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const params = {};
      if (filters.role !== 'all') params.type = filters.role;
      if (searchTerm) params.search = searchTerm;
      
      console.log('Fetching approvals with params:', params);
      const data = await staffService.getPendingApprovals(params);
      console.log('Approvals data:', data);
      setApprovals(data.data.approvals);
    } catch (error) {
      console.error('Fetch approvals error:', error);
      toast.error(error.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await staffService.getApprovalStatistics();
      setStatistics(data.data);
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchApprovals();
      fetchStatistics();
    }
  }, [isAuthenticated, isLoading]);

  // Filter changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchApprovals();
    }
  }, [filters.role, searchTerm]);

  // Handle viewing details
  const handleViewDetails = async (approval) => {
    setSelectedApproval(approval);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const response = await staffService.getApprovalDetails(approval._id);
      if (response.success) {
        setApprovalDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching approval details:', error);
      toast.error('Failed to load approval details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle approval
  const handleApproval = async (userId, action, notes = '') => {
    try {
      let data;
      if (action === 'approve') {
        data = await staffService.approveServiceProvider(userId, notes);
      } else {
        data = await staffService.rejectServiceProvider(userId, 'Staff rejection', notes);
      }
      
      toast.success(data.message);
      fetchApprovals();
      fetchStatistics();
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(error.message || 'Action failed');
    }
  };

  // Handle bulk approval
  const handleBulkApproval = async (action) => {
    if (selectedApprovals.length === 0) {
      toast.error('Please select approvals to process');
      return;
    }

    try {
      const data = await staffService.bulkApproveServiceProviders(selectedApprovals);
      toast.success(data.message);
      setSelectedApprovals([]);
      fetchApprovals();
      fetchStatistics();
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(error.message || 'Bulk action failed');
    }
  };

  // Toggle selection
  const toggleSelection = (userId) => {
    setSelectedApprovals(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedApprovals(approvals.map(approval => approval._id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedApprovals([]);
  };

  const tabs = [
    { id: 'all', label: 'All', count: statistics.pending?.total || 0, icon: Users },
    { id: 'guides', label: 'Guides', count: statistics.pending?.guides || 0, icon: User },
    { id: 'hotels', label: 'Hotels', count: statistics.pending?.hotels || 0, icon: Building },
    { id: 'vehicles', label: 'Vehicles', count: statistics.pending?.vehicles || 0, icon: Car }
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case 'guide': return User;
      case 'hotel_owner': return Building;
      case 'driver': return Car;
      default: return Users;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'guide': return 'text-green-600 bg-green-100';
      case 'hotel_owner': return 'text-blue-600 bg-blue-100';
      case 'driver': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Approval Management</h2>
          <p className="text-slate-600">Review and approve service provider applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchApprovals}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.pending?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">{statistics.approved?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rejected Today</p>
              <p className="text-2xl font-bold text-red-600">{statistics.rejected?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approval Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.approved?.total && statistics.rejected?.total 
                  ? Math.round((statistics.approved.total / (statistics.approved.total + statistics.rejected.total)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name or email..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="guide">Guides</option>
                <option value="hotel_owner">Hotels</option>
                <option value="driver">Vehicles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setFilters({ role: 'all', dateRange: 'all', status: 'pending' });
                setSearchTerm('');
              }}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bulk Actions */}
        {selectedApprovals.length > 0 && (
          <div className="px-6 py-4 bg-blue-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700">
                  {selectedApprovals.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkApproval('approve')}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkApproval('reject')}
                  className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approvals List */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">No pending approvals</h3>
              <p className="text-slate-500">All service providers have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200">
                <button
                  onClick={selectedApprovals.length === approvals.length ? clearSelection : selectAll}
                  className="flex items-center text-sm text-slate-600 hover:text-slate-900"
                >
                  {selectedApprovals.length === approvals.length ? (
                    <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Select All
                </button>
              </div>

              {/* Approval Items */}
              {approvals.map((approval) => {
                const RoleIcon = getRoleIcon(approval.role);
                const isSelected = selectedApprovals.includes(approval._id);
                
                return (
                  <div
                    key={approval._id}
                    className={`p-6 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => toggleSelection(approval._id)}
                          className="mt-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-400" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRoleColor(approval.role)}`}>
                              <RoleIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {approval.firstName} {approval.lastName}
                              </h3>
                              <p className="text-sm text-slate-600">{approval.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(approval.role)}`}>
                              {approval.role.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {approval.phone}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(approval.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {new Date(approval.createdAt).toLocaleTimeString()}
                            </div>
                          </div>

                          {/* Additional Info Based on Role */}
                          {approval.role === 'guide' && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-slate-700">Languages: </span>
                                <span className="text-slate-600">
                                  {approval.profile?.languages?.join(', ') || 'Not specified'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700">Experience: </span>
                                <span className="text-slate-600">
                                  {approval.profile?.experience || 0} years
                                </span>
                              </div>
                            </div>
                          )}

                          {approval.role === 'hotel_owner' && (
                            <div className="mt-3 text-sm">
                              <div>
                                <span className="font-medium text-slate-700">Hotel: </span>
                                <span className="text-slate-600">
                                  {approval.profile?.hotelName || 'Not specified'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700">Location: </span>
                                <span className="text-slate-600">
                                  {approval.profile?.hotelAddress || 'Not specified'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(approval)}
                          className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleApproval(approval._id, 'approve')}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(approval._id, 'reject')}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approval Details Modal */}
      {showDetailsModal && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedApproval.role === 'hotel_owner' ? 'bg-blue-100' :
                    selectedApproval.role === 'guide' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {selectedApproval.role === 'hotel_owner' ? (
                      <Building className="h-6 w-6 text-blue-600" />
                    ) : selectedApproval.role === 'guide' ? (
                      <User className="h-6 w-6 text-green-600" />
                    ) : (
                      <Car className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedApproval.firstName} {selectedApproval.lastName}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {selectedApproval.role.replace('_', ' ')} Application
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading details...</span>
                </div>
              ) : approvalDetails ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{approvalDetails.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{approvalDetails.user.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Registered</p>
                          <p className="font-medium text-gray-900">
                            {new Date(approvalDetails.user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            approvalDetails.user.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {approvalDetails.user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                    {selectedApproval.role === 'guide' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Languages</p>
                            <div className="flex flex-wrap gap-2">
                              {approvalDetails.additionalData.languages?.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {lang}
                                </span>
                              )) || <span className="text-gray-400">Not specified</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Experience</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.experience || 0} years
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Specialties</p>
                          <div className="flex flex-wrap gap-2">
                            {approvalDetails.additionalData.specialties?.map((specialty, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {specialty}
                              </span>
                            )) || <span className="text-gray-400">Not specified</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Bio</p>
                          <p className="text-gray-900">{approvalDetails.additionalData.bio || 'No bio provided'}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Price per Day</p>
                            <p className="font-medium text-gray-900">
                              LKR {approvalDetails.additionalData.pricePerDay?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Location</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.location || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedApproval.role === 'hotel_owner' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Hotel Name</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.hotelName || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Hotel License</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.hotelLicense || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Hotel Address</p>
                          <p className="text-gray-900">
                            {approvalDetails.additionalData.hotelAddress || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedApproval.role === 'driver' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.vehicleType || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">License Number</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.licenseNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Vehicle Model</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.vehicleModel || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Capacity</p>
                            <p className="font-medium text-gray-900">
                              {approvalDetails.additionalData.vehicleCapacity || 'Not specified'} passengers
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedApproval._id, 'reject');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2 inline" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedApproval._id, 'approve');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 inline" />
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load approval details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
