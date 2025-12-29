import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import roomAvailabilityService from '../../services/hotels/roomAvailabilityService';

const AvailabilityCalendar = ({ roomId, onDateSelect, selectedDates = {} }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get month start and end dates
  const getMonthRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch availability data for current month
  const fetchAvailability = async (month) => {
    if (!roomId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { start, end } = getMonthRange(month);
      const response = await roomAvailabilityService.getRoomAvailability(roomId, {
        startDate: start,
        endDate: end
      });
      
      if (response.status === 'success') {
        // Convert availability data to a more usable format
        const availabilityMap = {};
        response.data.details?.forEach(record => {
          const date = new Date(record.date).toISOString().split('T')[0];
          availabilityMap[date] = {
            status: record.status,
            availableRooms: record.availableRooms,
            totalRooms: record.totalRooms,
            price: record.pricing?.basePrice
          };
        });
        setAvailabilityData(availabilityMap);
      } else {
        setError(response.message || 'Failed to fetch availability data');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Error loading availability data');
    } finally {
      setLoading(false);
    }
  };

  // Load availability when component mounts or month changes
  useEffect(() => {
    fetchAvailability(currentMonth);
  }, [roomId, currentMonth]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const availability = availabilityData[dateString];
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isSelected = selectedDates.checkIn === dateString || selectedDates.checkOut === dateString;
      const isInRange = selectedDates.checkIn && selectedDates.checkOut && 
                       dateString > selectedDates.checkIn && dateString < selectedDates.checkOut;
      
      days.push({
        date,
        dateString,
        availability,
        isCurrentMonth,
        isPast,
        isSelected,
        isInRange
      });
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (day.isPast || !day.isCurrentMonth) return;
    
    // Allow selection of dates with unknown availability
    const dateString = day.dateString;
    
    if (onDateSelect) {
      onDateSelect(dateString, day.availability);
    }
  };

  // Get status icon and color
  const getStatusDisplay = (availability) => {
    if (!availability) {
      return { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        label: 'Available'
      };
    }
    
    switch (availability.status) {
      case 'available':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          label: 'Available'
        };
      case 'booked':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bgColor: 'bg-red-50',
          label: 'Booked'
        };
      case 'offline_booked':
        return { 
          icon: Clock, 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50',
          label: 'Offline Booked'
        };
      case 'maintenance':
        return { 
          icon: AlertCircle, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          label: 'Maintenance'
        };
      case 'blocked':
        return { 
          icon: XCircle, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          label: 'Blocked'
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100',
          label: 'Unknown'
        };
    }
  };

  const days = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Availability Calendar</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading availability...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 text-center text-red-600 bg-red-50">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && !error && (
        <>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 p-4 pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 p-4 pt-0">
            {days.map((day, index) => {
              const statusDisplay = getStatusDisplay(day.availability);
              const StatusIcon = statusDisplay.icon;
              
              // Determine if room is actually available for booking
              const isBookable = day.availability ? 
                day.availability.status === 'available' && day.availability.availableRooms > 0 :
                true; // If no availability data, allow booking with warning
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={day.isPast || !day.isCurrentMonth}
                  className={`
                    relative h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                    ${day.isPast || !day.isCurrentMonth
                      ? 'text-gray-300 cursor-not-allowed bg-gray-100' 
                      : 'cursor-pointer'
                    }
                    ${day.isSelected 
                      ? 'bg-blue-600 text-white' 
                      : day.isInRange 
                        ? 'bg-blue-100 text-blue-700'
                        : day.isCurrentMonth && !day.isPast
                          ? (day.availability ? statusDisplay.bgColor : 'bg-green-50')
                          : 'bg-gray-50'
                    }
                    ${day.isCurrentMonth && !day.isPast && !day.isSelected && !day.isInRange
                      ? 'hover:bg-opacity-80'
                      : ''
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span>{day.date.getDate()}</span>
                    {day.isCurrentMonth && !day.isPast && (
                      <StatusIcon className={`w-3 h-3 ${statusDisplay.color}`} />
                    )}
                  </div>
                  
                  {/* Availability Info */}
                  {day.isCurrentMonth && !day.isPast && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="text-xs text-gray-600 bg-white px-1 rounded shadow-sm">
                        {day.availability ? 
                          (day.availability.status === 'offline_booked' && day.availability.availableRooms > 0
                            ? 'Limited' // Show "Limited" instead of "1/1" for offline booked with availability
                            : `${day.availability.availableRooms}/${day.availability.totalRooms}`
                          ) :
                          'Available'
                        }
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 pt-2 border-t bg-gray-50">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <XCircle className="w-3 h-3 text-red-600" />
                <span>Booked</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-orange-600" />
                <span>Offline Booked</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-yellow-600" />
                <span>Maintenance</span>
              </div>
              <div className="flex items-center space-x-1">
                <XCircle className="w-3 h-3 text-gray-600" />
                <span>Blocked</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>• Numbers show available/total rooms (e.g., "2/5" means 2 out of 5 rooms available)</p>
              <p>• "Limited" means offline booking with some availability</p>
              <p>• Only "Available" dates can be selected for booking</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
