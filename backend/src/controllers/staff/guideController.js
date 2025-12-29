// Staff Guide Management Controller
const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const Booking = require('../../models/Booking');

// @desc    Get all guides with filtering and pagination
// @route   GET /api/staff/guides
// @access  Private (Staff)
const getGuides = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      location = 'all',
      rating = 'all',
      experience = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { role: 'guide' };
    
    if (status !== 'all') {
      switch (status) {
        case 'active':
          filter.isActive = true;
          filter.isVerified = true;
          break;
        case 'inactive':
          filter.isActive = false;
          break;
        case 'pending':
          filter.isVerified = false;
          break;
        case 'suspended':
          filter.isActive = false;
          filter.isVerified = true;
          break;
      }
    }
    
    if (location !== 'all') {
      filter['profile.location'] = { $regex: location, $options: 'i' };
    }
    
    if (rating !== 'all') {
      switch (rating) {
        case '5':
          filter['profile.rating'] = { $gte: 5 };
          break;
        case '4':
          filter['profile.rating'] = { $gte: 4, $lt: 5 };
          break;
        case '3':
          filter['profile.rating'] = { $gte: 3, $lt: 4 };
          break;
        case '2':
          filter['profile.rating'] = { $gte: 2, $lt: 3 };
          break;
        case '1':
          filter['profile.rating'] = { $gte: 1, $lt: 2 };
          break;
      }
    }
    
    if (experience !== 'all') {
      switch (experience) {
        case 'beginner':
          filter['profile.experience'] = { $gte: 0, $lt: 2 };
          break;
        case 'intermediate':
          filter['profile.experience'] = { $gte: 2, $lt: 5 };
          break;
        case 'expert':
          filter['profile.experience'] = { $gte: 5 };
          break;
      }
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.location': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get guides with pagination
    const guides = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        guides,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching guides'
    });
  }
});

// @desc    Get guide statistics
// @route   GET /api/staff/guides/statistics
// @access  Private (Staff)
const getGuideStatistics = asyncHandler(async (req, res) => {
  try {
    const [
      totalGuides,
      activeGuides,
      pendingGuides,
      inactiveGuides,
      totalBookings
    ] = await Promise.all([
      // Total guides
      User.countDocuments({ role: 'guide' }),
      
      // Active guides
      User.countDocuments({ role: 'guide', isActive: true, isVerified: true }),
      
      // Pending guides
      User.countDocuments({ role: 'guide', isVerified: false }),
      
      // Inactive guides
      User.countDocuments({ role: 'guide', isActive: false }),
      
      // Total guide bookings
      Booking.countDocuments({ type: 'guide' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalGuides,
        active: activeGuides,
        pending: pendingGuides,
        inactive: inactiveGuides,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Get guide statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching guide statistics'
    });
  }
});

// @desc    Delete guide
// @route   DELETE /api/staff/guides/:id
// @access  Private (Staff)
const deleteGuide = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if guide has active bookings
    const activeBookings = await Booking.countDocuments({
      guide: id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete guide with active bookings'
      });
    }

    const guide = await User.findByIdAndDelete(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting guide'
    });
  }
});

// @desc    Bulk guide actions
// @route   POST /api/staff/guides/bulk-action
// @access  Private (Staff)
const bulkGuideAction = asyncHandler(async (req, res) => {
  try {
    const { guideIds, action } = req.body;

    if (!guideIds || !Array.isArray(guideIds) || guideIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Guide IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true, isVerified: true };
        message = 'Guides activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Guides deactivated successfully';
        break;
      case 'approve':
        updateData = { isVerified: true, isActive: true };
        message = 'Guides approved successfully';
        break;
      case 'reject':
        updateData = { isVerified: false, isActive: false };
        message = 'Guides rejected successfully';
        break;
      case 'delete':
        // Check for active bookings before deletion
        const activeBookings = await Booking.countDocuments({
          guide: { $in: guideIds },
          status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete guides with active bookings'
          });
        }

        await User.deleteMany({ _id: { $in: guideIds } });
        
        return res.status(200).json({
          success: true,
          message: 'Guides deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await User.updateMany(
      { _id: { $in: guideIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message
    });
  } catch (error) {
    console.error('Bulk guide action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing bulk action'
    });
  }
});

module.exports = {
  getGuides,
  getGuideStatistics,
  deleteGuide,
  bulkGuideAction
};
