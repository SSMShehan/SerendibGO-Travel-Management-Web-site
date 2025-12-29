import React, { useState, useEffect } from 'react';
import {
  User,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Settings,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Shield,
  Ban,
  Unlock,
  Lock,
  UserCheck,
  UserX,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const DriverVehicleManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverVehicles, setDriverVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState(''); // 'driver' or 'vehicle'
  const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'
  const [approvalReason, setApprovalReason] = useState('');
  const [showVehicleReviewModal, setShowVehicleReviewModal] = useState(false);
  const [reviewingVehicle, setReviewingVehicle] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch drivers
  const fetchDrivers = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const params = {
        role: 'driver',
        ...filters
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = await staffService.getUsers(params);
      setDrivers(response.data?.users || []);
    } catch (error) {
      console.error('Fetch drivers error:', error);
      toast.error(error.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch driver vehicles
  const fetchDriverVehicles = async (driverId) => {
    try {
      const data = await staffService.getDriverVehicles(driverId);
      setDriverVehicles(data.data.vehicles || []);
    } catch (error) {
      console.error('Fetch driver vehicles error:', error);
      toast.error(error.message || 'Failed to fetch driver vehicles');
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchDrivers();
    }
  }, [isAuthenticated, isLoading]);

  // Filter changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchDrivers();
    }
  }, [filters.status, filters.verificationStatus, searchTerm]);

  // Handle driver selection
  const handleDriverSelect = async (driver) => {
    setSelectedDriver(driver);
    setShowDriverDetails(true);
    await fetchDriverVehicles(driver._id);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetails(true);
  };

  // Handle approval actions
  const handleApproval = async (type, action, itemId, reason = '') => {
    try {
      console.log('handleApproval called with:', { type, action, itemId, reason });
      
      if (type === 'driver') {
        console.log('Calling updateDriverStatus for driver:', itemId);
        await staffService.updateDriverStatus(itemId, action, reason);
        toast.success(`Driver ${action}d successfully`);
        fetchDrivers();
      } else if (type === 'vehicle') {
        console.log('Calling updateVehicleStatus for vehicle:', itemId);
        await staffService.updateVehicleStatus(itemId, action, reason);
        toast.success(`Vehicle ${action}d successfully`);
        if (selectedDriver) {
          fetchDriverVehicles(selectedDriver._id);
        }
      }
      setShowApprovalModal(false);
      setApprovalReason('');
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error.message || `Failed to ${action} ${type}`);
    }
  };

  // Open approval modal
  const openApprovalModal = (type, action, item) => {
    console.log('openApprovalModal called with:', { type, action, item });
    setApprovalType(type);
    setApprovalAction(action);
    setSelectedVehicle(item);
    setShowApprovalModal(true);
  };

  // Open vehicle review modal for detailed inspection
  const openVehicleReviewModal = (vehicle) => {
    setReviewingVehicle(vehicle);
    setShowVehicleReviewModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'approved': return CheckCircle;
      case 'inactive': return XCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      case 'suspended': return Ban;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Driver & Vehicle Management</h2>
          <p className="text-slate-600">Manage drivers and approve their vehicles</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDrivers}
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
                  placeholder="Search drivers..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="needs-approval">Needs Approval</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verification</label>
              <select
                value={filters.verificationStatus}
                onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setFilters({ status: 'all', verificationStatus: 'all', sortBy: 'createdAt', sortOrder: 'desc' });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drivers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Drivers</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading drivers...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No drivers found</h3>
              <p className="text-slate-500">No drivers match your current filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {drivers.map((driver) => {
                const StatusIcon = getStatusIcon(driver.status || 'pending');
                return (
                  <div key={driver._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {driver.avatar ? (
                            <img
                              src={driver.avatar}
                              alt={driver.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-slate-900 truncate">
                              {driver.firstName} {driver.lastName}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(driver.status || 'pending')}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {driver.status || 'pending'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{driver.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{driver.profile?.phone || driver.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Car className="h-4 w-4 flex-shrink-0" />
                              <span>{driver.vehicleCount || 0} vehicles</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Joined {new Date(driver.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDriverSelect(driver)}
                          className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        {driver.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openApprovalModal('driver', 'approve', driver)}
                              className="flex items-center px-3 py-1 text-green-600 hover:text-green-900 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => openApprovalModal('driver', 'reject', driver)}
                              className="flex items-center px-3 py-1 text-red-600 hover:text-red-900 transition-colors"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Driver Details & Vehicles */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {selectedDriver ? (
            <>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h3>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Driver Info */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-slate-900 mb-3">Driver Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedDriver.profile?.phone || selectedDriver.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDriver.status || 'pending')}`}>
                        {selectedDriver.status || 'pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-500">Joined</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedDriver.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Actions */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-slate-900 mb-3">Driver Actions</h4>
                  <div className="flex space-x-3">
                    {selectedDriver.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openApprovalModal('driver', 'approve', selectedDriver)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve Driver</span>
                        </button>
                        <button
                          onClick={() => openApprovalModal('driver', 'reject', selectedDriver)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject Driver</span>
                        </button>
                      </>
                    )}
                    {selectedDriver.status === 'active' && (
                      <button
                        onClick={() => openApprovalModal('driver', 'suspend', selectedDriver)}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Ban className="h-4 w-4" />
                        <span>Suspend Driver</span>
                      </button>
                    )}
                    {selectedDriver.status === 'suspended' && (
                      <button
                        onClick={() => openApprovalModal('driver', 'activate', selectedDriver)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Unlock className="h-4 w-4" />
                        <span>Activate Driver</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Vehicles */}
                <div>
                  <h4 className="text-md font-semibold text-slate-900 mb-3">Vehicles ({driverVehicles.length})</h4>
                  
                  {driverVehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No vehicles registered</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {driverVehicles.map((vehicle) => {
                        const VehicleStatusIcon = getStatusIcon(vehicle.status);
                        return (
                          <div key={vehicle._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                                  {vehicle.images && vehicle.images.length > 0 ? (
                                    <img
                                      src={vehicle.images[0].url || vehicle.images[0]}
                                      alt={vehicle.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Car className="h-5 w-5 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-slate-900">{vehicle.name}</h5>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                      <VehicleStatusIcon className="h-3 w-3 mr-1" />
                                      {vehicle.status}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {vehicle.make} {vehicle.model}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleVehicleSelect(vehicle)}
                                  className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 transition-colors text-sm"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </button>
                                {(vehicle.status === 'pending' || vehicle.approvalDetails?.needsApproval) && (
                                  <button
                                    onClick={() => openVehicleReviewModal(vehicle)}
                                    className="flex items-center px-2 py-1 text-purple-600 hover:text-purple-900 transition-colors text-sm"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Review
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Driver</h3>
              <p className="text-slate-500">Choose a driver from the list to view their details and vehicles</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedVehicle.name}</h3>
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Car className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium text-gray-900">{selectedVehicle.vehicleType}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium text-gray-900">
                            {selectedVehicle.capacity?.passengers || selectedVehicle.seatingCapacity} passengers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Daily Rate</p>
                          <p className="font-medium text-gray-900">
                            LKR {selectedVehicle.pricing?.dailyRate?.toLocaleString() || 'Not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">
                            {selectedVehicle.location?.city || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{selectedVehicle.description || 'No description provided'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Images</h4>
                    {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedVehicle.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url || image}
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>No images available</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Status & Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Current Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVehicle.status)}`}>
                          {selectedVehicle.status}
                        </span>
                      </div>
                      
                      {(selectedVehicle.status === 'pending' || selectedVehicle.approvalDetails?.needsApproval) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowVehicleDetails(false);
                              openApprovalModal('vehicle', 'approve', selectedVehicle);
                            }}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Vehicle
                          </button>
                          <button
                            onClick={() => {
                              setShowVehicleDetails(false);
                              openApprovalModal('vehicle', 'reject', selectedVehicle);
                            }}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Vehicle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowVehicleDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  approvalAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {approvalAction === 'approve' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {approvalAction === 'approve' ? 'Approve' : 'Reject'} {approvalType}
                  </h3>
                  <p className="text-gray-600">
                    {approvalAction === 'approve' 
                      ? `Are you sure you want to approve this ${approvalType}?`
                      : `Are you sure you want to reject this ${approvalType}?`
                    }
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason {approvalAction === 'reject' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter reason for ${approvalAction}ing this ${approvalType}...`}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalReason('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(approvalType, approvalAction, selectedVehicle._id, approvalReason)}
                  className={`px-4 py-2 text-white rounded-xl transition-colors ${
                    approvalAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} {approvalType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Review Modal */}
      {showVehicleReviewModal && reviewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Vehicle Review</h3>
                    <p className="text-gray-600">{reviewingVehicle.make} {reviewingVehicle.model} ({reviewingVehicle.year})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVehicleReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicle Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">License Plate:</span>
                        <span className="font-medium">{reviewingVehicle.licensePlate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle Type:</span>
                        <span className="font-medium">{reviewingVehicle.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Type:</span>
                        <span className="font-medium">{reviewingVehicle.fuelType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seating Capacity:</span>
                        <span className="font-medium">{reviewingVehicle.capacity?.passengers || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-medium">{reviewingVehicle.mileage || 'N/A'} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {reviewingVehicle.features && Object.entries(reviewingVehicle.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center">
                          {enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 mr-2" />
                          )}
                          <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">LKR {reviewingVehicle.pricing?.dailyRate || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly Rate:</span>
                        <span className="font-medium">LKR {reviewingVehicle.pricing?.hourlyRate || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents and Images */}
                <div className="space-y-6">
                  {/* Documents */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents</h4>
                    <div className="space-y-3">
                      {reviewingVehicle.documents && Object.entries(reviewingVehicle.documents).map(([docType, url]) => (
                        <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="font-medium capitalize">{docType}</span>
                          </div>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Document
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Not provided</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Images</h4>
                    <div className="space-y-3">
                      {console.log('Vehicle images data:', reviewingVehicle.images)}
                      {reviewingVehicle.images && reviewingVehicle.images.length > 0 ? (
                        reviewingVehicle.images.map((image, index) => {
                          // Handle both string URLs and image objects
                          const imageUrl = typeof image === 'string' ? image : image.url;
                          const imageCaption = typeof image === 'object' ? image.caption : `Vehicle image ${index + 1}`;
                          
                          return (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={imageCaption}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="hidden w-full h-48 bg-gray-100 rounded-lg items-center justify-center">
                                <div className="text-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-500 text-sm">Image not available</p>
                                </div>
                              </div>
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70"
                              >
                                View Full Size
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No images provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {reviewingVehicle.description && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{reviewingVehicle.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowVehicleReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowVehicleReviewModal(false);
                    openApprovalModal('vehicle', 'reject', reviewingVehicle);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-2 inline" />
                  Reject Vehicle
                </button>
                <button
                  onClick={() => {
                    setShowVehicleReviewModal(false);
                    openApprovalModal('vehicle', 'approve', reviewingVehicle);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Approve Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverVehicleManagement;
