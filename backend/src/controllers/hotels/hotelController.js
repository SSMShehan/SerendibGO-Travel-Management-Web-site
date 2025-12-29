const Hotel = require('../../models/hotels/Hotel');
const Room = require('../../models/hotels/Room');
const HotelBooking = require('../../models/hotels/HotelBooking');
const { asyncHandler } = require('../../middleware/errorHandler');

// @desc    Get all hotels with filtering and pagination
// @route   GET /api/hotels
// @access  Public
const getHotels = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    city,
    district,
    category,
    starRating,
    minPrice,
    maxPrice,
    amenities,
    area,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  // Build filter object
  const filter = { status: 'approved', isActive: true };

  if (city) filter['location.city'] = city;
  if (district) filter['location.district'] = district;
  if (category) filter.category = category;
  if (starRating) filter.starRating = { $gte: parseInt(starRating) };
  if (area) filter['location.area'] = area;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'location.district': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Execute query with pagination
  const hotels = await Hotel.find(filter)
    .populate('owner', 'firstName lastName email phone')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  // Get total count for pagination
  const total = await Hotel.countDocuments(filter);

  // Filter by price range if specified
  let filteredHotels = hotels;
  if (minPrice || maxPrice) {
    filteredHotels = hotels.filter(hotel => {
      const avgPrice = hotel.averageRoomPrice;
      if (minPrice && avgPrice < parseFloat(minPrice)) return false;
      if (maxPrice && avgPrice > parseFloat(maxPrice)) return false;
      return true;
    });
  }

  // Filter by amenities if specified
  if (amenities) {
    const amenityList = amenities.split(',');
    filteredHotels = filteredHotels.filter(hotel => {
      return amenityList.every(amenity => {
        const amenityKey = amenity.trim();
        return hotel.amenities[amenityKey] === true;
      });
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      hotels: filteredHotels,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate('owner', 'firstName lastName email phone')
    .populate('roomTypes')
    .select('-__v');

  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  // Get available rooms for the hotel
  const rooms = await Room.find({ 
    hotel: req.params.id, 
    status: 'active' 
  }).select('-__v');

  res.status(200).json({
    status: 'success',
    data: {
      hotel,
      rooms
    }
  });
});

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Owner)
const createHotel = asyncHandler(async (req, res) => {
  // Add owner to request body
  req.body.owner = req.user.id;

  const hotel = await Hotel.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Hotel created successfully',
    data: {
      hotel
    }
  });
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Owner)
const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this hotel'
    });
  }

  // If hotel is approved, major changes require re-approval
  if (hotel.status === 'approved' && req.body.name) {
    req.body.status = 'pending';
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Hotel updated successfully',
    data: {
      hotel: updatedHotel
    }
  });
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Owner/Admin)
const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this hotel'
    });
  }

  await Hotel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Hotel deleted successfully'
  });
});

// @desc    Get hotels by owner
// @route   GET /api/hotels/owner/my-hotels
// @access  Private (Hotel Owner)
const getMyHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ owner: req.user.id })
    .populate('roomTypes')
    .sort({ createdAt: -1 })
    .select('-__v');

  res.status(200).json({
    status: 'success',
    data: {
      hotels
    }
  });
});

// @desc    Search hotels by location
// @route   GET /api/hotels/search/location
// @access  Public
const searchHotelsByLocation = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, limit = 20 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      status: 'error',
      message: 'Latitude and longitude are required'
    });
  }

  const hotels = await Hotel.find({
    status: 'approved',
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  })
  .limit(parseInt(limit))
  .select('name location images ratings starRating category averageRoomPrice');

  res.status(200).json({
    status: 'success',
    data: {
      hotels
    }
  });
});

// @desc    Get hotel statistics
// @route   GET /api/hotels/:id/stats
// @access  Private (Hotel Owner/Admin)
const getHotelStats = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  // Check if user owns the hotel or is admin
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view hotel statistics'
    });
  }

  // Get booking statistics
  const totalBookings = await HotelBooking.countDocuments({ hotel: req.params.id });
  const confirmedBookings = await HotelBooking.countDocuments({ 
    hotel: req.params.id, 
    status: 'confirmed' 
  });
  const completedBookings = await HotelBooking.countDocuments({ 
    hotel: req.params.id, 
    status: 'completed' 
  });

  // Get revenue statistics
  const revenueStats = await HotelBooking.aggregate([
    { $match: { hotel: req.params.id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  // Get monthly booking trends
  const monthlyBookings = await HotelBooking.aggregate([
    { $match: { hotel: req.params.id } },
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
        revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 },
        monthlyTrends: monthlyBookings
      }
    }
  });
});

// @desc    Approve/Reject hotel
// @route   PUT /api/hotels/:id/approve
// @access  Private (Admin)
const approveHotel = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to approve hotels'
    });
  }

  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json({
      status: 'error',
      message: 'Hotel not found'
    });
  }

  const updateData = { status };
  
  if (status === 'approved') {
    updateData.approvalDate = new Date();
  } else if (status === 'rejected') {
    updateData.rejectionReason = rejectionReason;
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: `Hotel ${status} successfully`,
    data: {
      hotel: updatedHotel
    }
  });
});

// @desc    Get pending hotels for approval
// @route   GET /api/hotels/pending
// @access  Private (Admin)
const getPendingHotels = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to view pending hotels'
    });
  }

  const hotels = await Hotel.find({ status: 'pending' })
    .populate('owner', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .select('-__v');

  res.status(200).json({
    status: 'success',
    data: {
      hotels
    }
  });
});

// @desc    Get single room from hotel
// @route   GET /api/hotels/:id/rooms/:roomId
// @access  Public
const getRoomFromHotel = asyncHandler(async (req, res) => {
  const { id: hotelId, roomId } = req.params;

  console.log('getRoomFromHotel - hotelId:', hotelId, 'roomId:', roomId);

  // Find the room in the hotel
  const room = await Room.findOne({ 
    _id: roomId, 
    hotel: hotelId 
  }).populate('hotel', 'name location contact');

  console.log('Room found:', room ? 'YES' : 'NO');

  if (!room) {
    return res.status(404).json({
      status: 'error',
      message: 'Room not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: room
  });
});

module.exports = {
  getHotels,
  getHotel,
  getRoomFromHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getMyHotels,
  searchHotelsByLocation,
  getHotelStats,
  approveHotel,
  getPendingHotels
};
