// Staff Vehicle Management Component
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Calendar,
  Camera,
  Save,
  X,
  Upload,
  Globe,
  Award,
  Heart,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  Target,
  Info,
  Edit3,
  Copy,
  Share,
  Archive,
  Ban,
  Unlock,
  Lock,
  EyeOff,
  Send,
  Reply,
  Phone,
  Mail,
  User,
  Building,
  Car,
  Compass,
  Navigation,
  Flag,
  Layers,
  Package,
  Tag,
  Hash,
  Percent,
  PieChart,
  LineChart,
  Monitor,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  Thermometer,
  Gauge,
  CheckSquare,
  Square,
  Car as CarIcon,
  Settings,
  Gauge as GaugeIcon,
  Plane,
  Train,
  Ship,
  Bike,
  Bus,
  Tv,
  Wind,
  Droplets,
  ChefHat,
  Shield as ShieldIcon,
  UserCheck,
  Bell,
  RefreshCw as RefreshCwIcon,
  Building2,
  Heart as HeartIcon,
  Mountain,
  Trees
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import staffService from '../../../services/staff/staffService';
import toast from 'react-hot-toast';

const VehicleManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    location: 'all',
    fuelType: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Fetch vehicles
  const fetchVehicles = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        ...filters
      };
      if (searchTerm) params.search = searchTerm;
      
      console.log('Fetching vehicles with params:', params);
      const data = await staffService.getVehicles(params);
      console.log('Vehicles data:', data);
      setVehicles(data.data.vehicles);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Fetch vehicles error:', error);
      toast.error(error.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await staffService.getVehicleStatistics();
      setStatistics(data.data);
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchVehicles();
      fetchStatistics();
    }
  }, [isAuthenticated, isLoading]);

  // Filter changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchVehicles();
    }
  }, [filters.status, filters.type, filters.location, filters.fuelType, searchTerm]);

  // Handle viewing details
  const handleViewDetails = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await staffService.deleteVehicle(vehicleId);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete vehicle error:', error);
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action) => {
    if (selectedVehicles.length === 0) {
      toast.error('Please select vehicles first');
      return;
    }

    try {
      await staffService.bulkVehicleAction(selectedVehicles, action);
      toast.success(`${action} completed successfully`);
      fetchVehicles();
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(error.message || `Failed to ${action} vehicles`);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(vehicles.map(vehicle => vehicle._id));
    }
  };

  // Handle individual select
  const handleSelectVehicle = (vehicleId) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return X;
      case 'pending': return Clock;
      case 'suspended': return Ban;
      case 'maintenance': return Settings;
      default: return AlertCircle;
    }
  };

  // Get vehicle type icon
  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'sedan': return CarIcon;
      case 'suv': return CarIcon;
      case 'van': return CarIcon;
      case 'bus': return Bus;
      case 'motorcycle': return Bike;
      case 'truck': return CarIcon;
      default: return CarIcon;
    }
  };

  // Get fuel type color
  const getFuelTypeColor = (fuelType) => {
    switch (fuelType) {
      case 'petrol': return 'text-blue-600 bg-blue-100';
      case 'diesel': return 'text-green-600 bg-green-100';
      case 'electric': return 'text-purple-600 bg-purple-100';
      case 'hybrid': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vehicle Management</h2>
          <p className="text-slate-600">Manage all vehicle rentals and transportation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchVehicles}
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
              <p className="text-sm font-medium text-slate-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-slate-900">{statistics.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Vehicles</p>
              <p className="text-2xl font-bold text-green-600">{statistics.active || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{statistics.maintenance || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Bookings</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.totalBookings || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search vehicles..."
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
                <option value="maintenance">Maintenance</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setFilters({ status: 'all', type: 'all', location: 'all', fuelType: 'all', sortBy: 'createdAt', sortOrder: 'desc' });
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

      {/* Bulk Actions */}
      {selectedVehicles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedVehicles.length} vehicle(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('maintenance')}
                className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Maintenance
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Vehicles</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                {selectedVehicles.length === vehicles.length ? (
                  <CheckSquare className="h-4 w-4 mr-1" />
                ) : (
                  <Square className="h-4 w-4 mr-1" />
                )}
                Select All
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <CarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No vehicles found</h3>
            <p className="text-slate-500">No vehicles match your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {vehicles.map((vehicle) => {
              const StatusIcon = getStatusIcon(vehicle.status);
              const VehicleTypeIcon = getVehicleTypeIcon(vehicle.type);
              return (
                <div key={vehicle._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle._id)}
                        onChange={() => handleSelectVehicle(vehicle._id)}
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VehicleTypeIcon className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{vehicle.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {vehicle.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFuelTypeColor(vehicle.fuelType)}`}>
                            {vehicle.fuelType}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 mb-3 line-clamp-2">{vehicle.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <VehicleTypeIcon className="h-4 w-4" />
                            <span>{vehicle.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{vehicle.capacity} seats</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>LKR {vehicle.pricePerDay?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{vehicle.location || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {vehicle.features?.slice(0, 4).map((feature, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {feature}
                              </span>
                            ))}
                            {vehicle.features?.length > 4 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                +{vehicle.features.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="flex items-center px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center px-3 py-1 text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedVehicle.name}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium text-gray-900">{selectedVehicle.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium text-gray-900">{selectedVehicle.capacity} passengers</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Fuel Type</p>
                          <p className="font-medium text-gray-900">{selectedVehicle.fuelType}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price per Day</p>
                          <p className="font-medium text-gray-900">LKR {selectedVehicle.pricePerDay?.toLocaleString() || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{selectedVehicle.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVehicle.features?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      )) || <span className="text-gray-400">No features specified</span>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Owner Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedVehicle.ownerName || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedVehicle.ownerPhone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Vehicle</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{selectedVehicle.name}"? This will permanently remove the vehicle and all associated data.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteVehicle(selectedVehicle._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;