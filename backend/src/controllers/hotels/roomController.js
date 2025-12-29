const Room = require('../../models/hotels/Room');
const Hotel = require('../../models/hotels/Hotel');
const HotelBooking = require('../../models/hotels/HotelBooking');
const { asyncHandler } = require('../../middleware/errorHandler');

// @desc    Get all rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
const getRooms = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { 
    checkIn, 
    checkOut, 
    adults = 1, 
    children = 0, 
    infants = 0,
    roomType,
    minPrice,
    maxPrice,
    amenities
  } = req.query;

  // Build filter object
  const filter = { 
    hotel: hotelId, 
    status: 'active',
    'maxOccupancy.adults': { $gte: parseInt(adults) },
    'maxOccupancy.children': { $gte: parseInt(children) },
    'maxOccupancy.infants': { $gte: parseInt(infants) }
  };

  if (roomType) filter.roomType = roomType;
  if (minPrice) filter['pricing.basePrice'] = { $gte: parseFloat(minPrice) };
  if (maxPrice) filter['pricing.basePrice'] = { $lte: parseFloat(maxPrice) };

  const rooms = await Room.find(filter)
    .populate('hotel', 'name location')
    .sort({ 'pricing.basePrice': 1 })
    .select('-__v');

  // Filter by amenities if specified
  let filteredRooms = rooms;
  if (amenities) {
    const amenityList = amenities.split(',');
    filteredRooms = rooms.filter(room => {
      return amenityList.every(amenity => {
        const amenityKey = amenity.trim();
        return room.amenities[amenityKey] === true;
      });
    });
  }

  // Check availability for date range if provided
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    filteredRooms = await Promise.all(
      filteredRooms.map(async (room) => {
        const isAvailable = await room.checkAvailability(checkInDate, checkOutDate);
        const price = room.calculatePrice(checkInDate, checkOutDate);
        
        return {
          ...room.toObject(),
          isAvailable,
          calculatedPrice: price
        };
      })
    );
    
    // Filter out unavailable rooms
    filteredRooms = filteredRooms.filter(room => room.isAvailable);
  }

  res.status(200).json({
    status: 'success',
    data: {
      rooms: filteredRooms
    }
  });
});

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('hotel', 'name location contact amenities')
    .select('-__v');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      room
    }
  });
});

// @desc    Create new room
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Hotel Owner)
const createRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  // Check if hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to add rooms to this hotel'
    });
  }

  // Add hotel reference to request body
  req.body.hotel = hotelId;

  const room = await Room.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Room created successfully',
    data: {
      room
    }
  });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Hotel Owner)
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this room'
    });
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Room updated successfully',
    data: {
      room: updatedRoom
    }
  });
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Hotel Owner/Admin)
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this room'
    });
  }

  // Check if room has any bookings
  const hasBookings = await HotelBooking.countDocuments({ room: req.params.id });
  if (hasBookings > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot delete room with existing bookings'
    });
  }

  await Room.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Room deleted successfully'
  });
});

// @desc    Update room availability
// @route   PUT /api/rooms/:id/availability
// @access  Private (Hotel Owner)
const updateRoomAvailability = asyncHandler(async (req, res) => {
  const { availableRooms, blockedRooms, maintenanceRooms } = req.body;

  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update room availability'
    });
  }

  // Validate availability numbers
  const totalRooms = room.availability.totalRooms;
  const newAvailable = availableRooms || room.availability.availableRooms;
  const newBlocked = blockedRooms || room.availability.blockedRooms;
  const newMaintenance = maintenanceRooms || room.availability.maintenanceRooms;

  if (newAvailable + newBlocked + newMaintenance > totalRooms) {
    return res.status(400).json({
      status: 'error',
      message: 'Sum of available, blocked, and maintenance rooms cannot exceed total rooms'
    });
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    {
      'availability.availableRooms': newAvailable,
      'availability.blockedRooms': newBlocked,
      'availability.maintenanceRooms': newMaintenance
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Room availability updated successfully',
    data: {
      room: updatedRoom
    }
  });
});

// @desc    Get room availability for date range
// @route   GET /api/rooms/:id/availability
// @access  Public
const getRoomAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-in and check-out dates are required'
    });
  }

  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  const isAvailable = await room.checkAvailability(checkInDate, checkOutDate);
  const price = room.calculatePrice(checkInDate, checkOutDate);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  res.status(200).json({
    status: 'success',
    data: {
      availability: {
        isAvailable,
        price,
        nights,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        availableRooms: room.availability.availableRooms
      }
    }
  });
});

// @desc    Get room pricing for date range
// @route   GET /api/rooms/:id/pricing
// @access  Public
const getRoomPricing = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, quantity = 1 } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-in and check-out dates are required'
    });
  }

  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  const totalPrice = room.calculatePrice(checkInDate, checkOutDate, parseInt(quantity));
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = totalPrice / nights;

  res.status(200).json({
    status: 'success',
    data: {
      pricing: {
        basePrice: room.pricing.basePrice,
        totalPrice,
        pricePerNight,
        nights,
        quantity: parseInt(quantity),
        currency: room.pricing.currency,
        checkIn: checkInDate,
        checkOut: checkOutDate
      }
    }
  });
});

// @desc    Get room statistics
// @route   GET /api/rooms/:id/stats
// @access  Private (Hotel Owner/Admin)
const getRoomStats = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view room statistics'
    });
  }

  // Get booking statistics
  const totalBookings = await HotelBooking.countDocuments({ room: req.params.id });
  const confirmedBookings = await HotelBooking.countDocuments({ 
    room: req.params.id, 
    status: 'confirmed' 
  });
  const completedBookings = await HotelBooking.countDocuments({ 
    room: req.params.id, 
    status: 'completed' 
  });

  // Get revenue statistics
  const revenueStats = await HotelBooking.aggregate([
    { $match: { room: req.params.id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  // Get occupancy rate
  const totalNights = await HotelBooking.aggregate([
    { $match: { room: req.params.id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalNights: { $sum: '$nights' }
      }
    }
  ]);

  const totalPossibleNights = room.availability.totalRooms * 365; // Assuming 365 days
  const occupancyRate = totalPossibleNights > 0 ? 
    (totalNights[0]?.totalNights || 0) / totalPossibleNights * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 },
        occupancyRate: Math.round(occupancyRate * 100) / 100
      }
    }
  });
});

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomAvailability,
  getRoomAvailability,
  getRoomPricing,
  getRoomStats
};
