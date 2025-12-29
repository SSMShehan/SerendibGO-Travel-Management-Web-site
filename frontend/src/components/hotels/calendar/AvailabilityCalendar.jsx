import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, DollarSign, Users, Bed } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast, isWeekend } from 'date-fns';

const AvailabilityCalendar = ({ 
  roomId, 
  currentMonth = new Date(), 
  onDateClick, 
  onMonthChange,
  availabilityData = {},
  pricingData = {},
  bookings = [],
  readOnly = false 
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('availability'); // 'availability', 'pricing', 'bookings'

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get previous month
  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    onMonthChange(newMonth);
  };

  // Get next month
  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    onMonthChange(newMonth);
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (readOnly) return;
    
    setSelectedDate(date);
    onDateClick(date);
  };

  // Get date status
  const getDateStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if date is in the past
    if (isPast(date) && !isToday(date)) {
      return 'past';
    }
    
    // Check for bookings
    const hasBooking = bookings.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
    
    if (hasBooking) {
      return 'booked';
    }
    
    // Check availability
    const availability = availabilityData[dateStr];
    if (availability === false) {
      return 'blocked';
    }
    
    return 'available';
  };

  // Get date pricing
  const getDatePricing = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return pricingData[dateStr] || null;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'past':
        return 'bg-gray-50 text-gray-400 border-gray-100';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'booked':
        return 'Booked';
      case 'blocked':
        return 'Blocked';
      case 'past':
        return 'Past';
      default:
        return 'Unknown';
    }
  };

  // Get day of week header
  const getDayHeader = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  // Get empty cells for month start
  const getEmptyCells = () => {
    const emptyCells = [];
    const startDay = monthStart.getDay();
    
    for (let i = 0; i < startDay; i++) {
      emptyCells.push(
        <div key={`empty-${i}`} className="h-12 w-12"></div>
      );
    }
    
    return emptyCells;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Room Availability</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setViewMode('availability')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            viewMode === 'availability'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Availability
        </button>
        <button
          onClick={() => setViewMode('pricing')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            viewMode === 'pricing'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pricing
        </button>
        <button
          onClick={() => setViewMode('bookings')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            viewMode === 'bookings'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
              {getDayHeader(i)}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getEmptyCells()}
          {daysInMonth.map((date) => {
            const status = getDateStatus(date);
            const pricing = getDatePricing(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const isWeekendDay = isWeekend(date);

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  h-12 w-12 flex flex-col items-center justify-center text-sm border rounded-lg cursor-pointer transition-all
                  ${getStatusColor(status)}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isCurrentDay ? 'font-bold' : ''}
                  ${isWeekendDay ? 'bg-opacity-80' : ''}
                  ${readOnly ? 'cursor-default' : 'hover:shadow-md'}
                `}
              >
                <span className="text-xs font-medium">
                  {format(date, 'd')}
                </span>
                
                {viewMode === 'pricing' && pricing && (
                  <span className="text-xs text-green-600 font-medium">
                    Rs.{pricing}
                  </span>
                )}
                
                {viewMode === 'bookings' && status === 'booked' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-gray-600">Blocked</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div>
              <span className="text-gray-600">Past</span>
            </div>
          </div>
          
          {selectedDate && (
            <div className="text-sm text-gray-600">
              Selected: {format(selectedDate, 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
