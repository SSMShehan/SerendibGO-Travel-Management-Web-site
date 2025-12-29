const express = require('express');
const router = express.Router();
const sampleVehicles = require('../data/sampleVehicles');

// @desc    Get sample vehicles (fallback when database is not available)
// @route   GET /api/vehicles/sample
// @access  Public
router.get('/', (req, res) => {
  const { status = 'available', vehicleType, search } = req.query;
  
  let filteredVehicles = sampleVehicles.filter(vehicle => vehicle.status === status);
  
  // Apply basic filters
  if (vehicleType) {
    filteredVehicles = filteredVehicles.filter(vehicle => 
      vehicle.vehicleType.toLowerCase() === vehicleType.toLowerCase()
    );
  }
  
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredVehicles = filteredVehicles.filter(vehicle => 
      vehicle.name.toLowerCase().includes(searchTerm) ||
      vehicle.make.toLowerCase().includes(searchTerm) ||
      vehicle.model.toLowerCase().includes(searchTerm) ||
      vehicle.description.toLowerCase().includes(searchTerm)
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      vehicles: filteredVehicles,
      pagination: {
        current: 1,
        pages: 1,
        total: filteredVehicles.length,
        limit: 10
      }
    }
  });
});

module.exports = router;
