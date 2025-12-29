const RoomAvailability = require('../../models/hotels/RoomAvailability');
const Room = require('../../models/hotels/Room');
const Hotel = require('../../models/hotels/Hotel');
const { asyncHandler } = require('../../middleware/errorHandler');

// @desc    Get room availability for date range
// @route   GET /api/rooms/:roomId/availability
// @access  Public
const getRoomAvailability = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { startDate, endDate } = req.query;

  console.log('getRoomAvailability called with:', { roomId, startDate, endDate });
  console.log('roomId type:', typeof roomId);
  console.log('roomId length:', roomId?.length);

  if (!startDate || !endDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Start date and end date are required'
    });
  }

  // Validate room exists
  const room = await Room.findById(roomId);
  console.log('Room found:', room ? 'YES' : 'NO');
  console.log('Room query result:', room);
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if room is active
  if (room.status !== 'active') {
    return res.status(404).json({
      status: 'error',
      message: 'Room is not available'
    });
  }

  // Get availability for date range
  const availability = await RoomAvailability.getAvailabilityForRange(
    roomId,
    startDate,
    endDate
  );

  console.log('Availability query result:', availability);

  // Determine overall availability for the range
  const isAvailable = availability.every(record => 
    record.status === 'available' && record.availableRooms > 0
  );

  // Calculate total available rooms for the range
  const totalAvailableRooms = availability.reduce((sum, record) => {
    return record.status === 'available' ? sum + record.availableRooms : sum;
  }, 0);

  console.log('Final availability result:', { isAvailable, totalAvailableRooms, details: availability.length });

  res.status(200).json({
    status: 'success',
    data: {
      roomId,
      startDate,
      endDate,
      isAvailable,
      totalAvailableRooms,
      details: availability
    }
  });
});

// @desc    Get availability calendar for a room
// @route   GET /api/rooms/:roomId/availability/calendar
// @access  Private (Hotel Owner)
const getAvailabilityCalendar = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { year, month } = req.query;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view this room\'s availability'
    });
  }

  // Calculate date range for the month
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;
  
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0);

  // Get availability for the month
  const availability = await RoomAvailability.getAvailabilityForRange(
    roomId,
    startDate,
    endDate
  );

  // Create calendar structure
  const calendar = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayAvailability = availability.find(av => 
      av.date.toISOString().split('T')[0] === dateStr
    );
    
    calendar.push({
      date: new Date(currentDate),
      status: dayAvailability ? dayAvailability.status : 'available',
      availableRooms: dayAvailability ? dayAvailability.availableRooms : room.availability.totalRooms,
      totalRooms: dayAvailability ? dayAvailability.totalRooms : room.availability.totalRooms,
      isPast: currentDate < new Date().setHours(0, 0, 0, 0),
      isToday: currentDate.toDateString() === new Date().toDateString(),
      details: dayAvailability
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(200).json({
    status: 'success',
    data: {
      room: {
        id: room._id,
        name: room.name,
        roomType: room.roomType
      },
      calendar,
      month: {
        year: targetYear,
        month: targetMonth,
        name: startDate.toLocaleString('default', { month: 'long' })
      }
    }
  });
});

// @desc    Update room availability for specific date
// @route   PUT /api/rooms/:roomId/availability/:date
// @access  Private (Hotel Owner)
const updateRoomAvailability = asyncHandler(async (req, res) => {
  const { roomId, date } = req.params;
  const {
    status,
    availableRooms,
    totalRooms,
    pricing,
    offlineBooking,
    maintenance,
    blocking
  } = req.body;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this room\'s availability'
    });
  }

  // Validate date
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format'
    });
  }

  // Check for conflicts if setting to available
  if (status === 'available') {
    const conflicts = await RoomAvailability.checkConflicts(
      roomId,
      targetDate,
      targetDate
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot set to available - conflicts with existing bookings or maintenance',
        conflicts: conflicts.map(c => ({
          date: c.date,
          status: c.status,
          reason: c.maintenance?.reason || c.blocking?.reason || 'Existing booking'
        }))
      });
    }
  }

  // Find or create availability record
  let availability = await RoomAvailability.findOne({
    room: roomId,
    date: targetDate
  });

  if (availability) {
    // Update existing record
    availability.status = status || availability.status;
    availability.availableRooms = availableRooms !== undefined ? availableRooms : availability.availableRooms;
    availability.totalRooms = totalRooms !== undefined ? totalRooms : availability.totalRooms;
    availability.pricing = pricing || availability.pricing;
    availability.offlineBooking = offlineBooking || availability.offlineBooking;
    availability.maintenance = maintenance || availability.maintenance;
    availability.blocking = blocking || availability.blocking;
    availability.lastModifiedBy = req.user.id;
    
    await availability.save();
  } else {
    // Create new record
    availability = await RoomAvailability.create({
      room: roomId,
      hotel: room.hotel._id,
      date: targetDate,
      status: status || 'available',
      availableRooms: availableRooms || room.availability.totalRooms,
      totalRooms: totalRooms || room.availability.totalRooms,
      pricing: pricing || { basePrice: room.pricing.basePrice, currency: room.pricing.currency },
      offlineBooking: offlineBooking || {},
      maintenance: maintenance || {},
      blocking: blocking || {},
      createdBy: req.user.id
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Room availability updated successfully',
    data: {
      availability
    }
  });
});

// @desc    Bulk update room availability
// @route   PUT /api/rooms/:roomId/availability/bulk
// @access  Private (Hotel Owner)
const bulkUpdateAvailability = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { startDate, endDate, updates } = req.body;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this room\'s availability'
    });
  }

  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format'
    });
  }

  if (start > end) {
    return res.status(400).json({
      status: 'error',
      message: 'Start date must be before end date'
    });
  }

  // Check for conflicts
  const conflicts = await RoomAvailability.checkConflicts(roomId, start, end);
  if (conflicts.length > 0 && updates.status === 'available') {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot set to available - conflicts with existing bookings or maintenance',
      conflicts: conflicts.map(c => ({
        date: c.date,
        status: c.status,
        reason: c.maintenance?.reason || c.blocking?.reason || 'Existing booking'
      }))
    });
  }

  // Bulk update
  const results = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    let availability = await RoomAvailability.findOne({
      room: roomId,
      date: new Date(currentDate)
    });

    if (availability) {
      // Update existing record
      Object.assign(availability, updates);
      availability.lastModifiedBy = req.user.id;
      await availability.save();
    } else {
      // Create new record
      availability = await RoomAvailability.create({
        room: roomId,
        hotel: room.hotel._id,
        date: new Date(currentDate),
        ...updates,
        createdBy: req.user.id
      });
    }
    
    results.push(availability);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(200).json({
    status: 'success',
    message: `Bulk update completed for ${results.length} dates`,
    data: {
      updated: results.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      results
    }
  });
});

// @desc    Add offline booking
// @route   POST /api/rooms/:roomId/availability/offline-booking
// @access  Private (Hotel Owner)
const addOfflineBooking = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { startDate, endDate, guestDetails, numberOfRooms, notes } = req.body;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to add offline bookings for this room'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format'
    });
  }

  if (start >= end) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-out date must be after check-in date'
    });
  }

  // Check for conflicts
  const conflicts = await RoomAvailability.checkConflicts(roomId, start, end);
  if (conflicts.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot add offline booking - conflicts with existing bookings or maintenance',
      conflicts: conflicts.map(c => ({
        date: c.date,
        status: c.status,
        reason: c.maintenance?.reason || c.blocking?.reason || 'Existing booking'
      }))
    });
  }

  // Create offline booking records
  const results = [];
  const currentDate = new Date(start);
  
  while (currentDate < end) {
    let availability = await RoomAvailability.findOne({
      room: roomId,
      date: new Date(currentDate)
    });

    if (availability) {
      // Update existing record
      availability.status = 'offline_booked';
      availability.offlineBooking = {
        guestName: guestDetails.name,
        guestContact: guestDetails.contact,
        checkIn: start,
        checkOut: end,
        numberOfRooms: numberOfRooms || 1,
        notes: notes || ''
      };
      availability.lastModifiedBy = req.user.id;
      await availability.save();
    } else {
      // Create new record
      availability = await RoomAvailability.create({
        room: roomId,
        hotel: room.hotel._id,
        date: new Date(currentDate),
        status: 'offline_booked',
        availableRooms: 0,
        totalRooms: room.availability.totalRooms,
        offlineBooking: {
          guestName: guestDetails.name,
          guestContact: guestDetails.contact,
          checkIn: start,
          checkOut: end,
          numberOfRooms: numberOfRooms || 1,
          notes: notes || ''
        },
        createdBy: req.user.id
      });
    }
    
    results.push(availability);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(201).json({
    status: 'success',
    message: 'Offline booking added successfully',
    data: {
      booking: {
        room: room.name,
        guestName: guestDetails.name,
        checkIn: startDate,
        checkOut: endDate,
        numberOfRooms: numberOfRooms || 1,
        nights: results.length
      },
      availability: results
    }
  });
});

// @desc    Schedule maintenance
// @route   POST /api/rooms/:roomId/availability/maintenance
// @access  Private (Hotel Owner)
const scheduleMaintenance = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { startDate, endDate, reason, description, estimatedCompletion, assignedTo, priority } = req.body;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to schedule maintenance for this room'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid date format'
    });
  }

  if (start >= end) {
    return res.status(400).json({
      status: 'error',
      message: 'End date must be after start date'
    });
  }

  // Check for conflicts
  const conflicts = await RoomAvailability.checkConflicts(roomId, start, end);
  if (conflicts.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot schedule maintenance - conflicts with existing bookings',
      conflicts: conflicts.map(c => ({
        date: c.date,
        status: c.status,
        reason: c.offlineBooking?.guestName || 'Existing booking'
      }))
    });
  }

  // Schedule maintenance
  const results = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    let availability = await RoomAvailability.findOne({
      room: roomId,
      date: new Date(currentDate)
    });

    if (availability) {
      // Update existing record
      availability.status = 'maintenance';
      availability.maintenance = {
        reason: reason || 'Scheduled maintenance',
        description: description || '',
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : end,
        assignedTo: assignedTo || '',
        priority: priority || 'medium'
      };
      availability.lastModifiedBy = req.user.id;
      await availability.save();
    } else {
      // Create new record
      availability = await RoomAvailability.create({
        room: roomId,
        hotel: room.hotel._id,
        date: new Date(currentDate),
        status: 'maintenance',
        availableRooms: 0,
        totalRooms: room.availability.totalRooms,
        maintenance: {
          reason: reason || 'Scheduled maintenance',
          description: description || '',
          estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : end,
          assignedTo: assignedTo || '',
          priority: priority || 'medium'
        },
        createdBy: req.user.id
      });
    }
    
    results.push(availability);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(201).json({
    status: 'success',
    message: 'Maintenance scheduled successfully',
    data: {
      maintenance: {
        room: room.name,
        reason: reason || 'Scheduled maintenance',
        startDate: startDate,
        endDate: endDate,
        priority: priority || 'medium',
        days: results.length
      },
      availability: results
    }
  });
});

// @desc    Get availability conflicts
// @route   GET /api/rooms/:roomId/availability/conflicts
// @access  Private (Hotel Owner)
const getAvailabilityConflicts = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate room exists and user owns it
  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check authorization
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view this room\'s conflicts'
    });
  }

  // Get conflicts for date range
  const conflicts = await RoomAvailability.checkConflicts(roomId, startDate, endDate);

  res.status(200).json({
    status: 'success',
    data: {
      room: {
        id: room._id,
        name: room.name,
        roomType: room.roomType
      },
      conflicts: conflicts.map(conflict => ({
        date: conflict.date,
        status: conflict.status,
        reason: conflict.maintenance?.reason || 
                conflict.blocking?.reason || 
                conflict.offlineBooking?.guestName || 
                'Existing booking',
        details: {
          maintenance: conflict.maintenance,
          blocking: conflict.blocking,
          offlineBooking: conflict.offlineBooking
        }
      })),
      dateRange: {
        start: startDate,
        end: endDate
      }
    }
  });
});

module.exports = {
  getRoomAvailability,
  getAvailabilityCalendar,
  updateRoomAvailability,
  bulkUpdateAvailability,
  addOfflineBooking,
  scheduleMaintenance,
  getAvailabilityConflicts
};
