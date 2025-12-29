import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  AlertTriangle,
  User,
  Wrench,
  X,
  Check,
  Clock,
  Ban
} from 'lucide-react';
import roomAvailabilityService from '../../services/hotels/roomAvailabilityService';
import toast from 'react-hot-toast';

const RoomAvailabilityCalendar = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [calendar, setCalendar] = useState([]);
  const [room, setRoom] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('update'); // 'update', 'offline-booking', 'maintenance'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCalendar();
  }, [roomId, currentMonth, currentYear]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await roomAvailabilityService.getAvailabilityCalendar(roomId, {
        year: currentYear,
        month: currentMonth
      });
      
      // Convert date strings back to Date objects
      const calendarWithDates = response.data.calendar.map(dateInfo => ({
        ...dateInfo,
        date: new Date(dateInfo.date)
      }));
      
      setCalendar(calendarWithDates);
      setRoom(response.data.room);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      toast.error('Failed to fetch availability calendar');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      booked: 'bg-blue-100 text-blue-800 border-blue-200',
      offline_booked: 'bg-purple-100 text-purple-800 border-purple-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
      out_of_order: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.available;
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: Check,
      booked: User,
      offline_booked: User,
      maintenance: Wrench,
      blocked: Ban,
      out_of_order: X
    };
    return icons[status] || Check;
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Available',
      booked: 'Booked',
      offline_booked: 'Offline Booked',
      maintenance: 'Maintenance',
      blocked: 'Blocked',
      out_of_order: 'Out of Order'
    };
    return labels[status] || 'Available';
  };

  const handleDateClick = (dateInfo) => {
    if (dateInfo.isPast) return;
    
    setSelectedDate(dateInfo);
    setFormData({
      status: dateInfo.status,
      availableRooms: dateInfo.availableRooms,
      totalRooms: dateInfo.totalRooms
    });
    setModalType('update');
    setShowModal(true);
  };

  const handleQuickAction = (action, dateInfo) => {
    setSelectedDate(dateInfo);
    setModalType(action);
    setFormData({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const dateStr = selectedDate.date.toISOString().split('T')[0];
      
      switch (modalType) {
        case 'update':
          await roomAvailabilityService.updateRoomAvailability(roomId, dateStr, formData);
          toast.success('Availability updated successfully');
          break;
        case 'offline-booking':
          await roomAvailabilityService.addOfflineBooking(roomId, {
            startDate: dateStr,
            endDate: formData.endDate || dateStr,
            guestDetails: {
              name: formData.guestName,
              contact: formData.guestContact
            },
            numberOfRooms: formData.numberOfRooms || 1,
            notes: formData.notes || ''
          });
          toast.success('Offline booking added successfully');
          break;
        case 'maintenance':
          await roomAvailabilityService.scheduleMaintenance(roomId, {
            startDate: dateStr,
            endDate: formData.endDate || dateStr,
            reason: formData.reason,
            description: formData.description || '',
            priority: formData.priority || 'medium',
            assignedTo: formData.assignedTo || ''
          });
          toast.success('Maintenance scheduled successfully');
          break;
      }
      
      setShowModal(false);
      fetchCalendar();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const renderModal = () => {
    if (!showModal || !selectedDate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'update' && 'Update Availability'}
                {modalType === 'offline-booking' && 'Add Offline Booking'}
                {modalType === 'maintenance' && 'Schedule Maintenance'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Date: {selectedDate.date.toLocaleDateString()}
              </p>
            </div>

            {modalType === 'update' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="available">Available</option>
                    <option value="blocked">Blocked</option>
                    <option value="out_of_order">Out of Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Rooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalRooms || 1}
                    value={formData.availableRooms || 0}
                    onChange={(e) => setFormData({ ...formData, availableRooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
              </div>
            )}

            {modalType === 'offline-booking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={formData.guestName || ''}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter guest name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Contact
                  </label>
                  <input
                    type="text"
                    value={formData.guestContact || ''}
                    onChange={(e) => setFormData({ ...formData, guestContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter contact information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfRooms || 1}
                    onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    rows="3"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            )}

            {modalType === 'maintenance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter maintenance reason"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter assigned person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    rows="3"
                    placeholder="Enter maintenance description"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {modalType === 'update' && 'Update'}
                {modalType === 'offline-booking' && 'Add Booking'}
                {modalType === 'maintenance' && 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Room Availability</h1>
              <p className="text-gray-600 mt-2">
                {room?.name} - {room?.roomType}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {new Date(currentYear, currentMonth - 1).toLocaleDateString('default', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendar.map((dateInfo, index) => {
                const StatusIcon = getStatusIcon(dateInfo.status);
                const isClickable = !dateInfo.isPast;
                
                return (
                  <div
                    key={index}
                    className={`p-2 min-h-[80px] border rounded-md cursor-pointer transition-all duration-200 ${
                      isClickable 
                        ? 'hover:shadow-md hover:scale-105' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${getStatusColor(dateInfo.status)}`}
                    onClick={() => isClickable && handleDateClick(dateInfo)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {dateInfo.date.getDate()}
                      </span>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="text-xs">
                      <div className="truncate">
                        {getStatusLabel(dateInfo.status)}
                      </div>
                      <div className="text-xs opacity-75">
                        {dateInfo.availableRooms}/{dateInfo.totalRooms} rooms
                      </div>
                    </div>

                    {/* Quick actions for available dates */}
                    {isClickable && dateInfo.status === 'available' && (
                      <div className="mt-1 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction('offline-booking', dateInfo);
                          }}
                          className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          title="Add offline booking"
                        >
                          <User className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction('maintenance', dateInfo);
                          }}
                          className="p-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                          title="Schedule maintenance"
                        >
                          <Wrench className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { status: 'available', label: 'Available' },
              { status: 'booked', label: 'Booked' },
              { status: 'offline_booked', label: 'Offline Booked' },
              { status: 'maintenance', label: 'Maintenance' },
              { status: 'blocked', label: 'Blocked' },
              { status: 'out_of_order', label: 'Out of Order' }
            ].map(({ status, label }) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <div key={status} className="flex items-center space-x-2">
                  <div className={`p-2 rounded-md ${getStatusColor(status)}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default RoomAvailabilityCalendar;
