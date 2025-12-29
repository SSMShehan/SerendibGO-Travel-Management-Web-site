const asyncHandler = require('express-async-handler');
const ExternalBookingIntegration = require('../../models/vehicles/ExternalBookingIntegration');
const Vehicle = require('../../models/Vehicle');

// @desc    Get all external booking integrations for a vehicle
// @route   GET /api/vehicles/:vehicleId/integrations
// @access  Private (Vehicle Owner)
const getVehicleIntegrations = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { platform, status, integrationType } = req.query;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this vehicle');
  }

  let query = { vehicle: vehicleId };

  if (platform) {
    query.platform = platform;
  }

  if (status) {
    query.status = status;
  }

  if (integrationType) {
    query.integrationType = integrationType;
  }

  const integrations = await ExternalBookingIntegration.find(query)
    .sort({ createdAt: -1 })
    .populate('vehicle', 'name make model type');

  res.status(200).json({
    status: 'success',
    data: { integrations }
  });
});

// @desc    Create a new external booking integration
// @route   POST /api/vehicles/:vehicleId/integrations
// @access  Private (Vehicle Owner)
const createIntegration = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const integrationData = req.body;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Check if integration already exists for this platform
  const existingIntegration = await ExternalBookingIntegration.findOne({
    vehicle: vehicleId,
    platform: integrationData.platform
  });

  if (existingIntegration) {
    res.status(400);
    throw new Error('Integration already exists for this platform');
  }

  // Create integration
  const integration = await ExternalBookingIntegration.create({
    vehicle: vehicleId,
    owner: req.user.id,
    ...integrationData
  });

  res.status(201).json({
    status: 'success',
    message: 'External booking integration created successfully',
    data: { integration }
  });
});

// @desc    Update an external booking integration
// @route   PUT /api/vehicles/:vehicleId/integrations/:integrationId
// @access  Private (Vehicle Owner)
const updateIntegration = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;
  const updateData = req.body;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Find and update integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  const updatedIntegration = await ExternalBookingIntegration.findByIdAndUpdate(
    integrationId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Integration updated successfully',
    data: { integration: updatedIntegration }
  });
});

// @desc    Delete an external booking integration
// @route   DELETE /api/vehicles/:vehicleId/integrations/:integrationId
// @access  Private (Vehicle Owner)
const deleteIntegration = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Find and delete integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  await ExternalBookingIntegration.findByIdAndDelete(integrationId);

  res.status(200).json({
    status: 'success',
    message: 'Integration deleted successfully'
  });
});

// @desc    Test integration connection
// @route   POST /api/vehicles/:vehicleId/integrations/:integrationId/test
// @access  Private (Vehicle Owner)
const testIntegration = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Find integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  try {
    const testResult = await ExternalBookingIntegration.testConnection(integrationId);
    res.status(200).json({
      status: 'success',
      data: testResult
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Sync integration
// @route   POST /api/vehicles/:vehicleId/integrations/:integrationId/sync
// @access  Private (Vehicle Owner)
const syncIntegration = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Find integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  try {
    const syncResult = await ExternalBookingIntegration.syncIntegration(integrationId);
    res.status(200).json({
      status: 'success',
      data: syncResult
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Toggle integration status
// @route   PATCH /api/vehicles/:vehicleId/integrations/:integrationId/toggle
// @access  Private (Vehicle Owner)
const toggleIntegration = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Find and toggle integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  integration.status = integration.status === 'active' ? 'inactive' : 'active';
  await integration.save();

  res.status(200).json({
    status: 'success',
    message: `Integration ${integration.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: { integration }
  });
});

// @desc    Get integration analytics
// @route   GET /api/vehicles/:vehicleId/integrations/:integrationId/analytics
// @access  Private (Vehicle Owner)
const getIntegrationAnalytics = asyncHandler(async (req, res) => {
  const { vehicleId, integrationId } = req.params;
  const { period = 'month' } = req.query;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this vehicle');
  }

  // Find integration
  const integration = await ExternalBookingIntegration.findById(integrationId);
  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  if (integration.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Integration does not belong to this vehicle');
  }

  // Calculate analytics based on period
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      break;
    case 'month':
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      break;
    case 'year':
      startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      break;
    default:
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  }

  const analytics = {
    period,
    startDate,
    endDate: now,
    statistics: integration.statistics,
    successRate: integration.successRate,
    syncStatus: {
      lastSync: integration.lastSync,
      syncStatus: integration.syncStatus,
      syncError: integration.syncError,
      needsSync: integration.needsSync
    },
    performance: {
      totalBookings: integration.statistics.totalBookings,
      successfulBookings: integration.statistics.successfulBookings,
      failedBookings: integration.statistics.failedBookings,
      successRate: integration.successRate,
      averageRating: integration.statistics.averageRating
    },
    revenue: {
      totalRevenue: integration.statistics.totalRevenue,
      platformCommission: integration.statistics.platformCommission,
      netRevenue: integration.statistics.totalRevenue - integration.statistics.platformCommission
    },
    webhooks: integration.webhooks.map(webhook => ({
      event: webhook.event,
      isActive: webhook.isActive,
      lastTriggered: webhook.lastTriggered,
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      successRate: webhook.successCount + webhook.failureCount > 0 
        ? (webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100 
        : 0
    })),
    apiEndpoints: integration.apiEndpoints.map(endpoint => ({
      name: endpoint.name,
      isActive: endpoint.isActive,
      lastUsed: endpoint.lastUsed,
      successCount: endpoint.successCount,
      failureCount: endpoint.failureCount,
      successRate: endpoint.successCount + endpoint.failureCount > 0 
        ? (endpoint.successCount / (endpoint.successCount + endpoint.failureCount)) * 100 
        : 0
    }))
  };

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

// @desc    Get available platforms
// @route   GET /api/vehicles/integrations/platforms
// @access  Public
const getAvailablePlatforms = asyncHandler(async (req, res) => {
  const platforms = [
    {
      id: 'uber',
      name: 'Uber',
      description: 'Uber ride-sharing platform',
      logo: '/platforms/uber.png',
      supportedFeatures: ['api', 'webhook', 'realtime'],
      commissionRate: '15-25%',
      integrationType: 'api'
    },
    {
      id: 'lyft',
      name: 'Lyft',
      description: 'Lyft ride-sharing platform',
      logo: '/platforms/lyft.png',
      supportedFeatures: ['api', 'webhook', 'realtime'],
      commissionRate: '15-25%',
      integrationType: 'api'
    },
    {
      id: 'grab',
      name: 'Grab',
      description: 'Grab ride-sharing platform',
      logo: '/platforms/grab.png',
      supportedFeatures: ['api', 'webhook', 'realtime'],
      commissionRate: '15-25%',
      integrationType: 'api'
    },
    {
      id: 'ola',
      name: 'Ola',
      description: 'Ola ride-sharing platform',
      logo: '/platforms/ola.png',
      supportedFeatures: ['api', 'webhook', 'realtime'],
      commissionRate: '15-25%',
      integrationType: 'api'
    },
    {
      id: 'bolt',
      name: 'Bolt',
      description: 'Bolt ride-sharing platform',
      logo: '/platforms/bolt.png',
      supportedFeatures: ['api', 'webhook', 'realtime'],
      commissionRate: '15-25%',
      integrationType: 'api'
    },
    {
      id: 'custom',
      name: 'Custom Platform',
      description: 'Custom booking platform integration',
      logo: '/platforms/custom.png',
      supportedFeatures: ['api', 'webhook', 'csv', 'xml'],
      commissionRate: 'Variable',
      integrationType: 'api'
    }
  ];

  res.status(200).json({
    status: 'success',
    data: { platforms }
  });
});

// @desc    Bulk sync all integrations
// @route   POST /api/vehicles/:vehicleId/integrations/sync-all
// @access  Private (Vehicle Owner)
const syncAllIntegrations = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  // Verify vehicle ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this vehicle');
  }

  // Get all active integrations for this vehicle
  const integrations = await ExternalBookingIntegration.find({
    vehicle: vehicleId,
    status: 'active'
  });

  const syncResults = [];

  for (const integration of integrations) {
    try {
      const result = await ExternalBookingIntegration.syncIntegration(integration._id);
      syncResults.push({
        integrationId: integration._id,
        platform: integration.platform,
        success: true,
        result
      });
    } catch (error) {
      syncResults.push({
        integrationId: integration._id,
        platform: integration.platform,
        success: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Bulk sync completed',
    data: { syncResults }
  });
});

module.exports = {
  getVehicleIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  toggleIntegration,
  getIntegrationAnalytics,
  getAvailablePlatforms,
  syncAllIntegrations
};
