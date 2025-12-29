import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/vehicles/tripService';
import {
  MapPin,
  Clock,
  Users,
  Car,
  Navigation,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Square as StopIcon,
  RefreshCw,
  Filter,
  Search,
  Eye,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin as RouteIcon,
  Activity as ActivityIcon,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const TripManagement = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    fetchTrips();
    fetchStats();
  }, [filters]);
  
  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await tripService.getTrips(queryParams);
      
      const data = await response.json();
      if (data.status === 'success') {
        setTrips(data.data.trips);
      }
      
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const data = await tripService.getTripStats();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleStatusUpdate = async (tripId, status, reason = '') => {
    try {
      const data = await tripService.updateTripStatus(tripId, { status, reason });
      if (data.status === 'success') {
        toast.success(`Trip ${status} successfully!`);
        fetchTrips();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTrip) return;
    
    try {
      const data = await tripService.sendTripMessage(selectedTrip._id, newMessage);
      if (data.status === 'success') {
        toast.success('Message sent successfully!');
        setNewMessage('');
        setShowMessageModal(false);
        fetchTrips();
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Play className="w-5 h-5 text-orange-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'delayed': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'no_show': return <XCircle className="w-5 h-5 text-gray-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
              <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
              <p className="text-lg text-gray-600 mt-2">
                {user.role === 'customer' ? 'Track your trips' : 
                 user.role === 'driver' ? 'Manage your assigned trips' : 
                 'Manage all trips'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchTrips}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RouteIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDistance ? `${stats.totalDistance.toFixed(1)} km` : '0 km'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ActivityIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusCounts?.in_progress || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
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
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="delayed">Delayed</option>
              <option value="no_show">No Show</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {trips.length} trips
            </div>
          </div>
        </div>
        
        {/* Trips List */}
        {trips.length > 0 ? (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <RouteIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.tripReference}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {getStatusIcon(trip.status)}
                            <span className="ml-1">{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(trip.scheduledStartTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">
                            {trip.stops[0]?.location.city} to {trip.stops[trip.stops.length - 1]?.location.city}
                          </div>
                          <div className="text-xs text-gray-500">{trip.stops.length} stops</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatDuration(trip.estimatedDuration)}</div>
                          <div className="text-xs text-gray-500">
                            {trip.actualDuration ? `Actual: ${formatDuration(trip.actualDuration)}` : 'Estimated'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Car className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{trip.vehicle?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{trip.vehicle?.make} {trip.vehicle?.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Navigation className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatCurrency(trip.pricing.totalPrice, trip.pricing.currency)}</div>
                          <div className="text-xs text-gray-500">{trip.totalDistance}km</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Driver Information */}
                    {trip.driver && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {trip.driver.name}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {trip.driver.phone}
                        </div>
                      </div>
                    )}
                    
                    {/* Trip Progress */}
                    {trip.status === 'in_progress' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Trip Progress</span>
                          <span>{Math.round(trip.progress || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${trip.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowDetailsModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowMessageModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    {user.role === 'driver' && trip.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(trip._id, 'in_progress')}
                        className="btn btn-sm btn-success"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Trip
                      </button>
                    )}
                    
                    {user.role === 'driver' && trip.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(trip._id, 'completed')}
                        className="btn btn-sm btn-primary"
                      >
                        <StopIcon className="w-4 h-4 mr-1" />
                        Complete Trip
                      </button>
                    )}
                    
                    {(user.role === 'customer' || user.role === 'vehicle_owner') && 
                     ['scheduled', 'confirmed'].includes(trip.status) && (
                      <button
                        onClick={() => handleStatusUpdate(trip._id, 'cancelled', 'Cancelled by user')}
                        className="btn btn-sm btn-error"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <RouteIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? 'No trips match your filters'
                : 'No trips yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all trips.'
                : 'Your trips will appear here.'
              }
            </p>
            {(filters.search || filters.status) && (
              <button
                onClick={() => setFilters({ status: '', search: '' })}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        
        {/* Details Modal */}
        {showDetailsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Trip Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <RouteIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedTrip.tripReference}</div>
                        <div className="text-gray-500">{selectedTrip.tripType} - {selectedTrip.tripCategory}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Start: {formatDate(selectedTrip.scheduledStartTime)}</div>
                        <div className="text-gray-500">End: {formatDate(selectedTrip.scheduledEndTime)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedTrip.totalDistance}km</div>
                        <div className="text-gray-500">{formatDuration(selectedTrip.estimatedDuration)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Vehicle & Driver</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedTrip.vehicle?.name}</div>
                        <div className="text-gray-500">{selectedTrip.vehicle?.make} {selectedTrip.vehicle?.model}</div>
                      </div>
                    </div>
                    {selectedTrip.driver && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{selectedTrip.driver.name}</div>
                          <div className="text-gray-500">{selectedTrip.driver.phone}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatCurrency(selectedTrip.pricing.totalPrice, selectedTrip.pricing.currency)}</div>
                        <div className="text-gray-500">Base: {formatCurrency(selectedTrip.pricing.basePrice, selectedTrip.pricing.currency)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stops */}
              {selectedTrip.stops && selectedTrip.stops.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Trip Stops</h4>
                  <div className="space-y-2">
                    {selectedTrip.stops.map((stop, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{stop.location.address}</div>
                          <div className="text-sm text-gray-500">{stop.location.city}, {stop.location.district}</div>
                          {stop.timing.estimatedArrival && (
                            <div className="text-xs text-gray-400">
                              ETA: {formatDate(stop.timing.estimatedArrival)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {stop.stopType.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
        
        {/* Message Modal */}
        {showMessageModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Send Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows="4"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setNewMessage('');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="btn btn-primary"
                  disabled={!newMessage.trim()}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripManagement;
