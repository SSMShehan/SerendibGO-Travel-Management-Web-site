// Staff User Management Routes
const express = require('express');
const router = express.Router();
const { staffAuth, requirePermission } = require('../../middleware/staffAuth');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');
const { asyncHandler } = require('../../middleware/errorHandler');

// Apply staff authentication middleware to all routes
router.use(staffAuth);

// @desc    Get all users (drivers, guides, etc.)
// @route   GET /api/staff/users
// @access  Private (Staff)
router.get('/', requirePermission('users', 'read'), asyncHandler(async (req, res) => {
  const { role, status, verificationStatus, search, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (status && status !== 'all') {
    if (status === 'needs-approval') {
      // For needs-approval, we need to find users who have vehicles that need approval
      const vehiclesNeedingApproval = await Vehicle.find({
        'approvalDetails.needsApproval': true
      }).select('driver owner');
      
      const userIds = vehiclesNeedingApproval.map(v => v.driver || v.owner).filter(Boolean);
      filter._id = { $in: userIds };
    } else {
      filter.status = status;
    }
  }
  
  if (verificationStatus && verificationStatus !== 'all') {
    filter.isVerified = verificationStatus === 'verified';
  }
  
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get users with pagination
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await User.countDocuments(filter);
  
  // Get vehicle count for each user
  const usersWithVehicleCount = await Promise.all(
    users.map(async (user) => {
      const vehicleCount = await Vehicle.countDocuments({
        $or: [
          { driver: user._id },
          { owner: user._id }
        ]
      });
      
      return {
        ...user.toObject(),
        vehicleCount
      };
    })
  );
  
  res.json({
    success: true,
    data: {
      users: usersWithVehicleCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
}));

// @desc    Get user details
// @route   GET /api/staff/users/:id
// @access  Private (Staff)
router.get('/:id', requirePermission('users', 'read'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get vehicle count
  const vehicleCount = await Vehicle.countDocuments({
    driver: user._id
  });
  
  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        vehicleCount
      }
    }
  });
}));

// @desc    Update user status (approve/reject/suspend)
// @route   PUT /api/staff/users/:id/status
// @access  Private (Staff)
router.put('/:id/status', requirePermission('users', 'approve'), asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  let updateData = {};
  
  switch (action) {
    case 'approve':
      updateData = {
        status: 'active',
        isVerified: true,
        verificationStatus: 'approved',
        verifiedAt: new Date(),
        verifiedBy: req.user._id
      };
      break;
    case 'reject':
      updateData = {
        status: 'rejected',
        isVerified: false,
        verificationStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.user._id
      };
      break;
    case 'suspend':
      updateData = {
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: req.user._id
      };
      break;
    case 'activate':
      updateData = {
        status: 'active',
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null
      };
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    message: `User ${action}d successfully`,
    data: {
      user: updatedUser
    }
  });
}));

// @desc    Get user's vehicles
// @route   GET /api/staff/users/:id/vehicles
// @access  Private (Staff)
router.get('/:id/vehicles', requirePermission('users', 'read'), asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get vehicles driven by or owned by this user
  const vehicles = await Vehicle.find({
    $or: [
      { driver: userId },
      { owner: userId }
    ]
  }).populate('driver', 'firstName lastName email phone').populate('owner', 'firstName lastName email phone');
  
  res.json({
    success: true,
    data: {
      vehicles
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/staff/users/:id
// @access  Private (Staff)
router.put('/:id', requirePermission('users', 'write'), asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role, status } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (status) updateData.status = status;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    }
  });
}));

// @desc    Delete user
// @route   DELETE /api/staff/users/:id
// @access  Private (Staff)
router.delete('/:id', requirePermission('users', 'delete'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if user has vehicles
  const vehicleCount = await Vehicle.countDocuments({
    driver: user._id
  });
  
  if (vehicleCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with associated vehicles. Please transfer or delete vehicles first.'
    });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

module.exports = router;


