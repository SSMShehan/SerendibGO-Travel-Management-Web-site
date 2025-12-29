import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicle } from '../../context/vehicles/VehicleContext';
import { vehicleAPI, vehicleBookingAPI } from '../../services/vehicles/vehicleService';
import { 
  Car, 
  Plus, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  BarChart3,
  FileText,
  MapPin,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Navigation,
  Target as TargetIcon,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myVehicles, vehicleActions } = useVehicle();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: '',
    search: ''
  });
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    pendingVehicles: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    responseRate: 0,
    completionRate: 0
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles
      const vehiclesData = await vehicleAPI.getMyVehicles();
      
      if (vehiclesData.status === 'success') {
        setVehicles(vehiclesData.data.vehicles);
      }
      
      // Fetch bookings
      const bookingsData = await vehicleBookingAPI.getMyBookings();
      
      if (bookingsData.status === 'success') {
        setBookings(bookingsData.data.bookings);
      }
      
      // Calculate stats
      const totalVehicles = vehiclesData.data?.vehicles?.length || 0;
      const activeVehicles = vehiclesData.data?.vehicles?.filter(v => v.status === 'active').length || 0;
      const totalBookings = bookingsData.data?.bookings?.length || 0;
      const confirmedBookings = bookingsData.data?.bookings?.filter(b => b.status === 'confirmed').length || 0;
      const completedBookings = bookingsData.data?.bookings?.filter(b => b.status === 'completed').length || 0;
      
      setStats({
        totalVehicles,
        activeVehicles,
        totalBookings,
        confirmedBookings,
        completedBookings,
        totalEarnings: 0, // Will be calculated from bookings
        monthlyEarnings: 0, // Will be calculated from bookings
        averageRating: 0 // Will be calculated from vehicle ratings
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddVehicle = () => {
    navigate('/vehicle-owner/add-vehicle');
  };
  
  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicle-owner/vehicles/${vehicleId}`);
  };
  
  const handleManageBookings = (vehicleId) => {
    navigate(`/vehicle-owner/vehicles/${vehicleId}/bookings`);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed!');
  };
  
  const handleExportData = () => {
    // Export functionality placeholder
    toast.success('Data export started!');
  };
  
  const getFilteredVehicles = () => {
    let filtered = myVehicles || [];
    
    if (filters.status) {
      filtered = filtered.filter(vehicle => vehicle.status === filters.status);
    }
    
    if (filters.vehicleType) {
      filtered = filtered.filter(vehicle => vehicle.type === filters.vehicleType);
    }
    
    if (filters.search) {
      filtered = filtered.filter(vehicle => 
        vehicle.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'vehicles', name: 'My Vehicles', icon: Car },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'requests', name: 'Booking Requests', icon: MessageSquare },
    { id: 'earnings', name: 'Earnings', icon: DollarSign },
    { id: 'profile', name: 'Profile', icon: Settings }
  ];
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Vehicles */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Vehicles</p>
              <p className="text-3xl font-bold">{stats.totalVehicles}</p>
              <p className="text-blue-200 text-xs mt-1">
                {stats.activeVehicles} active
              </p>
            </div>
            <Car className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        {/* Total Bookings */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
              <p className="text-green-200 text-xs mt-1">
                {stats.confirmedBookings} confirmed
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        {/* Total Earnings */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
              <p className="text-purple-200 text-xs mt-1">
                {formatCurrency(stats.monthlyEarnings)} this month
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        {/* Average Rating */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Average Rating</p>
              <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
              <p className="text-yellow-200 text-xs mt-1">
                {stats.totalReviews} reviews
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TargetIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.responseRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-semibold text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Booking #{booking.bookingReference}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      LKR {booking.totalPrice?.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Your booking activity will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderVehicles = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your vehicle fleet and track performance
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleAddVehicle}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="maintenance">Maintenance</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            {getFilteredVehicles().length} of {myVehicles?.length || 0} vehicles
          </div>
        </div>
      </div>
      
      {getFilteredVehicles().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredVehicles().map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={vehicle.images?.[0]?.url || '/placeholder-vehicle.jpg'}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{vehicle.name}</h4>
                  {getStatusBadge(vehicle.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </p>
                
                <p className="text-sm text-gray-600 mb-4">
                  {vehicle.type} • {vehicle.capacity.passengers} passengers
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vehicle.serviceAreas?.[0]?.city || 'Not specified'}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(vehicle.pricing.basePrice, vehicle.pricing.currency)}
                  </div>
                </div>
                
                {/* Vehicle Features */}
                {vehicle.features && Object.values(vehicle.features).some(feature => feature) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(vehicle.features)
                        .filter(([_, available]) => available)
                        .slice(0, 3)
                        .map(([feature, _], index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                      {Object.values(vehicle.features).filter(feature => feature).length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{Object.values(vehicle.features).filter(feature => feature).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewVehicle(vehicle._id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/vehicle-owner/vehicles/${vehicle._id}/availability`)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 flex items-center justify-center"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Availability
                  </button>
                  <button
                    onClick={() => navigate(`/vehicle-owner/vehicles/${vehicle._id}/pricing`)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 flex items-center justify-center"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Pricing
                  </button>
                  <button
                    onClick={() => navigate(`/vehicle-owner/vehicles/${vehicle._id}/integrations`)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 flex items-center justify-center"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Integrations
                  </button>
                  <button
                    onClick={() => handleViewVehicle(vehicle._id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id, vehicle.name)}
                    className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filters.search || filters.status || filters.vehicleType 
              ? 'No vehicles match your filters' 
              : 'No vehicles yet'
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status || filters.vehicleType 
              ? 'Try adjusting your search criteria or clear filters to see all vehicles.' 
              : 'Get started by adding your first vehicle.'
            }
          </p>
          {(filters.search || filters.status || filters.vehicleType) && (
            <button
              onClick={() => setFilters({ status: '', vehicleType: '', search: '' })}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
          {!filters.search && !filters.status && !filters.vehicleType && (
            <button
              onClick={handleAddVehicle}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </button>
          )}
        </div>
      )}
    </div>
  );
  
  const renderBookings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
      
      {bookings.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.bookingReference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.vehicle?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        LKR {booking.totalPrice?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-gray-500">Your vehicle bookings will appear here.</p>
        </div>
      )}
    </div>
  );
  
  const renderBookingRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Booking Requests</h3>
        <Link
          to="/vehicle-owner/booking-requests"
          className="btn btn-primary btn-sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View All Requests
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No booking requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Booking requests from customers will appear here.
          </p>
          <div className="mt-6">
            <Link
              to="/vehicle-owner/booking-requests"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View All Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderEarnings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">LKR {stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">LKR {stats.monthlyEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Trips</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedBookings}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Earnings Chart</h4>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Earnings chart will be implemented here</p>
        </div>
      </div>
    </div>
  );
  
  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={user?.firstName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={user?.lastName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={user?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'vehicles':
        return renderVehicles();
      case 'bookings':
        return renderBookings();
      case 'requests':
        return renderBookingRequests();
      case 'earnings':
        return renderEarnings();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Owner Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your vehicles and track your earnings</p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default VehicleOwnerDashboard;
