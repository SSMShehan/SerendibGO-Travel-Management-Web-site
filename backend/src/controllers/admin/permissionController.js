const { asyncHandler } = require('../../middleware/errorHandler');
const User = require('../../models/User');

// Mock permission templates (in a real app, this would be stored in database)
const PERMISSION_TEMPLATES = [
  {
    _id: 'template1',
    name: 'Manager Template',
    description: 'Full access to all modules and features.',
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      bookings: { view: true, create: true, edit: true, delete: true },
      vehicles: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template2',
    name: 'Staff Template',
    description: 'Limited access for general staff operations.',
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      bookings: { view: true, create: false, edit: true, delete: false },
      vehicles: { view: true, create: true, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// @desc    Get all permission templates
// @route   GET /api/admin/permissions/templates
// @access  Private (Admin only)
const getPermissionTemplates = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        templates: PERMISSION_TEMPLATES
      }
    });
  } catch (error) {
    console.error('Error fetching permission templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permission templates'
    });
  }
});

// @desc    Create a new permission template
// @route   POST /api/admin/permissions/templates
// @access  Private (Admin only)
const createPermissionTemplate = asyncHandler(async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const newTemplate = {
      _id: `template${Date.now()}`,
      name,
      description,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    PERMISSION_TEMPLATES.push(newTemplate);

    res.status(201).json({
      success: true,
      data: {
        template: newTemplate
      },
      message: 'Permission template created successfully'
    });
  } catch (error) {
    console.error('Error creating permission template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission template'
    });
  }
});

// @desc    Update a permission template
// @route   PUT /api/admin/permissions/templates/:id
// @access  Private (Admin only)
const updatePermissionTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const templateIndex = PERMISSION_TEMPLATES.findIndex(t => t._id === id);
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Permission template not found'
      });
    }

    PERMISSION_TEMPLATES[templateIndex] = {
      ...PERMISSION_TEMPLATES[templateIndex],
      name,
      description,
      permissions,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: {
        template: PERMISSION_TEMPLATES[templateIndex]
      },
      message: 'Permission template updated successfully'
    });
  } catch (error) {
    console.error('Error updating permission template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permission template'
    });
  }
});

// @desc    Delete a permission template
// @route   DELETE /api/admin/permissions/templates/:id
// @access  Private (Admin only)
const deletePermissionTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const templateIndex = PERMISSION_TEMPLATES.findIndex(t => t._id === id);
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Permission template not found'
      });
    }

    PERMISSION_TEMPLATES.splice(templateIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Permission template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission template'
    });
  }
});

// @desc    Get staff permissions
// @route   GET /api/admin/permissions/staff
// @access  Private (Admin only)
const getStaffPermissions = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    // Build filter object for staff members
    const filter = { 
      role: { $in: ['staff', 'manager', 'support_staff'] }
    };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get staff with permissions
    const staff = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform staff data to include permissions
    const staffWithPermissions = staff.map(member => {
      const permissions = member.profile?.permissions || [];
      
      // Convert permissions array to object format
      const permissionObj = {
        users: { view: false, create: false, edit: false, delete: false },
        bookings: { view: false, create: false, edit: false, delete: false },
        vehicles: { view: false, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false }
      };

      permissions.forEach(perm => {
        if (permissionObj[perm.module]) {
          perm.actions.forEach(action => {
            if (permissionObj[perm.module][action] !== undefined) {
              permissionObj[perm.module][action] = true;
            }
          });
        }
      });

      return {
        _id: member._id,
        staffId: member._id,
        staffName: `${member.firstName} ${member.lastName}`,
        role: member.role,
        email: member.email,
        phone: member.phone,
        isActive: member.isActive,
        permissions: permissionObj
      };
    });

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        staff: staffWithPermissions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching staff permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff permissions'
    });
  }
});

// @desc    Update staff permissions
// @route   PUT /api/admin/permissions/staff/:id
// @access  Private (Admin only)
const updateStaffPermissions = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Convert permissions object to array format
    const permissionArray = [];
    Object.entries(permissions).forEach(([module, actions]) => {
      const actionArray = Object.entries(actions)
        .filter(([action, allowed]) => allowed)
        .map(([action]) => action);
      
      if (actionArray.length > 0) {
        permissionArray.push({
          module,
          actions: actionArray
        });
      }
    });

    // Update staff permissions
    staff.profile = staff.profile || {};
    staff.profile.permissions = permissionArray;
    await staff.save();

    res.status(200).json({
      success: true,
      data: {
        staff: {
          _id: staff._id,
          staffId: staff._id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          permissions: permissions
        }
      },
      message: 'Staff permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff permissions'
    });
  }
});

// @desc    Apply permission template to staff
// @route   POST /api/admin/permissions/apply-template
// @access  Private (Admin only)
const applyPermissionTemplate = asyncHandler(async (req, res) => {
  try {
    console.log('Apply template request body:', req.body);
    const { templateId, staffIds } = req.body;

    // Validate input
    if (!templateId || !staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data. templateId and staffIds array are required.'
      });
    }

    // Find the template
    const template = PERMISSION_TEMPLATES.find(t => t._id === templateId);
    if (!template) {
      console.log('Template not found:', templateId);
      return res.status(404).json({
        success: false,
        message: 'Permission template not found'
      });
    }

    console.log('Found template:', template.name);

    // Convert template permissions to array format
    const permissionArray = [];
    Object.entries(template.permissions).forEach(([module, actions]) => {
      const actionArray = Object.entries(actions)
        .filter(([action, allowed]) => allowed)
        .map(([action]) => action);
      
      if (actionArray.length > 0) {
        permissionArray.push({
          module,
          actions: actionArray
        });
      }
    });

    console.log('Permission array:', permissionArray);

    // Update staff members
    const updatePromises = staffIds.map(async (staffId) => {
      console.log('Updating staff member:', staffId);
      try {
        const result = await User.findByIdAndUpdate(
          staffId,
          { 
            $set: { 
              'profile.permissions': permissionArray 
            } 
          },
          { new: true }
        );
        if (!result) {
          console.log('Staff member not found:', staffId);
          throw new Error(`Staff member with ID ${staffId} not found`);
        }
        return result;
      } catch (error) {
        console.error('Error updating staff member:', staffId, error.message);
        throw error;
      }
    });

    const results = await Promise.all(updatePromises);
    console.log('Update results:', results.length);

    res.status(200).json({
      success: true,
      message: `Template "${template.name}" applied to ${staffIds.length} staff members successfully`
    });
  } catch (error) {
    console.error('Error applying permission template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply permission template',
      error: error.message
    });
  }
});

module.exports = {
  getPermissionTemplates,
  createPermissionTemplate,
  updatePermissionTemplate,
  deletePermissionTemplate,
  getStaffPermissions,
  updateStaffPermissions,
  applyPermissionTemplate
};
