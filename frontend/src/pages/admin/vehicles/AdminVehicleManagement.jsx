import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Car, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminVehicleManagement = () => {
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: '',
    search: '',
    owner: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchVehicles();
    }
  }, [user, filters, pagination.current]);
  
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/admin/vehicles?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setVehicles(data.data.vehicles);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (vehicleId, status, rejectionReason = '', adminNotes = '') => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          rejectionReason,
          adminNotes
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(`Vehicle ${status} successfully!`);
        fetchVehicles();
        setShowApprovalModal(false);
        setSelectedVehicle(null);
      } else {
        toast.error(data.message || 'Failed to update vehicle status');
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Failed to update vehicle status');
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      maintenance: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price.toLocaleString()}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-error" />
            <h3 className="mt-2 text-sm font-medium text-base-content">Error loading vehicles</h3>
            <p className="mt-1 text-sm text-base-content/70">{error}</p>
            <div className="mt-6">
              <button
                onClick={fetchVehicles}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Vehicle Management
          </h1>
          <p className="text-xl text-base-content/70">
            Review and manage vehicle registrations
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-base-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Search</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="input input-bordered w-full pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Vehicle Type</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.vehicleType}
                onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Tuk-tuk">Tuk-tuk</option>
                <option value="Bus">Bus</option>
                <option value="Minibus">Minibus</option>
                <option value="SUV">SUV</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Boat">Boat</option>
                <option value="Train">Train</option>
                <option value="Airplane">Airplane</option>
                <option value="Helicopter">Helicopter</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Actions</span>
              </label>
              <div className="flex space-x-2">
                <button className="btn btn-outline btn-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="btn btn-outline btn-sm" onClick={fetchVehicles}>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vehicles List */}
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-base-content/50" />
            <h3 className="mt-2 text-sm font-medium text-base-content">No vehicles found</h3>
            <p className="mt-1 text-sm text-base-content/70">
              {filters.status || filters.vehicleType || filters.search
                ? 'Try adjusting your filters'
                : 'No vehicles have been registered yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-base-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Car className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-base-content">
                        {vehicle.name}
                      </h3>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    
                    <p className="text-sm text-base-content/70 mb-3">
                      {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.vehicleType}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm text-base-content/70">
                        <div className="h-4 w-4 mr-2">👤</div>
                        {vehicle.capacity.passengers} passengers
                      </div>
                      <div className="flex items-center text-sm text-base-content/70">
                        <div className="h-4 w-4 mr-2">📋</div>
                        {vehicle.licensePlate}
                      </div>
                      <div className="flex items-center text-sm text-base-content/70">
                        <div className="h-4 w-4 mr-2">💰</div>
                        {formatPrice(vehicle.pricing.basePrice, vehicle.pricing.currency)}
                      </div>
                      <div className="flex items-center text-sm text-base-content/70">
                        <div className="h-4 w-4 mr-2">📅</div>
                        {formatDate(vehicle.createdAt)}
                      </div>
                    </div>
                    
                    {vehicle.owner && (
                      <div className="mt-3 text-xs text-base-content/50">
                        Owner: {vehicle.owner.firstName} {vehicle.owner.lastName} ({vehicle.owner.email})
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end">
                    <div className="flex space-x-2 mb-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowApprovalModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                      
                      {vehicle.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(vehicle._id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowApprovalModal(true);
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {vehicle.status === 'approved' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleStatusUpdate(vehicle._id, 'active')}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                      
                      {vehicle.status === 'active' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleStatusUpdate(vehicle._id, 'suspended')}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="btn-group">
              <button
                className="btn"
                disabled={pagination.current === 1}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`btn ${page === pagination.current ? 'btn-active' : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn"
                disabled={pagination.current === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Approval Modal */}
        {showApprovalModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-lg font-semibold text-base-content mb-4">
                Review Vehicle: {selectedVehicle.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                      Vehicle Type
                    </label>
                    <p className="text-sm text-base-content/70">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                      Make & Model
                    </label>
                    <p className="text-sm text-base-content/70">
                      {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                      License Plate
                    </label>
                    <p className="text-sm text-base-content/70">{selectedVehicle.licensePlate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                      Capacity
                    </label>
                    <p className="text-sm text-base-content/70">
                      {selectedVehicle.capacity.passengers} passengers
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">
                    Base Price
                  </label>
                  <p className="text-sm text-base-content/70">
                    {formatPrice(selectedVehicle.pricing.basePrice, selectedVehicle.pricing.currency)}
                  </p>
                </div>
                
                {selectedVehicle.description && (
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-1">
                      Description
                    </label>
                    <p className="text-sm text-base-content/70">{selectedVehicle.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedVehicle(null);
                  }}
                >
                  Cancel
                </button>
                
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate(selectedVehicle._id, 'approved')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                
                <button
                  className="btn btn-error"
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) {
                      handleStatusUpdate(selectedVehicle._id, 'rejected', reason);
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVehicleManagement;
