const asyncHandler = require('express-async-handler');
const VehicleAvailability = require('../../models/vehicles/VehicleAvailability');
const Vehicle = require('../../models/Vehicle');

// @desc    Get vehicle availability for a date range
// @route   GET /api/vehicles/:vehicleId/availability
// @access  Private (Vehicle Owner)
const getVehicleAvailability = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { startDate, endDate, month, year } = req.query;

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

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (month && year) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  } else {
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  }

  const availability = await VehicleAvailability.find(query)
    .sort({ date: 1 })
    .populate('vehicle', 'name make model type');

  res.status(200).json({
    status: 'success',
    data: { availability }
  });
});

// @desc    Set vehicle availability for a specific date
// @route   POST /api/vehicles/:vehicleId/availability
// @access  Private (Vehicle Owner)
const setVehicleAvailability = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { date, timeSlots, isAvailable, reason, customReason } = req.body;

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

  // Check if availability already exists for this date
  let availability = await VehicleAvailability.findOne({
    vehicle: vehicleId,
    date: new Date(date)
  });

  if (availability) {
    // Update existing availability
    availability.timeSlots = timeSlots || availability.timeSlots;
    availability.isAvailable = isAvailable !== undefined ? isAvailable : availability.isAvailable;
    availability.reason = reason || availability.reason;
    availability.customReason = customReason || availability.customReason;
    availability.updatedAt = new Date();
  } else {
    // Create new availability
    availability = await VehicleAvailability.create({
      vehicle: vehicleId,
      owner: req.user.id,
      date: new Date(date),
      timeSlots: timeSlots || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      reason: reason || 'available',
      customReason: customReason || ''
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Vehicle availability updated successfully',
    data: { availability }
  });
});

// @desc    Set recurring availability
// @route   POST /api/vehicles/:vehicleId/availability/recurring
// @access  Private (Vehicle Owner)
const setRecurringAvailability = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { startDate, endDate, pattern, days, timeSlots, isAvailable, reason } = req.body;

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

  // Create recurring availability
  const availabilities = await VehicleAvailability.createRecurringAvailability(
    vehicleId,
    req.user.id,
    new Date(startDate),
    new Date(endDate),
    pattern,
    days,
    timeSlots
  );

  res.status(200).json({
    status: 'success',
    message: 'Recurring availability created successfully',
    data: { availabilities }
  });
});

// @desc    Block vehicle for maintenance or personal use
// @route   POST /api/vehicles/:vehicleId/availability/block
// @access  Private (Vehicle Owner)
const blockVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { startDate, endDate, reason, customReason, timeSlots } = req.body;

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

  const start = new Date(startDate);
  const end = new Date(endDate);
  const availabilities = [];

  // Create blocked availability for each date in range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const existingAvailability = await VehicleAvailability.findOne({
      vehicle: vehicleId,
      date: new Date(date)
    });

    if (existingAvailability) {
      existingAvailability.isAvailable = false;
      existingAvailability.reason = reason || 'maintenance';
      existingAvailability.customReason = customReason || '';
      existingAvailability.timeSlots = timeSlots || existingAvailability.timeSlots;
      existingAvailability.updatedAt = new Date();
      await existingAvailability.save();
      availabilities.push(existingAvailability);
    } else {
      const newAvailability = await VehicleAvailability.create({
        vehicle: vehicleId,
        owner: req.user.id,
        date: new Date(date),
        timeSlots: timeSlots || [],
        isAvailable: false,
        reason: reason || 'maintenance',
        customReason: customReason || ''
      });
      availabilities.push(newAvailability);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Vehicle blocked successfully',
    data: { availabilities }
  });
});

// @desc    Get availability calendar for vehicle owner
// @route   GET /api/vehicles/availability/calendar
// @access  Private (Vehicle Owner)
const getAvailabilityCalendar = asyncHandler(async (req, res) => {
  const { month, year, vehicleId } = req.query;

  let query = { owner: req.user.id };

  if (vehicleId) {
    query.vehicle = vehicleId;
  }

  if (month && year) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  } else {
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  }

  const availability = await VehicleAvailability.find(query)
    .populate('vehicle', 'name make model type')
    .sort({ date: 1 });

  // Group by date for calendar view
  const calendarData = {};
  availability.forEach(avail => {
    const dateKey = avail.date.toISOString().split('T')[0];
    if (!calendarData[dateKey]) {
      calendarData[dateKey] = [];
    }
    calendarData[dateKey].push(avail);
  });

  res.status(200).json({
    status: 'success',
    data: { calendarData, availability }
  });
});

// @desc    Check vehicle availability for booking
// @route   GET /api/vehicles/:vehicleId/availability/check
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { date, startTime, endTime } = req.query;

  if (!date || !startTime || !endTime) {
    res.status(400);
    throw new Error('Date, startTime, and endTime are required');
  }

  const isAvailable = await VehicleAvailability.checkTimeSlotAvailability(
    vehicleId,
    new Date(date),
    startTime,
    endTime
  );

  res.status(200).json({
    status: 'success',
    data: { isAvailable }
  });
});

// @desc    Delete vehicle availability
// @route   DELETE /api/vehicles/:vehicleId/availability/:availabilityId
// @access  Private (Vehicle Owner)
const deleteAvailability = asyncHandler(async (req, res) => {
  const { vehicleId, availabilityId } = req.params;

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

  const availability = await VehicleAvailability.findById(availabilityId);
  if (!availability) {
    res.status(404);
    throw new Error('Availability record not found');
  }

  await VehicleAvailability.findByIdAndDelete(availabilityId);

  res.status(200).json({
    status: 'success',
    message: 'Availability deleted successfully'
  });
});

module.exports = {
  getVehicleAvailability,
  setVehicleAvailability,
  setRecurringAvailability,
  blockVehicle,
  getAvailabilityCalendar,
  checkAvailability,
  deleteAvailability
};
