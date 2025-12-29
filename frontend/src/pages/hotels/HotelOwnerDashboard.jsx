import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/hotels/HotelContext';
import { hotelUtils } from '../../services/hotels/hotelService';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HotelOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myHotels, hotelActions, bookingActions } = useHotel();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await hotelActions.getMyHotels();
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreateHotel = () => {
    navigate('/hotel-owner/register');
  };
  
  const handleViewHotel = (hotelId) => {
    navigate(`/hotel-owner/hotels/${hotelId}/edit`);
  };
  
  const handleManageRooms = (hotelId) => {
    navigate(`/hotel-owner/hotels/${hotelId}/rooms`);
  };
  
  const handleViewBookings = (hotelId) => {
    navigate(`/hotel-owner/hotels/${hotelId}/bookings`);
  };

  const handleDeleteHotel = async (hotelId, hotelName) => {
    if (window.confirm(`Are you sure you want to delete "${hotelName}"? This action cannot be undone.`)) {
      try {
        await hotelActions.deleteHotel(hotelId);
        toast.success('Hotel deleted successfully!');
        // Refresh the hotels list
        await hotelActions.getMyHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
        toast.error(error.response?.data?.message || 'Failed to delete hotel');
      }
    }
  };
  
  const getStatusBadge = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'suspended': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your hotels...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Owner Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <button
              onClick={handleCreateHotel}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Hotel
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                <p className="text-2xl font-semibold text-gray-900">{myHotels.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Hotels</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {myHotels.filter(hotel => hotel.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {myHotels.filter(hotel => hotel.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hotels List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Hotels</h2>
          </div>
          
          {myHotels.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels registered</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by registering your first hotel.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateHotel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register Hotel
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myHotels.map((hotel) => {
                // Get primary image or first image
                const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
                
                return (
                  <div key={hotel._id} className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Hotel Image */}
                      <div className="flex-shrink-0 mr-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {hotel.images && hotel.images.length > 1 && (
                          <div className="mt-1 text-xs text-gray-500 text-center">
                            +{hotel.images.length - 1} more
                          </div>
                        )}
                      </div>

                      {/* Hotel Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{hotel.name}</h3>
                          {getStatusBadge(hotel.status)}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{hotel.location.city}, {hotel.location.district}</p>
                        <p className="mt-1 text-sm text-gray-500">{hotel.category}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm text-gray-600">
                              {hotelUtils.getRatingDisplay(hotel.ratings.overall)} ({hotel.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {hotel.starRating} stars
                          </div>
                          <div className="text-sm text-gray-600">
                            {hotel.roomTypes.length} room types
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewHotel(hotel._id)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleManageRooms(hotel._id)}
                          className="text-green-600 hover:text-green-500 text-sm font-medium"
                        >
                          Manage Rooms
                        </button>
                        <button
                          onClick={() => handleViewBookings(hotel._id)}
                          className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                        >
                          Bookings
                        </button>
                        {(hotel.status === 'draft' || hotel.status === 'rejected') && (
                          <button
                            onClick={() => handleDeleteHotel(hotel._id, hotel.name)}
                            className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center space-x-1"
                            title="Delete hotel"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
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
        
        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Hotel</h3>
                <p className="text-sm text-gray-600">Register a new hotel property</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateHotel}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Register Hotel
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Rooms</h3>
                <p className="text-sm text-gray-600">Add and manage room types</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/hotel-owner/rooms')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Manage Rooms
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Track your hotel performance</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/hotel-owner/analytics')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOwnerDashboard;
