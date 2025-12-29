const { asyncHandler } = require('../../middleware/errorHandler');
const { body } = require('express-validator');
const User = require('../../models/User');

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private (Admin only)
const getStaff = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    // Build filter object
    const filter = { role: 'staff' };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get staff with pagination
    const staff = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        staff,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff members'
    });
  }
});

// @desc    Get staff statistics
// @route   GET /api/admin/staff/stats
// @access  Private (Admin only)
const getStaffStats = asyncHandler(async (req, res) => {
  try {
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const activeStaff = await User.countDocuments({ role: 'staff', isActive: true });
    const inactiveStaff = await User.countDocuments({ role: 'staff', isActive: false });
    const verifiedStaff = await User.countDocuments({ role: 'staff', isVerified: true });
    const unverifiedStaff = await User.countDocuments({ role: 'staff', isVerified: false });

    // Get recent staff registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStaff = await User.countDocuments({
      role: 'staff',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get staff performance metrics
    const staffPerformance = await User.aggregate([
      {
        $match: { role: 'staff' }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalTasks: { $sum: '$profile.completedTasks' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        inactiveStaff,
        verifiedStaff,
        unverifiedStaff,
        recentStaff,
        performance: staffPerformance.length > 0 ? staffPerformance[0] : {
          averageRating: 0,
          totalTasks: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff statistics'
    });
  }
});

// @desc    Get single staff member
// @route   GET /api/admin/staff/:id
// @access  Private (Admin only)
const getStaffMember = asyncHandler(async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    }).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff member'
    });
  }
});

// @desc    Create new staff member
// @route   POST /api/admin/staff
// @access  Private (Admin only)
const createStaff = asyncHandler(async (req, res) => {
  try {
    console.log('Creating staff with data:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      profile = {},
      isActive = true,
      isVerified = true
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new staff member
    const staff = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'staff',
      isVerified,
      isActive,
      profile
    });

    await staff.save();

    // Remove password from response
    staff.password = undefined;

    res.status(201).json({
      success: true,
      data: staff,
      message: 'Staff member created successfully'
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff member'
    });
  }
});

// @desc    Update staff member
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin only)
const updateStaff = asyncHandler(async (req, res) => {
  try {
    console.log('Updating staff with data:', req.body);
    console.log('Staff ID:', req.params.id);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      isActive,
      isVerified,
      profile
    } = req.body;

    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update fields
    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    if (email) staff.email = email;
    if (phone) staff.phone = phone;
    if (typeof isActive === 'boolean') staff.isActive = isActive;
    if (typeof isVerified === 'boolean') staff.isVerified = isVerified;
    if (profile) staff.profile = { ...staff.profile, ...profile };

    console.log('Staff before save:', staff);
    await staff.save();
    console.log('Staff saved successfully');

    // Remove password from response
    staff.password = undefined;

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin only)
const deleteStaff = asyncHandler(async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member'
    });
  }
});

// @desc    Toggle staff status
// @route   PATCH /api/admin/staff/:id/toggle-status
// @access  Private (Admin only)
const toggleStaffStatus = asyncHandler(async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      role: 'staff' 
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    res.status(200).json({
      success: true,
      data: {
        isActive: staff.isActive
      },
      message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling staff status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff status'
    });
  }
});

module.exports = {
  getStaff,
  getStaffStats,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus
};
