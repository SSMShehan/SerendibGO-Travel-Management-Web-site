// Staff Approval Controller
const { asyncHandler } = require('../../middleware/errorHandler');
const User = require('../../models/User');
const Driver = require('../../models/vehicles/Driver');
const { staffAuth, requirePermission, logActivity } = require('../../middleware/staffAuth');

// @desc    Get pending approvals
// @route   GET /api/staff/approvals/pending
// @access  Private (Staff)
const getPendingApprovals = asyncHandler(async (req, res) => {
  try {
    const { type, page = 1, limit = 10, search } = req.query;
    
    let filter = { isVerified: false };
    
    // Filter by type if specified
    if (type) {
      filter.role = type;
    } else {
      // Default to all service providers
      filter.role = { $in: ['guide', 'hotel_owner', 'driver'] };
    }
    
    // Add search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get pending approvals
    const approvals = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    // Get counts by type
    const counts = {
      guides: await User.countDocuments({ role: 'guide', isVerified: false }),
      hotels: await User.countDocuments({ role: 'hotel_owner', isVerified: false }),
      vehicles: await User.countDocuments({ role: 'driver', isVerified: false }),
      total: await User.countDocuments({ 
        role: { $in: ['guide', 'hotel_owner', 'driver'] },
        isVerified: false 
      })
    };
    
    res.status(200).json({
      success: true,
      data: {
        approvals,
        counts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending approvals'
    });
  }
});

// @desc    Get single approval details
// @route   GET /api/staff/approvals/:id
// @access  Private (Staff)
const getApprovalDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is a service provider
    const serviceProviderRoles = ['guide', 'hotel_owner', 'driver'];
    if (!serviceProviderRoles.includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a service provider'
      });
    }
    
    // Get additional data based on role
    let additionalData = {};
    
    if (user.role === 'guide') {
      additionalData = {
        languages: user.profile?.languages || [],
        experience: user.profile?.experience || 0,
        specialties: user.profile?.specialties || [],
        certifications: user.profile?.certifications || [],
        bio: user.profile?.bio || '',
        pricePerDay: user.profile?.pricePerDay || 0,
        location: user.profile?.location || '',
        guideLicense: user.profile?.guideLicense || ''
      };
    } else if (user.role === 'hotel_owner') {
      additionalData = {
        hotelName: user.profile?.hotelName || '',
        hotelAddress: user.profile?.hotelAddress || '',
        hotelLicense: user.profile?.hotelLicense || ''
      };
    } else if (user.role === 'driver') {
      additionalData = {
        vehicleType: user.profile?.vehicleType || '',
        vehicleModel: user.profile?.vehicleModel || '',
        vehicleYear: user.profile?.vehicleYear || '',
        licenseNumber: user.profile?.licenseNumber || '',
        vehicleCapacity: user.profile?.vehicleCapacity || 0
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        user,
        additionalData,
        verificationStatus: {
          isVerified: user.isVerified,
          verificationDate: user.verifiedAt,
          verifiedBy: user.verifiedBy
        }
      }
    });
    
  } catch (error) {
    console.error('Get approval details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching approval details'
    });
  }
});

// @desc    Approve service provider
// @route   POST /api/staff/approvals/:id/approve
// @access  Private (Staff)
const approveServiceProvider = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, conditions } = req.body;
    const staffId = req.user._id;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedBy = staffId;
    user.verificationNotes = notes;
    user.verificationConditions = conditions;
    
    await user.save();
    
    // If user is a driver, also update their Driver model status
    if (user.role === 'driver') {
      const driver = await Driver.findOne({ user: user._id });
      if (driver) {
        driver.status = 'active';
        driver.statusHistory.push({
          status: 'active',
          timestamp: new Date(),
          updatedBy: staffId,
          notes: 'Driver approved by staff'
        });
        await driver.save();
        console.log(`Driver ${driver.driverId} status updated to active`);
      }
    }
    
    // Log activity
    console.log(`Staff ${staffId} approved ${user.role} ${user._id}`);
    
    res.status(200).json({
      success: true,
      message: `${user.role} approved successfully`,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verifiedAt: user.verifiedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Approve service provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving service provider'
    });
  }
});

// @desc    Reject service provider
// @route   POST /api/staff/approvals/:id/reject
// @access  Private (Staff)
const rejectServiceProvider = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    const staffId = req.user._id;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }
    
    // Update user rejection status
    user.isVerified = false;
    user.rejectedAt = new Date();
    user.rejectedBy = staffId;
    user.rejectionReason = reason;
    user.rejectionNotes = notes;
    user.isActive = false; // Deactivate rejected users
    
    await user.save();
    
    // Log activity
    console.log(`Staff ${staffId} rejected ${user.role} ${user._id}: ${reason}`);
    
    res.status(200).json({
      success: true,
      message: `${user.role} rejected successfully`,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          rejectedAt: user.rejectedAt,
          rejectionReason: user.rejectionReason
        }
      }
    });
    
  } catch (error) {
    console.error('Reject service provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting service provider'
    });
  }
});

// @desc    Bulk approve service providers
// @route   POST /api/staff/approvals/bulk-approve
// @access  Private (Staff)
const bulkApproveServiceProviders = asyncHandler(async (req, res) => {
  try {
    const { userIds, notes, conditions } = req.body;
    const staffId = req.user._id;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        
        if (!user) {
          results.push({ userId, success: false, message: 'User not found' });
          continue;
        }
        
        if (user.isVerified) {
          results.push({ userId, success: false, message: 'User already verified' });
          continue;
        }
        
        // Update user verification status
        user.isVerified = true;
        user.verifiedAt = new Date();
        user.verifiedBy = staffId;
        user.verificationNotes = notes;
        user.verificationConditions = conditions;
        
        await user.save();
        
        // If user is a driver, also update their Driver model status
        if (user.role === 'driver') {
          const driver = await Driver.findOne({ user: user._id });
          if (driver) {
            driver.status = 'active';
            driver.statusHistory.push({
              status: 'active',
              timestamp: new Date(),
              updatedBy: staffId,
              notes: 'Driver approved by staff (bulk approval)'
            });
            await driver.save();
          }
        }
        
        results.push({ 
          userId, 
          success: true, 
          message: `${user.role} approved successfully`,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
        
      } catch (error) {
        results.push({ userId, success: false, message: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.status(200).json({
      success: true,
      message: `Bulk approval completed: ${successCount} approved, ${failureCount} failed`,
      data: {
        results,
        summary: {
          total: userIds.length,
          successful: successCount,
          failed: failureCount
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in bulk approval'
    });
  }
});

// @desc    Get approval statistics
// @route   GET /api/staff/approvals/statistics
// @access  Private (Staff)
const getApprovalStatistics = asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const statistics = {
      pending: {
        guides: await User.countDocuments({ role: 'guide', isVerified: false }),
        hotels: await User.countDocuments({ role: 'hotel_owner', isVerified: false }),
        vehicles: await User.countDocuments({ role: 'driver', isVerified: false }),
        total: await User.countDocuments({ 
          role: { $in: ['guide', 'hotel_owner', 'driver'] },
          isVerified: false 
        })
      },
      approved: {
        guides: await User.countDocuments({ 
          role: 'guide', 
          isVerified: true,
          verifiedAt: { $gte: startDate }
        }),
        hotels: await User.countDocuments({ 
          role: 'hotel_owner', 
          isVerified: true,
          verifiedAt: { $gte: startDate }
        }),
        vehicles: await User.countDocuments({ 
          role: 'driver', 
          isVerified: true,
          verifiedAt: { $gte: startDate }
        }),
        total: await User.countDocuments({ 
          role: { $in: ['guide', 'hotel_owner', 'driver'] },
          isVerified: true,
          verifiedAt: { $gte: startDate }
        })
      },
      rejected: {
        guides: await User.countDocuments({ 
          role: 'guide', 
          isVerified: false,
          rejectedAt: { $gte: startDate }
        }),
        hotels: await User.countDocuments({ 
          role: 'hotel_owner', 
          isVerified: false,
          rejectedAt: { $gte: startDate }
        }),
        vehicles: await User.countDocuments({ 
          role: 'driver', 
          isVerified: false,
          rejectedAt: { $gte: startDate }
        }),
        total: await User.countDocuments({ 
          role: { $in: ['guide', 'hotel_owner', 'driver'] },
          isVerified: false,
          rejectedAt: { $gte: startDate }
        })
      }
    };
    
    res.status(200).json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error('Get approval statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching approval statistics'
    });
  }
});

module.exports = {
  getPendingApprovals,
  getApprovalDetails,
  approveServiceProvider,
  rejectServiceProvider,
  bulkApproveServiceProviders,
  getApprovalStatistics
};


