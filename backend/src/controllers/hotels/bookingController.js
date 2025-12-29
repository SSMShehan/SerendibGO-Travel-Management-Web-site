const HotelBooking = require('../../models/hotels/HotelBooking');
const Hotel = require('../../models/hotels/Hotel');
const Room = require('../../models/hotels/Room');
const { asyncHandler } = require('../../middleware/errorHandler');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    hotel,
    room,
    checkIn,
    checkOut,
    guestDetails,
    occupancy,
    specialRequirements
  } = req.body;

  // Validate hotel and room exist
  const hotelExists = await Hotel.findById(hotel);
  if (!hotelExists) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  const roomExists = await Room.findById(room);
  if (!roomExists) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  // Check if room belongs to hotel
  if (roomExists.hotel.toString() !== hotel) {
    return res.status(400).json({
      status: 'error',
      message: 'Room does not belong to the specified hotel'
    });
  }

  // Check room availability
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkInDate >= checkOutDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-out date must be after check-in date'
    });
  }

  if (checkInDate < new Date()) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-in date cannot be in the past'
    });
  }

  const isAvailable = await roomExists.checkAvailability(checkInDate, checkOutDate);
  if (!isAvailable) {
    return res.status(400).json({
      status: 'error',
      message: 'Room is not available for the selected dates'
    });
  }

  // Calculate pricing
  const roomPrice = roomExists.calculatePrice(checkInDate, checkOutDate);
  const taxes = roomPrice * 0.1; // 10% tax
  const serviceCharge = roomPrice * 0.05; // 5% service charge
  const totalAmount = roomPrice + taxes + serviceCharge;

  // Create booking
  const bookingData = {
    guest: req.user.id,
    hotel,
    room,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guestDetails,
    occupancy,
    specialRequirements,
    pricing: {
      roomPrice,
      taxes,
      serviceCharge,
      totalAmount,
      currency: roomExists.pricing.currency
    },
    source: 'website'
  };

  const booking = await HotelBooking.create(bookingData);

  res.status(201).json({
    status: 'success',
    message: 'Booking created successfully',
    data: {
      booking
    }
  });
});

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { guest: req.user.id };
  if (status) filter.status = status;

  const bookings = await HotelBooking.find(filter)
    .populate('hotel', 'name location images')
    .populate('room', 'name roomType images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  const total = await HotelBooking.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findById(req.params.id)
    .populate('guest', 'firstName lastName email phone')
    .populate('hotel', 'name location contact images')
    .populate('room', 'name roomType images amenities')
    .select('-__v');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check if user owns the booking or is hotel owner/admin
  if (booking.guest._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      booking.hotel.owner.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view this booking'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await HotelBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check if user owns the booking or is hotel owner/admin
  if (booking.guest.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      booking.hotel.owner.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this booking'
    });
  }

  const updatedBooking = await HotelBooking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Booking updated successfully',
    data: {
      booking: updatedBooking
    }
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await HotelBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check if user owns the booking
  if (booking.guest.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to cancel this booking'
    });
  }

  // Check if booking can be cancelled
  if (!booking.canBeCancelled()) {
    return res.status(400).json({
      status: 'error',
      message: 'Booking cannot be cancelled at this time'
    });
  }

  // Calculate cancellation fee
  const cancellationFee = booking.calculateCancellationFee();
  const refundAmount = booking.pricing.totalAmount - cancellationFee;

  const updatedBooking = await HotelBooking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      cancellation: {
        cancelledBy: 'guest',
        cancellationDate: new Date(),
        cancellationReason: reason,
        refundAmount
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking: updatedBooking,
      cancellationFee,
      refundAmount
    }
  });
});

// @desc    Get hotel bookings (for hotel owners)
// @route   GET /api/hotels/:hotelId/bookings
// @access  Private (Hotel Owner)
const getHotelBookings = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

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
      message: 'Not authorized to view hotel bookings'
    });
  }

  const filter = { hotel: hotelId };
  if (status) filter.status = status;

  const bookings = await HotelBooking.find(filter)
    .populate('guest', 'firstName lastName email phone')
    .populate('room', 'name roomType')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  const total = await HotelBooking.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Process check-in
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Hotel Owner)
const processCheckIn = asyncHandler(async (req, res) => {
  const { roomNumber, staffName } = req.body;

  const booking = await HotelBooking.findById(req.params.id).populate('hotel');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (booking.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to process check-in'
    });
  }

  // Check if booking is confirmed
  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only confirmed bookings can be checked in'
    });
  }

  // Check if it's check-in day
  const today = new Date();
  const checkInDate = new Date(booking.checkIn);
  if (today.toDateString() !== checkInDate.toDateString()) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-in can only be processed on the check-in date'
    });
  }

  const updatedBooking = await HotelBooking.findByIdAndUpdate(
    req.params.id,
    {
      checkInInfo: {
        actualCheckIn: new Date(),
        checkInStaff: staffName,
        roomNumber,
        keyCardIssued: true,
        welcomePackGiven: true,
        orientationCompleted: true
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Check-in processed successfully',
    data: {
      booking: updatedBooking
    }
  });
});

// @desc    Process check-out
// @route   PUT /api/bookings/:id/checkout
// @access  Private (Hotel Owner)
const processCheckOut = asyncHandler(async (req, res) => {
  const { staffName } = req.body;

  const booking = await HotelBooking.findById(req.params.id).populate('hotel');

  if (!booking) {
    return res.status(404).json({
      status: 'error',
      message: 'Booking not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (booking.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to process check-out'
    });
  }

  // Check if booking is confirmed
  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only confirmed bookings can be checked out'
    });
  }

  // Check if it's check-out day
  const today = new Date();
  const checkOutDate = new Date(booking.checkOut);
  if (today.toDateString() !== checkOutDate.toDateString()) {
    return res.status(400).json({
      status: 'error',
      message: 'Check-out can only be processed on the check-out date'
    });
  }

  const updatedBooking = await HotelBooking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'completed',
      checkOutInfo: {
        actualCheckOut: new Date(),
        checkOutStaff: staffName,
        keyCardReturned: true,
        finalBillSettled: true,
        feedbackCollected: true
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Check-out processed successfully',
    data: {
      booking: updatedBooking
    }
  });
});

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
const getBookingStats = asyncHandler(async (req, res) => {
  const { hotelId } = req.query;
  
  let filter = {};
  
  if (hotelId) {
    // Check if user owns the hotel or is admin
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
        message: 'Not authorized to view hotel booking statistics'
      });
    }
    
    filter.hotel = hotelId;
  } else {
    // User's own bookings
    filter.guest = req.user.id;
  }

  const totalBookings = await HotelBooking.countDocuments(filter);
  const confirmedBookings = await HotelBooking.countDocuments({ ...filter, status: 'confirmed' });
  const completedBookings = await HotelBooking.countDocuments({ ...filter, status: 'completed' });
  const cancelledBookings = await HotelBooking.countDocuments({ ...filter, status: 'cancelled' });

  // Get revenue statistics
  const revenueStats = await HotelBooking.aggregate([
    { $match: { ...filter, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  // Get monthly trends
  const monthlyBookings = await HotelBooking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 },
        monthlyTrends: monthlyBookings
      }
    }
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getHotelBookings,
  processCheckIn,
  processCheckOut,
  getBookingStats
};
