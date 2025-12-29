import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Bed, 
  Save, 
  RefreshCw,
  Settings,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';
import AvailabilityCalendar from '../../../components/hotels/calendar/AvailabilityCalendar';
import { roomAPI, hotelAPI } from '../../../services/hotels/hotelService';
import { hotelUtils } from '../../../services/hotels/hotelService';
import toast from 'react-hot-toast';

const RoomAvailability = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilityData, setAvailabilityData] = useState({});
  const [pricingData, setPricingData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    startDate: '',
    endDate: '',
    status: 'available',
    price: ''
  });

  useEffect(() => {
    fetchRoomData();
    fetchAvailabilityData();
    fetchBookings();
  }, [hotelId, roomId, currentMonth]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      
      // Fetch room details
      const roomResponse = await roomAPI.getRoom(roomId);
      setRoom(roomResponse.data.room);
      
      // Fetch hotel details
      const hotelResponse = await hotelAPI.getHotel(hotelId);
      setHotel(hotelResponse.data.hotel);
    } catch (error) {
      console.error('Error fetching room data:', error);
      toast.error('Failed to load room information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityData = async () => {
    try {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await roomAPI.getRoomAvailability(
        roomId,
        hotelUtils.formatDateForAPI(monthStart),
        hotelUtils.formatDateForAPI(monthEnd)
      );
      
      setAvailabilityData(response.data.availability || {});
      setPricingData(response.data.pricing || {});
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast.error('Failed to load availability data');
    }
  };

  const fetchBookings = async () => {
    try {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await roomAPI.getRoomBookings(roomId, {
        startDate: hotelUtils.formatDateForAPI(monthStart),
        endDate: hotelUtils.formatDateForAPI(monthEnd)
      });
      
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  const handleAvailabilityUpdate = async (date, status) => {
    try {
      const dateStr = hotelUtils.formatDateForAPI(date);
      const newAvailabilityData = { ...availabilityData, [dateStr]: status };
      setAvailabilityData(newAvailabilityData);
      
      await roomAPI.updateRoomAvailability(roomId, {
        date: dateStr,
        available: status
      });
      
      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handlePricingUpdate = async (date, price) => {
    try {
      const dateStr = hotelUtils.formatDateForAPI(date);
      const newPricingData = { ...pricingData, [dateStr]: price };
      setPricingData(newPricingData);
      
      await roomAPI.updateRoomPricing(roomId, {
        date: dateStr,
        price: price
      });
      
      toast.success('Pricing updated successfully');
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setSaving(true);
      
      const startDate = new Date(bulkUpdateData.startDate);
      const endDate = new Date(bulkUpdateData.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      const updates = [];
      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = hotelUtils.formatDateForAPI(date);
        
        updates.push({
          date: dateStr,
          available: bulkUpdateData.status === 'available',
          price: bulkUpdateData.price ? parseInt(bulkUpdateData.price) : undefined
        });
      }
      
      await roomAPI.bulkUpdateRoomAvailability(roomId, { updates });
      
      // Refresh data
      await fetchAvailabilityData();
      
      setShowBulkUpdate(false);
      setBulkUpdateData({
        startDate: '',
        endDate: '',
        status: 'available',
        price: ''
      });
      
      toast.success(`Updated ${updates.length} days successfully`);
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Failed to bulk update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      room: room,
      availability: availabilityData,
      pricing: pricingData,
      bookings: bookings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-availability-${roomId}-${hotelUtils.formatDateForAPI(currentMonth)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
          <button
            onClick={() => navigate('/hotel-owner/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/hotel-owner/hotels/${hotelId}/rooms`)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Rooms
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Room Availability</h1>
                <p className="text-sm text-gray-600">{room.name} - {hotel.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowBulkUpdate(true)}
                className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <AvailabilityCalendar
              roomId={roomId}
              currentMonth={currentMonth}
              onDateClick={handleDateClick}
              onMonthChange={handleMonthChange}
              availabilityData={availabilityData}
              pricingData={pricingData}
              bookings={bookings}
              readOnly={false}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Room Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{room.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {room.maxOccupancy.adults} adults, {room.maxOccupancy.children} children
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Base: {hotelUtils.formatPrice(room.basePrice)}/night
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAvailabilityUpdate(selectedDate, true)}
                    disabled={!selectedDate}
                    className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  >
                    Mark as Available
                  </button>
                  <button
                    onClick={() => handleAvailabilityUpdate(selectedDate, false)}
                    disabled={!selectedDate}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    Block Date
                  </button>
                  <button
                    onClick={() => setShowBulkUpdate(true)}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Bulk Update
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Days</span>
                    <span className="text-sm font-medium">
                      {Object.values(availabilityData).filter(v => v === true).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Booked Days</span>
                    <span className="text-sm font-medium">
                      {bookings.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Blocked Days</span>
                    <span className="text-sm font-medium">
                      {Object.values(availabilityData).filter(v => v === false).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Update Availability</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkUpdateData.startDate}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkUpdateData.endDate}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, endDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={bulkUpdateData.status}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (optional)
                </label>
                <input
                  type="number"
                  value={bulkUpdateData.price}
                  onChange={(e) => setBulkUpdateData({...bulkUpdateData, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty to keep current pricing"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={saving || !bulkUpdateData.startDate || !bulkUpdateData.endDate}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;
