const asyncHandler = require('express-async-handler');
const VehiclePricing = require('../../models/vehicles/VehiclePricing');
const Vehicle = require('../../models/Vehicle');

// @desc    Get all pricing rules for a vehicle
// @route   GET /api/vehicles/:vehicleId/pricing
// @access  Private (Vehicle Owner)
const getVehiclePricing = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { pricingType, isActive } = req.query;

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

  if (pricingType) {
    query.pricingType = pricingType;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const pricingRules = await VehiclePricing.find(query)
    .sort({ priority: 1, createdAt: -1 })
    .populate('vehicle', 'name make model type');

  res.status(200).json({
    status: 'success',
    data: { pricingRules }
  });
});

// @desc    Create a new pricing rule
// @route   POST /api/vehicles/:vehicleId/pricing
// @access  Private (Vehicle Owner)
const createPricingRule = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const pricingData = req.body;

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

  // Create pricing rule
  const pricingRule = await VehiclePricing.create({
    vehicle: vehicleId,
    owner: req.user.id,
    ...pricingData
  });

  res.status(201).json({
    status: 'success',
    message: 'Pricing rule created successfully',
    data: { pricingRule }
  });
});

// @desc    Update a pricing rule
// @route   PUT /api/vehicles/:vehicleId/pricing/:pricingId
// @access  Private (Vehicle Owner)
const updatePricingRule = asyncHandler(async (req, res) => {
  const { vehicleId, pricingId } = req.params;
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

  // Find and update pricing rule
  const pricingRule = await VehiclePricing.findById(pricingId);
  if (!pricingRule) {
    res.status(404);
    throw new Error('Pricing rule not found');
  }

  if (pricingRule.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Pricing rule does not belong to this vehicle');
  }

  const updatedPricingRule = await VehiclePricing.findByIdAndUpdate(
    pricingId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Pricing rule updated successfully',
    data: { pricingRule: updatedPricingRule }
  });
});

// @desc    Delete a pricing rule
// @route   DELETE /api/vehicles/:vehicleId/pricing/:pricingId
// @access  Private (Vehicle Owner)
const deletePricingRule = asyncHandler(async (req, res) => {
  const { vehicleId, pricingId } = req.params;

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

  // Find and delete pricing rule
  const pricingRule = await VehiclePricing.findById(pricingId);
  if (!pricingRule) {
    res.status(404);
    throw new Error('Pricing rule not found');
  }

  if (pricingRule.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Pricing rule does not belong to this vehicle');
  }

  await VehiclePricing.findByIdAndDelete(pricingId);

  res.status(200).json({
    status: 'success',
    message: 'Pricing rule deleted successfully'
  });
});

// @desc    Calculate price for a booking
// @route   POST /api/vehicles/:vehicleId/pricing/calculate
// @access  Public
const calculatePrice = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { startTime, endTime, distance, location, date } = req.body;

  if (!startTime || !endTime) {
    res.status(400);
    throw new Error('Start time and end time are required');
  }

  // Verify vehicle exists
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.status !== 'active') {
    res.status(400);
    throw new Error('Vehicle is not available for booking');
  }

  try {
    const priceCalculation = await VehiclePricing.calculatePrice(vehicleId, {
      startTime,
      endTime,
      distance: distance || 0,
      location: location || '',
      date: date || new Date()
    });

    res.status(200).json({
      status: 'success',
      data: priceCalculation
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get pricing analytics for a vehicle
// @route   GET /api/vehicles/:vehicleId/pricing/analytics
// @access  Private (Vehicle Owner)
const getPricingAnalytics = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
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

  // Get pricing rules count by type
  const pricingStats = await VehiclePricing.aggregate([
    { $match: { vehicle: vehicle._id } },
    {
      $group: {
        _id: '$pricingType',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        }
      }
    }
  ]);

  // Get pricing rules by priority
  const priorityStats = await VehiclePricing.aggregate([
    { $match: { vehicle: vehicle._id } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
        rules: { $push: '$name' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get seasonal pricing stats
  const seasonalStats = await VehiclePricing.aggregate([
    { $match: { vehicle: vehicle._id, 'seasonalPricing.enabled': true } },
    {
      $unwind: '$seasonalPricing.seasons'
    },
    {
      $group: {
        _id: '$seasonalPricing.seasons.name',
        multiplier: { $first: '$seasonalPricing.seasons.multiplier' },
        startDate: { $first: '$seasonalPricing.seasons.startDate' },
        endDate: { $first: '$seasonalPricing.seasons.endDate' }
      }
    }
  ]);

  // Get time-based pricing stats
  const timeBasedStats = await VehiclePricing.aggregate([
    { $match: { vehicle: vehicle._id, 'timeBasedPricing.enabled': true } },
    {
      $unwind: '$timeBasedPricing.timeSlots'
    },
    {
      $group: {
        _id: '$timeBasedPricing.timeSlots.name',
        multiplier: { $first: '$timeBasedPricing.timeSlots.multiplier' },
        startTime: { $first: '$timeBasedPricing.timeSlots.startTime' },
        endTime: { $first: '$timeBasedPricing.timeSlots.endTime' },
        days: { $first: '$timeBasedPricing.timeSlots.days' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      pricingStats,
      priorityStats,
      seasonalStats,
      timeBasedStats,
      totalRules: await VehiclePricing.countDocuments({ vehicle: vehicle._id }),
      activeRules: await VehiclePricing.countDocuments({ vehicle: vehicle._id, isActive: true })
    }
  });
});

// @desc    Toggle pricing rule status
// @route   PATCH /api/vehicles/:vehicleId/pricing/:pricingId/toggle
// @access  Private (Vehicle Owner)
const togglePricingRule = asyncHandler(async (req, res) => {
  const { vehicleId, pricingId } = req.params;

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

  // Find and toggle pricing rule
  const pricingRule = await VehiclePricing.findById(pricingId);
  if (!pricingRule) {
    res.status(404);
    throw new Error('Pricing rule not found');
  }

  if (pricingRule.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Pricing rule does not belong to this vehicle');
  }

  pricingRule.isActive = !pricingRule.isActive;
  await pricingRule.save();

  res.status(200).json({
    status: 'success',
    message: `Pricing rule ${pricingRule.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { pricingRule }
  });
});

// @desc    Duplicate a pricing rule
// @route   POST /api/vehicles/:vehicleId/pricing/:pricingId/duplicate
// @access  Private (Vehicle Owner)
const duplicatePricingRule = asyncHandler(async (req, res) => {
  const { vehicleId, pricingId } = req.params;
  const { name } = req.body;

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

  // Find original pricing rule
  const originalRule = await VehiclePricing.findById(pricingId);
  if (!originalRule) {
    res.status(404);
    throw new Error('Pricing rule not found');
  }

  if (originalRule.vehicle.toString() !== vehicleId) {
    res.status(400);
    throw new Error('Pricing rule does not belong to this vehicle');
  }

  // Create duplicate
  const duplicateData = originalRule.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  
  duplicateData.name = name || `${originalRule.name} (Copy)`;
  duplicateData.isActive = false; // Start as inactive

  const duplicatedRule = await VehiclePricing.create(duplicateData);

  res.status(201).json({
    status: 'success',
    message: 'Pricing rule duplicated successfully',
    data: { pricingRule: duplicatedRule }
  });
});

module.exports = {
  getVehiclePricing,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  calculatePrice,
  getPricingAnalytics,
  togglePricingRule,
  duplicatePricingRule
};
