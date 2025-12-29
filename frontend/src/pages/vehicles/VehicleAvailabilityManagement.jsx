import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicle } from '../../context/vehicles/VehicleContext';
import { vehicleAPI } from '../../services/vehicles/vehicleService';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Ban,
  Unlock,
  Repeat,
  MapPin,
  DollarSign,
  Users,
  Car
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehicleAvailabilityManagement = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicleActions } = useVehicle();
  
  const [vehicle, setVehicle] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  
  // Time slot form data
  const [timeSlotData, setTimeSlotData] = useState({
    startTime: '',
    endTime: '',
    status: 'available',
    price: '',
    notes: ''
  });
  
  // Recurring availability form data
  const [recurringData, setRecurringData] = useState({
    startDate: '',
    endDate: '',
    pattern: 'daily',
    days: [],
    timeSlots: [],
    isAvailable: true,
    reason: 'available'
  });
  
  // Block vehicle form data
  const [blockData, setBlockData] = useState({
    startDate: '',
    endDate: '',
    reason: 'maintenance',
    customReason: '',
    timeSlots: []
  });
  
  useEffect(() => {
    if (vehicleId) {
      fetchVehicleAndAvailability();
    }
  }, [vehicleId, currentDate]);
  
  const fetchVehicleAndAvailability = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicle details
      const vehicleData = await vehicleActions.getVehicleById(vehicleId);
      if (vehicleData) {
        setVehicle(vehicleData);
      }
      
      // Fetch availability for current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`/api/vehicles/${vehicleId}/availability?month=${month}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setAvailability(data.data.availability);
      }
      
    } catch (error) {
      console.error('Error fetching vehicle and availability:', error);
      toast.error('Failed to load vehicle availability');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowTimeSlotModal(true);
    setEditingAvailability(null);
  };
  
  const handleSaveTimeSlot = async () => {
    try {
      const availabilityData = {
        date: selectedDate.toISOString().split('T')[0],
        timeSlots: [timeSlotData],
        isAvailable: timeSlotData.status === 'available',
        reason: timeSlotData.status === 'available' ? 'available' : 'maintenance'
      };
      
      const response = await fetch(`/api/vehicles/${vehicleId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(availabilityData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Availability updated successfully!');
        setShowTimeSlotModal(false);
        fetchVehicleAndAvailability();
        resetTimeSlotForm();
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error saving time slot:', error);
      toast.error('Failed to save time slot');
    }
  };
  
  const handleSaveRecurring = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/availability/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recurringData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Recurring availability created successfully!');
        setShowRecurringModal(false);
        fetchVehicleAndAvailability();
        resetRecurringForm();
      } else {
        toast.error(data.message || 'Failed to create recurring availability');
      }
    } catch (error) {
      console.error('Error saving recurring availability:', error);
      toast.error('Failed to save recurring availability');
    }
  };
  
  const handleBlockVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/availability/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(blockData)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Vehicle blocked successfully!');
        setShowBlockModal(false);
        fetchVehicleAndAvailability();
        resetBlockForm();
      } else {
        toast.error(data.message || 'Failed to block vehicle');
      }
    } catch (error) {
      console.error('Error blocking vehicle:', error);
      toast.error('Failed to block vehicle');
    }
  };
  
  const resetTimeSlotForm = () => {
    setTimeSlotData({
      startTime: '',
      endTime: '',
      status: 'available',
      price: '',
      notes: ''
    });
  };
  
  const resetRecurringForm = () => {
    setRecurringData({
      startDate: '',
      endDate: '',
      pattern: 'daily',
      days: [],
      timeSlots: [],
      isAvailable: true,
      reason: 'available'
    });
  };
  
  const resetBlockForm = () => {
    setBlockData({
      startDate: '',
      endDate: '',
      reason: 'maintenance',
      customReason: '',
      timeSlots: []
    });
  };
  
  const getAvailabilityForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(avail => avail.date.split('T')[0] === dateStr);
  };
  
  const getDateStatus = (date) => {
    const avail = getAvailabilityForDate(date);
    if (!avail) return 'unknown';
    if (!avail.isAvailable) return 'blocked';
    if (avail.timeSlots.some(slot => slot.status === 'booked')) return 'partially-booked';
    return 'available';
  };
  
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === today.toDateString();
          const status = getDateStatus(date);
          
          return (
            <div
              key={index}
              className={`p-2 text-center cursor-pointer rounded-lg transition-colors ${
                !isCurrentMonth ? 'text-gray-300' : 'text-gray-900 hover:bg-gray-100'
              } ${
                isToday ? 'bg-blue-100 font-semibold' : ''
              } ${
                status === 'available' ? 'bg-green-50 hover:bg-green-100' :
                status === 'blocked' ? 'bg-red-50 hover:bg-red-100' :
                status === 'partially-booked' ? 'bg-yellow-50 hover:bg-yellow-100' :
                'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => isCurrentMonth && handleDateSelect(date)}
            >
              <div className="text-sm">{date.getDate()}</div>
              {status === 'available' && <CheckCircle className="w-3 h-3 mx-auto text-green-600 mt-1" />}
              {status === 'blocked' && <X className="w-3 h-3 mx-auto text-red-600 mt-1" />}
              {status === 'partially-booked' && <AlertCircle className="w-3 h-3 mx-auto text-yellow-600 mt-1" />}
            </div>
          );
        })}
      </div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Availability</h1>
              {vehicle && (
                <p className="text-lg text-gray-600 mt-2">
                  {vehicle.name} - {vehicle.make} {vehicle.model}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/vehicle-owner/vehicles/${vehicleId}`)}
                className="btn btn-outline"
              >
                <Car className="w-4 h-4 mr-2" />
                Back to Vehicle
              </button>
              <button
                onClick={fetchVehicleAndAvailability}
                className="btn btn-outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="border border-gray-200 rounded-lg p-4">
            {renderCalendar()}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2"></div>
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowTimeSlotModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </button>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="btn btn-secondary"
            >
              <Repeat className="w-4 h-4 mr-2" />
              Set Recurring
            </button>
            <button
              onClick={() => setShowBlockModal(true)}
              className="btn btn-error"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block Vehicle
            </button>
          </div>
        </div>
        
        {/* Time Slot Modal */}
        {showTimeSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Time Slot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={timeSlotData.startTime}
                      onChange={(e) => setTimeSlotData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={timeSlotData.endTime}
                      onChange={(e) => setTimeSlotData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={timeSlotData.status}
                    onChange={(e) => setTimeSlotData(prev => ({ ...prev, status: e.target.value }))}
                    className="select select-bordered w-full"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={timeSlotData.price}
                    onChange={(e) => setTimeSlotData(prev => ({ ...prev, price: e.target.value }))}
                    className="input input-bordered w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={timeSlotData.notes}
                    onChange={(e) => setTimeSlotData(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTimeSlotModal(false);
                    resetTimeSlotForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTimeSlot}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Recurring Availability Modal */}
        {showRecurringModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Set Recurring Availability</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={recurringData.startDate}
                      onChange={(e) => setRecurringData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={recurringData.endDate}
                      onChange={(e) => setRecurringData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pattern
                  </label>
                  <select
                    value={recurringData.pattern}
                    onChange={(e) => setRecurringData(prev => ({ ...prev, pattern: e.target.value }))}
                    className="select select-bordered w-full"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {recurringData.pattern === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={recurringData.days.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRecurringData(prev => ({ ...prev, days: [...prev.days, day] }));
                              } else {
                                setRecurringData(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                              }
                            }}
                            className="checkbox checkbox-primary mr-2"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={recurringData.timeSlots[0]?.startTime || ''}
                      onChange={(e) => setRecurringData(prev => ({
                        ...prev,
                        timeSlots: [{ ...prev.timeSlots[0], startTime: e.target.value }]
                      }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={recurringData.timeSlots[0]?.endTime || ''}
                      onChange={(e) => setRecurringData(prev => ({
                        ...prev,
                        timeSlots: [{ ...prev.timeSlots[0], endTime: e.target.value }]
                      }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRecurringModal(false);
                    resetRecurringForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRecurring}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Block Vehicle Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Block Vehicle</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={blockData.startDate}
                      onChange={(e) => setBlockData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={blockData.endDate}
                      onChange={(e) => setBlockData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={blockData.reason}
                    onChange={(e) => setBlockData(prev => ({ ...prev, reason: e.target.value }))}
                    className="select select-bordered w-full"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="personal_use">Personal Use</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Reason (Optional)
                  </label>
                  <textarea
                    value={blockData.customReason}
                    onChange={(e) => setBlockData(prev => ({ ...prev, customReason: e.target.value }))}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    resetBlockForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockVehicle}
                  className="btn btn-error"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleAvailabilityManagement;
