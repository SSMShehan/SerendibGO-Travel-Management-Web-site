import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/vehicles/tripService';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Navigation,
  Shield,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Activity as ActivityIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriverManagement = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    city: '',
    district: '',
    vehicleType: '',
    minRating: ''
  });
  const [stats, setStats] = useState({});
  const [availableTrips, setAvailableTrips] = useState([]);
  
  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, [filters]);
  
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const data = await driverService.getDrivers(queryParams);
      if (data.status === 'success') {
        setDrivers(data.data.drivers);
      }
      
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const data = await driverService.getDriverStats();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const fetchAvailableTrips = async () => {
    try {
      const response = await fetch('/api/trips?status=scheduled,confirmed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setAvailableTrips(data.data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };
  
  const handleStatusUpdate = async (driverId, status, reason = '') => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, reason })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(`Driver status updated to ${status}!`);
        fetchDrivers();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  const handleAssignDriver = async (tripId, notes = '') => {
    if (!selectedDriver) return;
    
    try {
      const response = await fetch(`/api/drivers/${selectedDriver._id}/assign-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tripId, notes })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Driver assigned to trip successfully!');
        setShowAssignModal(false);
        fetchDrivers();
      } else {
        toast.error(data.message || 'Failed to assign driver');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'suspended': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'inactive': return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'blacklisted': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
              <p className="text-lg text-gray-600 mt-2">
                Manage drivers and their assignments
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchDrivers}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              {user.role === 'admin' && (
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDrivers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ActivityIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onlineDrivers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
            
            <input
              type="text"
              placeholder="City"
              className="input input-bordered w-full"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            />
            
            <input
              type="text"
              placeholder="District"
              className="input input-bordered w-full"
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            />
            
            <select
              className="select select-bordered w-full"
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
            >
              <option value="">All Vehicle Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {drivers.length} drivers
            </div>
          </div>
        </div>
        
        {/* Drivers List */}
        {drivers.length > 0 ? (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {driver.user?.name || 'N/A'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                            {getStatusIcon(driver.status)}
                            <span className="ml-1">{driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            {driver.driverId}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{driver.user?.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{driver.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">
                            {driver.serviceAreas?.[0]?.city || 'N/A'}, {driver.serviceAreas?.[0]?.district || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.currentLocation?.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Car className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">
                            {driver.vehicleTypes?.map(vt => vt.vehicleType).join(', ') || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.performance?.totalTrips || 0} trips
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium flex items-center">
                            {renderStars(driver.performance?.averageRating || 0)}
                            <span className="ml-1">({driver.performance?.averageRating?.toFixed(1) || '0.0'})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.performance?.onTimePercentage || 0}% on-time
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* License Information */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        License: {driver.license?.licenseNumber || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expires: {driver.license?.expiryDate ? formatDate(driver.license.expiryDate) : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Class: {driver.license?.licenseClass || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Verification Status */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {driver.verification?.identityVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Identity Verified
                        </span>
                      )}
                      {driver.verification?.licenseVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          License Verified
                        </span>
                      )}
                      {driver.verification?.backgroundCheckPassed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Background Check Passed
                        </span>
                      )}
                      {driver.verification?.insuranceVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Insurance Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDetailsModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          fetchAvailableTrips();
                          setShowAssignModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    {user.role === 'admin' && driver.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(driver._id, 'active')}
                          className="btn btn-sm btn-success"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(driver._id, 'suspended')}
                          className="btn btn-sm btn-warning"
                        >
                          Suspend
                        </button>
                      </div>
                    )}
                    
                    {user.role === 'admin' && driver.status === 'active' && (
                      <button
                        onClick={() => handleStatusUpdate(driver._id, 'suspended')}
                        className="btn btn-sm btn-warning"
                      >
                        Suspend
                      </button>
                    )}
                    
                    {user.role === 'admin' && driver.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusUpdate(driver._id, 'active')}
                        className="btn btn-sm btn-success"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? 'No drivers match your filters'
                : 'No drivers yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all drivers.'
                : 'Driver registrations will appear here.'
              }
            </p>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ status: '', search: '', city: '', district: '', vehicleType: '', minRating: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Driver Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedDriver.user?.name}</div>
                        <div className="text-gray-500">{selectedDriver.driverId}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedDriver.user?.phone}</div>
                        <div className="text-gray-500">{selectedDriver.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          DOB: {selectedDriver.personalInfo?.dateOfBirth ? formatDate(selectedDriver.personalInfo.dateOfBirth) : 'N/A'}
                        </div>
                        <div className="text-gray-500">{selectedDriver.personalInfo?.nationality || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance & License</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium flex items-center">
                          {renderStars(selectedDriver.performance?.averageRating || 0)}
                          <span className="ml-1">({selectedDriver.performance?.averageRating?.toFixed(1) || '0.0'})</span>
                        </div>
                        <div className="text-gray-500">{selectedDriver.performance?.totalTrips || 0} trips completed</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedDriver.license?.licenseNumber || 'N/A'}</div>
                        <div className="text-gray-500">{selectedDriver.license?.licenseClass || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedDriver.performance?.onTimePercentage || 0}% on-time</div>
                        <div className="text-gray-500">
                          {formatCurrency(selectedDriver.financial?.totalEarnings || 0, selectedDriver.financial?.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Assign Driver Modal */}
        {showAssignModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Assign Driver to Trip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Trip
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Choose a trip...</option>
                    {availableTrips.map((trip) => (
                      <option key={trip._id} value={trip._id}>
                        {trip.tripReference} - {trip.stops?.[0]?.location.city} to {trip.stops?.[trip.stops.length - 1]?.location.city}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows="3"
                    placeholder="Add any special instructions..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignDriver('', '')}
                  className="btn btn-primary"
                >
                  Assign Driver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
