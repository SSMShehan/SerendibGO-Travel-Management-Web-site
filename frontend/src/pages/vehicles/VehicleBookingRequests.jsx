import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Phone,
  Mail,
  Car,
  User,
  Navigation,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleBookingRequests = () => {
  const { user } = useAuth();
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    fetchBookingRequests();
  }, [filters]);
  
  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      const endpoint = user.role === 'vehicle_owner' 
        ? '/api/vehicle-bookings/requests/owner'
        : '/api/vehicle-bookings/requests/customer';
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setBookingRequests(data.data.bookingRequests);
      }
      
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (requestId, status, reason = '') => {
    try {
      const response = await fetch(`/api/vehicle-bookings/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, reason })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(`Booking request ${status} successfully!`);
        fetchBookingRequests();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  const handleCustomerResponse = async (requestId, status, message = '') => {
    try {
      const response = await fetch(`/api/vehicle-bookings/requests/${requestId}/customer-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, message })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Response recorded successfully!');
        fetchBookingRequests();
      } else {
        toast.error(data.message || 'Failed to record response');
      }
    } catch (error) {
      console.error('Error recording response:', error);
      toast.error('Failed to record response');
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;
    
    try {
      const response = await fetch(`/api/vehicle-bookings/requests/${selectedRequest._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Message sent successfully!');
        setNewMessage('');
        setShowMessageModal(false);
        fetchBookingRequests();
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
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'no_show': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
              <p className="text-lg text-gray-600 mt-2">
                {user.role === 'vehicle_owner' ? 'Manage incoming booking requests' : 'Track your booking requests'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchBookingRequests}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
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
                placeholder="Search booking requests..."
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
              <option value="confirmed">Confirmed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {bookingRequests.length} requests
            </div>
          </div>
        </div>
        
        {/* Booking Requests List */}
        {bookingRequests.length > 0 ? (
          <div className="space-y-4">
            {bookingRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.bookingReference}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{request.tripDetails.pickupLocation.city}</div>
                          <div className="text-xs text-gray-500">to {request.tripDetails.dropoffLocation.city}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatDate(request.timing.pickupDateTime)}</div>
                          <div className="text-xs text-gray-500">{request.tripDetails.estimatedDuration}h trip</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{request.passengers.totalPassengers} passengers</div>
                          <div className="text-xs text-gray-500">{request.passengers.adults}A, {request.passengers.children}C</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatCurrency(request.pricing.totalPrice, request.pricing.currency)}</div>
                          <div className="text-xs text-gray-500">{request.tripDetails.estimatedDistance}km</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {request.contactInfo.primaryContact.name}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {request.contactInfo.primaryContact.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {request.contactInfo.primaryContact.email}
                      </div>
                    </div>
                    
                    {/* Special Requirements */}
                    {request.specialRequirements && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {request.specialRequirements.accessibility?.wheelchairAccess && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Wheelchair Access
                          </span>
                        )}
                        {request.specialRequirements.comfort?.airConditioning && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Air Conditioning
                          </span>
                        )}
                        {request.specialRequirements.safety?.childSeat && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Child Seat
                          </span>
                        )}
                        {request.specialRequirements.other?.petFriendly && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Pet Friendly
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowMessageModal(true);
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    {user.role === 'vehicle_owner' && request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'accepted')}
                          className="btn btn-sm btn-success"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
                          className="btn btn-sm btn-error"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {user.role === 'customer' && request.status === 'accepted' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCustomerResponse(request._id, 'accepted')}
                          className="btn btn-sm btn-success"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCustomerResponse(request._id, 'rejected')}
                          className="btn btn-sm btn-error"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status
                ? 'No booking requests match your filters'
                : 'No booking requests yet'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status
                ? 'Try adjusting your search criteria or clear filters to see all requests.'
                : user.role === 'vehicle_owner' 
                  ? 'Booking requests from customers will appear here.'
                  : 'Your booking requests will appear here.'
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
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Booking Request Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Trip Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Pickup: {selectedRequest.tripDetails.pickupLocation.address}</div>
                        <div className="text-gray-500">{selectedRequest.tripDetails.pickupLocation.city}, {selectedRequest.tripDetails.pickupLocation.district}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Dropoff: {selectedRequest.tripDetails.dropoffLocation.address}</div>
                        <div className="text-gray-500">{selectedRequest.tripDetails.dropoffLocation.city}, {selectedRequest.tripDetails.dropoffLocation.district}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">Pickup: {formatDate(selectedRequest.timing.pickupDateTime)}</div>
                        <div className="text-gray-500">Dropoff: {formatDate(selectedRequest.timing.dropoffDateTime)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Passenger & Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRequest.passengers.totalPassengers} passengers</div>
                        <div className="text-gray-500">{selectedRequest.passengers.adults} adults, {selectedRequest.passengers.children} children</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatCurrency(selectedRequest.pricing.totalPrice, selectedRequest.pricing.currency)}</div>
                        <div className="text-gray-500">Base: {formatCurrency(selectedRequest.pricing.basePrice, selectedRequest.pricing.currency)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedRequest.tripDetails.estimatedDistance}km</div>
                        <div className="text-gray-500">{selectedRequest.tripDetails.estimatedDuration} hours</div>
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
        
        {/* Message Modal */}
        {showMessageModal && selectedRequest && (
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

export default VehicleBookingRequests;
