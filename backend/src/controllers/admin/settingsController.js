const asyncHandler = require('express-async-handler');
const Settings = require('../../models/Settings');

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      success: true,
      data: {
        platform: settings.platform,
        email: settings.email,
        payment: settings.payment,
        system: settings.system,
        lastUpdated: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
});

// @desc    Update platform settings
// @route   PUT /api/admin/settings/platform
// @access  Private (Admin only)
const updatePlatformSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Update platform settings
    settings.platform = {
      ...settings.platform,
      ...req.body
    };
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully',
      data: settings.platform
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating platform settings'
    });
  }
});

// @desc    Update email settings
// @route   PUT /api/admin/settings/email
// @access  Private (Admin only)
const updateEmailSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Update email settings
    settings.email = {
      ...settings.email,
      ...req.body
    };
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Email settings updated successfully',
      data: settings.email
    });
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email settings'
    });
  }
});

// @desc    Update payment settings
// @route   PUT /api/admin/settings/payment
// @access  Private (Admin only)
const updatePaymentSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Update payment settings
    settings.payment = {
      ...settings.payment,
      ...req.body
    };
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data: settings.payment
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment settings'
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings/system
// @access  Private (Admin only)
const updateSystemSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Update system settings
    settings.system = {
      ...settings.system,
      ...req.body
    };
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: settings.system
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings'
    });
  }
});

// @desc    Reset settings to defaults
// @route   POST /api/admin/settings/reset
// @access  Private (Admin only)
const resetSettings = asyncHandler(async (req, res) => {
  try {
    const { settingsType } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (settingsType === 'platform') {
      settings.platform = new Settings().platform;
    } else if (settingsType === 'email') {
      settings.email = new Settings().email;
    } else if (settingsType === 'payment') {
      settings.payment = new Settings().payment;
    } else if (settingsType === 'system') {
      settings.system = new Settings().system;
    } else {
      // Reset all settings
      settings.platform = new Settings().platform;
      settings.email = new Settings().email;
      settings.payment = new Settings().payment;
      settings.system = new Settings().system;
    }
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: `${settingsType} settings reset to defaults successfully`,
      data: {
        platform: settings.platform,
        email: settings.email,
        payment: settings.payment,
        system: settings.system
      }
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings'
    });
  }
});

module.exports = {
  getSettings,
  updatePlatformSettings,
  updateEmailSettings,
  updatePaymentSettings,
  updateSystemSettings,
  resetSettings
};
