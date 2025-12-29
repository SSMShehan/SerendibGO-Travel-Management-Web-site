// Staff Hotel Management Controller
const asyncHandler = require('express-async-handler');
const Hotel = require('../../models/hotels/Hotel');
const Room = require('../../models/hotels/Room');
const Booking = require('../../models/Booking');
const User = require('../../models/User');

// @desc    Get all hotels with filtering and pagination
// @route   GET /api/staff/hotels
// @access  Private (Staff)
const getHotels = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      location = 'all',
      rating = 'all',
      priceRange = 'all',
      amenities = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (location !== 'all') {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (rating !== 'all') {
      switch (rating) {
        case '5':
          filter['ratings.overall'] = { $gte: 5 };
          break;
        case '4':
          filter['ratings.overall'] = { $gte: 4, $lt: 5 };
          break;
        case '3':
          filter['ratings.overall'] = { $gte: 3, $lt: 4 };
          break;
        case '2':
          filter['ratings.overall'] = { $gte: 2, $lt: 3 };
          break;
        case '1':
          filter['ratings.overall'] = { $gte: 1, $lt: 2 };
          break;
      }
    }
    
    if (priceRange !== 'all') {
      // Handle price range filtering based on room types
      switch (priceRange) {
        case 'budget':
          filter['roomTypes.basePrice'] = { $lte: 10000 };
          break;
        case 'mid':
          filter['roomTypes.basePrice'] = { $gt: 10000, $lte: 25000 };
          break;
        case 'luxury':
          filter['roomTypes.basePrice'] = { $gt: 25000 };
          break;
      }
    }
    
    if (amenities !== 'all') {
      filter[`amenities.${amenities}`] = true;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get hotels with pagination
    const hotels = await Hotel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'firstName lastName email phone');

    // Get total count for pagination
    const total = await Hotel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        hotels,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hotels',
      error: error.message
    });
  }
});

// @desc    Get hotel statistics
// @route   GET /api/staff/hotels/statistics
// @access  Private (Staff)
const getHotelStatistics = asyncHandler(async (req, res) => {
  try {
    const [
      totalHotels,
      activeHotels,
      pendingHotels,
      inactiveHotels,
      totalRooms,
      totalBookings
    ] = await Promise.all([
      // Total hotels
      Hotel.countDocuments(),
      
      // Active hotels
      Hotel.countDocuments({ status: 'active' }),
      
      // Pending hotels
      Hotel.countDocuments({ status: 'pending' }),
      
      // Inactive hotels
      Hotel.countDocuments({ status: 'inactive' }),
      
      // Total rooms
      Room.countDocuments(),
      
      // Total hotel bookings
      Booking.countDocuments({ type: 'hotel' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalHotels,
        active: activeHotels,
        pending: pendingHotels,
        inactive: inactiveHotels,
        totalRooms,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Get hotel statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hotel statistics'
    });
  }
});

// @desc    Create new hotel
// @route   POST /api/staff/hotels
// @access  Private (Staff)
const createHotel = asyncHandler(async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'pending' // Default to pending for staff approval
    };

    const hotel = await Hotel.create(hotelData);

    res.status(201).json({
      success: true,
      data: hotel,
      message: 'Hotel created successfully'
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating hotel'
    });
  }
});

// @desc    Update hotel
// @route   PUT /api/staff/hotels/:id
// @access  Private (Staff)
const updateHotel = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email phone');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
      message: 'Hotel updated successfully'
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating hotel',
      error: error.message
    });
  }
});

// @desc    Delete hotel
// @route   DELETE /api/staff/hotels/:id
// @access  Private (Staff)
const deleteHotel = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if hotel has active bookings
    const activeBookings = await Booking.countDocuments({
      hotel: id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hotel with active bookings'
      });
    }

    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Also delete associated rooms
    await Room.deleteMany({ hotel: id });

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting hotel'
    });
  }
});

// @desc    Bulk hotel actions
// @route   POST /api/staff/hotels/bulk-action
// @access  Private (Staff)
const bulkHotelAction = asyncHandler(async (req, res) => {
  try {
    const { hotelIds, action } = req.body;

    if (!hotelIds || !Array.isArray(hotelIds) || hotelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hotel IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { status: 'active' };
        message = 'Hotels activated successfully';
        break;
      case 'deactivate':
        updateData = { status: 'inactive' };
        message = 'Hotels deactivated successfully';
        break;
      case 'approve':
        updateData = { status: 'approved' };
        message = 'Hotels approved successfully';
        break;
      case 'reject':
        updateData = { status: 'rejected' };
        message = 'Hotels rejected successfully';
        break;
      case 'delete':
        // Check for active bookings before deletion
        const activeBookings = await Booking.countDocuments({
          hotel: { $in: hotelIds },
          status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete hotels with active bookings'
          });
        }

        await Hotel.deleteMany({ _id: { $in: hotelIds } });
        await Room.deleteMany({ hotel: { $in: hotelIds } });
        
        return res.status(200).json({
          success: true,
          message: 'Hotels deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Hotel.updateMany(
      { _id: { $in: hotelIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message
    });
  } catch (error) {
    console.error('Bulk hotel action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing bulk action'
    });
  }
});

module.exports = {
  getHotels,
  getHotelStatistics,
  createHotel,
  updateHotel,
  deleteHotel,
  bulkHotelAction
};
