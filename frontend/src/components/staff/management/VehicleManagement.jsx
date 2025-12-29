import React, { useState, useEffect } from 'react';
import { 
  Car, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter, 
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Star,
  AlertTriangle,
  FileText,
  Shield,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Settings
} from 'lucide-react';
import tripService from '../../../services/vehicles/tripService';
import toast from 'react-hot-toast';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    vehicleType: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, filters]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // This would be a new endpoint to get all vehicles for staff review
      const response = await tripService.vehicleService.getAllVehiclesForReview();
      if (response.status === 'success') {
        setVehicles(response.data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (filters.status) {
      filtered = filtered.filter(vehicle => vehicle.status === filters.status);
    }

    if (filters.vehicleType) {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === filters.vehicleType);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm) ||
        vehicle.model.toLowerCase().includes(searchTerm) ||
        vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
        vehicle.owner?.firstName?.toLowerCase().includes(searchTerm) ||
        vehicle.owner?.lastName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleApproveVehicle = async (vehicleId) => {
    try {
      const response = await tripService.vehicleService.updateVehicleStatus(vehicleId, 'approved');
      if (response.status === 'success') {
        toast.success('Vehicle approved successfully');
        fetchVehicles();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Failed to approve vehicle');
    }
  };

  const handleRejectVehicle = async (vehicleId, reason) => {
    try {
      const response = await tripService.vehicleService.updateVehicleStatus(vehicleId, 'rejected', reason);
      if (response.status === 'success') {
        toast.success('Vehicle rejected');
        fetchVehicles();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      toast.error('Failed to reject vehicle');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-2 text-blue-600" />
            Vehicle Management
          </h2>
          <p className="text-gray-600 mt-1">Review and approve driver vehicle registrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredVehicles.length} of {vehicles.length} vehicles
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium">Status</span>
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="select select-bordered select-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium">Vehicle Type</span>
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
              className="select select-bordered select-sm"
            >
              <option value="">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text text-sm font-medium">Search</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by make, model, license plate, or owner..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input input-bordered input-sm w-full pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Car className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.licensePlate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900">
                        {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.owner?.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="capitalize">{vehicle.vehicleType}</span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1 capitalize">{vehicle.status}</span>
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(vehicle.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowDetails(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {vehicle.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveVehicle(vehicle._id)}
                            className="btn btn-success btn-sm"
                            title="Approve"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectVehicle(vehicle._id, 'Does not meet requirements')}
                            className="btn btn-error btn-sm"
                            title="Reject"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-8">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.search || filters.vehicleType 
                ? 'Try adjusting your filters' 
                : 'No vehicles have been registered yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {showDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Vehicle Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Make:</span>
                      <span className="font-medium">{selectedVehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium">{selectedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Year:</span>
                      <span className="font-medium">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color:</span>
                      <span className="font-medium">{selectedVehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">License Plate:</span>
                      <span className="font-medium">{selectedVehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">VIN:</span>
                      <span className="font-medium">{selectedVehicle.vin}</span>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Owner Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">
                        {selectedVehicle.owner?.firstName} {selectedVehicle.owner?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedVehicle.owner?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedVehicle.owner?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Specifications */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Specifications
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{selectedVehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fuel Type:</span>
                      <span className="font-medium capitalize">{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transmission:</span>
                      <span className="font-medium capitalize">{selectedVehicle.transmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Engine Capacity:</span>
                      <span className="font-medium">{selectedVehicle.engineCapacity} CC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mileage:</span>
                      <span className="font-medium">{selectedVehicle.mileage?.toLocaleString()} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seating:</span>
                      <span className="font-medium">{selectedVehicle.capacity?.passengers} passengers</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Pricing
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Rate:</span>
                      <span className="font-medium">{formatCurrency(selectedVehicle.pricing?.baseRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Per KM Rate:</span>
                      <span className="font-medium">{formatCurrency(selectedVehicle.pricing?.perKmRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hourly Rate:</span>
                      <span className="font-medium">{formatCurrency(selectedVehicle.pricing?.hourlyRate || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Daily Rate:</span>
                      <span className="font-medium">{formatCurrency(selectedVehicle.pricing?.dailyRate || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features and Amenities */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-gray-900">Features & Amenities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Features</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.features?.map((feature, index) => (
                        <span key={index} className="badge badge-outline badge-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Amenities</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.amenities && Object.entries(selectedVehicle.amenities).map(([amenity, enabled]) => (
                        enabled && <span key={amenity} className="badge badge-secondary badge-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedVehicle.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedVehicle.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedVehicle.status === 'pending' && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleRejectVehicle(selectedVehicle._id, 'Does not meet requirements')}
                    className="btn btn-error"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveVehicle(selectedVehicle._id)}
                    className="btn btn-success"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
