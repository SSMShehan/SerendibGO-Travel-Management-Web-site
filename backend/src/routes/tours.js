const express = require('express');
const router = express.Router();
const {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getToursByGuide,
  getFeaturedTours,
  searchTours
} = require('../controllers/tourController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getTours);
router.get('/featured', getFeaturedTours);
router.get('/search', searchTours);
router.get('/guide/:guideId', getToursByGuide);
router.get('/:id', getTourById);

// Protected routes (require authentication)
router.use(protect);

// Guide and Admin routes
router.post('/', authorize('guide', 'admin'), createTour);
router.put('/:id', authorize('guide', 'admin'), updateTour);
router.delete('/:id', authorize('guide', 'admin'), deleteTour);

module.exports = router;

