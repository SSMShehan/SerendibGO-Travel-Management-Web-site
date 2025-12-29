// Staff Custom Trip Management Controller
const asyncHandler = require('express-async-handler');
const CustomTrip = require('../../models/CustomTrip');
const User = require('../../models/User');

// @desc    Get all custom trips with filtering and pagination
// @route   GET /api/staff/custom-trips
// @access  Private (Staff)
const getCustomTrips = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      priority = 'all',
      budget = 'all',
      duration = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (priority !== 'all') {
      filter.priority = priority;
    }
    
    if (budget !== 'all') {
      switch (budget) {
        case 'low':
          filter.budget = { $lt: 1000 };
          break;
        case 'medium':
          filter.budget = { $gte: 1000, $lte: 5000 };
          break;
        case 'high':
          filter.budget = { $gt: 5000 };
          break;
      }
    }
    
    if (search) {
      filter.$or = [
        { destination: { $regex: search, $options: 'i' } },
        { specialRequests: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get custom trips with pagination
    const customTrips = await CustomTrip.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customer', 'firstName lastName email phone');

    // Get total count for pagination
    const total = await CustomTrip.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        customTrips,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get custom trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching custom trips'
    });
  }
});

// @desc    Get custom trip statistics
// @route   GET /api/staff/custom-trips/statistics
// @access  Private (Staff)
const getCustomTripStatistics = asyncHandler(async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      inProgressRequests,
      completedRequests
    ] = await Promise.all([
      // Total requests
      CustomTrip.countDocuments(),
      
      // Pending requests
      CustomTrip.countDocuments({ status: 'pending' }),
      
      // Approved requests
      CustomTrip.countDocuments({ status: 'approved' }),
      
      // Rejected requests
      CustomTrip.countDocuments({ status: 'rejected' }),
      
      // In progress requests
      CustomTrip.countDocuments({ status: 'in_progress' }),
      
      // Completed requests
      CustomTrip.countDocuments({ status: 'completed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        inProgress: inProgressRequests,
        completed: completedRequests
      }
    });
  } catch (error) {
    console.error('Get custom trip statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching custom trip statistics'
    });
  }
});

// @desc    Respond to custom trip
// @route   POST /api/staff/custom-trips/:id/respond
// @access  Private (Staff)
const respondToCustomTrip = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, estimatedPrice, suggestedDates, alternativeOptions } = req.body;

    const customTrip = await CustomTrip.findByIdAndUpdate(
      id,
      {
        status,
        staffResponse: {
          message,
          estimatedPrice,
          suggestedDates,
          alternativeOptions,
          respondedBy: req.user.id,
          respondedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate('customer', 'firstName lastName email phone');

    if (!customTrip) {
      return res.status(404).json({
        success: false,
        message: 'Custom trip not found'
      });
    }

    // TODO: Send email notification to customer
    // await emailService.sendCustomTripResponse(customTrip.customer.email, customTrip);

    res.status(200).json({
      success: true,
      data: customTrip,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Respond to custom trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error responding to custom trip'
    });
  }
});

// @desc    Delete custom trip
// @route   DELETE /api/staff/custom-trips/:id
// @access  Private (Staff)
const deleteCustomTrip = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const customTrip = await CustomTrip.findByIdAndDelete(id);

    if (!customTrip) {
      return res.status(404).json({
        success: false,
        message: 'Custom trip not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Custom trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete custom trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting custom trip'
    });
  }
});

// @desc    Bulk custom trip actions
// @route   POST /api/staff/custom-trips/bulk-action
// @access  Private (Staff)
const bulkCustomTripAction = asyncHandler(async (req, res) => {
  try {
    const { tripIds, action } = req.body;

    if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trip IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { 
          status: 'approved',
          staffResponse: {
            respondedBy: req.user.id,
            respondedAt: new Date()
          }
        };
        message = 'Custom trips approved successfully';
        break;
      case 'reject':
        updateData = { 
          status: 'rejected',
          staffResponse: {
            respondedBy: req.user.id,
            respondedAt: new Date()
          }
        };
        message = 'Custom trips rejected successfully';
        break;
      case 'delete':
        await CustomTrip.deleteMany({ _id: { $in: tripIds } });
        return res.status(200).json({
          success: true,
          message: 'Custom trips deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await CustomTrip.updateMany(
      { _id: { $in: tripIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message
    });
  } catch (error) {
    console.error('Bulk custom trip action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing bulk action'
    });
  }
});

module.exports = {
  getCustomTrips,
  getCustomTripStatistics,
  respondToCustomTrip,
  deleteCustomTrip,
  bulkCustomTripAction
};
