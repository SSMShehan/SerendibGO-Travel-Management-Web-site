const express = require('express');
const router = express.Router();
const { seedVehicles } = require('../scripts/seedVehicles');
const { seedHotels } = require('../scripts/seedHotels');

// @route   POST /api/seed/vehicles
// @desc    Seed vehicles data
// @access  Public (for development/demo purposes)
router.get('/vehicles', async (req, res) => {
    try {
        await seedVehicles();
        res.status(200).json({ success: true, message: 'Vehicles seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ success: false, message: 'Failed to seed vehicles', error: error.message });
    }
});

// @route   POST /api/seed/hotels
// @desc    Seed hotels data
// @access  Public (for development/demo purposes)
router.get('/hotels', async (req, res) => {
    try {
        await seedHotels();
        res.status(200).json({ success: true, message: 'Hotels seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ success: false, message: 'Failed to seed hotels', error: error.message });
    }
});

module.exports = router;
