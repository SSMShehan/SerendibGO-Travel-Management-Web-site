const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
const getGuides = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    location,
    specialty,
    minPrice,
    maxPrice,
    rating,
    language,
    search
  } = req.query;

  // Build filter object
  const filter = { role: 'guide', isActive: true };
  
  if (location) {
    filter['profile.location'] = new RegExp(location, 'i');
  }
  
  if (specialty) {
    filter['profile.specialties'] = { $in: [new RegExp(specialty, 'i')] };
  }
  
  if (language) {
    filter['profile.languages'] = { $in: [new RegExp(language, 'i')] };
  }
  
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { 'profile.specialties': { $in: [new RegExp(search, 'i')] } },
      { 'profile.location': new RegExp(search, 'i') }
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get guides with pagination
  const guides = await User.find(filter)
    .select('-password -__v')
    .populate('profile')
    .skip(skip)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  // Calculate additional stats for each guide
  const guidesWithStats = await Promise.all(
    guides.map(async (guide) => {
      // Get tour count
      const tourCount = await Tour.countDocuments({ guide: guide._id, isActive: true });
      
      // Get booking count
      const bookingCount = await Booking.countDocuments({ 
        tour: { $in: await Tour.find({ guide: guide._id }).select('_id') }
      });
      
      // Get average rating from reviews
      const reviews = await Review.find({ 
        tour: { $in: await Tour.find({ guide: guide._id }).select('_id') }
      });
      
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      return {
        id: guide._id,
        name: `${guide.firstName} ${guide.lastName}`,
        email: guide.email,
        phone: guide.phone,
        avatar: guide.avatar,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        experience: guide.profile?.experience || 0,
        languages: guide.profile?.languages || [],
        specialties: guide.profile?.specialties || [],
        location: guide.profile?.location || 'Not specified',
        price: guide.profile?.pricePerDay || 0,
        availability: guide.isActive ? 'Available' : 'Unavailable',
        description: guide.profile?.bio || 'Professional tour guide with extensive local knowledge.',
        certifications: guide.profile?.certifications || [],
        responseTime: guide.profile?.responseTime || 'Within 24 hours',
        completedTours: bookingCount,
        bio: guide.profile?.bio || 'Professional tour guide with extensive local knowledge.',
        highlights: guide.profile?.highlights || [],
        workingDays: guide.profile?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        blockedDates: guide.profile?.blockedDates || [],
        workingHours: guide.profile?.workingHours || { start: '09:00', end: '17:00' },
        maxBookingsPerDay: guide.profile?.maxBookingsPerDay || 3,
        advanceBookingDays: guide.profile?.advanceBookingDays || 30,
        isVerified: guide.isVerified,
        createdAt: guide.createdAt
      };
    })
  );

  res.json({
    success: true,
    count: guidesWithStats.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: guidesWithStats
  });
});

// @desc    Get guide by ID
// @route   GET /api/guides/:id
// @access  Public
const getGuideById = asyncHandler(async (req, res) => {
  const guide = await User.findOne({ 
    _id: req.params.id, 
    role: 'guide' 
  }).select('-password -__v');

  if (!guide) {
    return res.status(404).json({
      success: false,
      message: 'Guide not found'
    });
  }

  // Get additional stats
  const tours = await Tour.find({ guide: guide._id, isActive: true });
  const bookings = await Booking.find({ 
    tour: { $in: tours.map(tour => tour._id) }
  });
  
  const reviews = await Review.find({ 
    tour: { $in: tours.map(tour => tour._id) }
  });
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const guideData = {
    id: guide._id,
    name: `${guide.firstName} ${guide.lastName}`,
    email: guide.email,
    phone: guide.phone,
    avatar: guide.avatar,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
    experience: guide.profile?.experience || 0,
    languages: guide.profile?.languages || [],
    specialties: guide.profile?.specialties || [],
    location: guide.profile?.location || 'Not specified',
    price: guide.profile?.pricePerDay || 0,
    availability: guide.isActive ? 'Available' : 'Unavailable',
    description: guide.profile?.bio || 'Professional tour guide with extensive local knowledge.',
    certifications: guide.profile?.certifications || [],
    responseTime: guide.profile?.responseTime || 'Within 24 hours',
    completedTours: bookings.length,
    bio: guide.profile?.bio || 'Professional tour guide with extensive local knowledge.',
    highlights: guide.profile?.highlights || [],
    workingDays: guide.profile?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    blockedDates: guide.profile?.blockedDates || [],
    workingHours: guide.profile?.workingHours || { start: '09:00', end: '17:00' },
    maxBookingsPerDay: guide.profile?.maxBookingsPerDay || 3,
    advanceBookingDays: guide.profile?.advanceBookingDays || 30,
    isVerified: guide.isVerified,
    tours: tours,
    reviews: reviews,
    createdAt: guide.createdAt
  };

  res.json({
    success: true,
    data: guideData
  });
});

// @desc    Create new guide
// @route   POST /api/guides
// @access  Private (Admin only)
const createGuide = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    profile
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  const guide = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: 'guide',
    profile: {
      ...profile,
      guideLicense: profile.guideLicense || '',
      languages: profile.languages || [],
      experience: profile.experience || 0,
      specialties: profile.specialties || [],
      location: profile.location || '',
      pricePerDay: profile.pricePerDay || 0,
      bio: profile.bio || '',
      certifications: profile.certifications || [],
      responseTime: profile.responseTime || 'Within 24 hours',
      highlights: profile.highlights || []
    }
  });

  res.status(201).json({
    success: true,
    data: guide
  });
});

// @desc    Update guide
// @route   PUT /api/guides/:id
// @access  Private (Guide owner or Admin)
const updateGuide = asyncHandler(async (req, res) => {
  const guide = await User.findById(req.params.id);

  if (!guide || guide.role !== 'guide') {
    return res.status(404).json({
      success: false,
      message: 'Guide not found'
    });
  }

  // Check if user is guide owner or admin
  if (req.user.id !== guide._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this guide'
    });
  }

  const updatedGuide = await User.findByIdAndUpdate(
    req.params.id,
    { 
      ...req.body,
      profile: { ...guide.profile, ...req.body.profile }
    },
    { new: true, runValidators: true }
  ).select('-password -__v');

  res.json({
    success: true,
    data: updatedGuide
  });
});

// @desc    Update guide profile
// @route   PUT /api/guides/profile
// @access  Private (Guide only)
const updateGuideProfile = asyncHandler(async (req, res) => {
  const guideId = req.user.id;

  const guide = await User.findById(guideId);

  if (!guide || guide.role !== 'guide') {
    return res.status(404).json({
      success: false,
      message: 'Guide not found'
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    avatar,
    profile: profileData
  } = req.body;

  // Update basic info
  const updateData = {
    firstName: firstName || guide.firstName,
    lastName: lastName || guide.lastName,
    email: email || guide.email,
    phone: phone || guide.phone,
    avatar: avatar || guide.avatar,
    profile: {
      ...guide.profile,
      ...profileData
    }
  };

  const updatedGuide = await User.findByIdAndUpdate(
    guideId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -__v');

  res.json({
    success: true,
    data: updatedGuide
  });
});

// @desc    Delete guide
// @route   DELETE /api/guides/:id
// @access  Private (Admin only)
const deleteGuide = asyncHandler(async (req, res) => {
  const guide = await User.findById(req.params.id);

  if (!guide || guide.role !== 'guide') {
    return res.status(404).json({
      success: false,
      message: 'Guide not found'
    });
  }

  // Soft delete by setting isActive to false
  guide.isActive = false;
  await guide.save();

  res.json({
    success: true,
    message: 'Guide deleted successfully'
  });
});

// @desc    Get guide statistics
// @route   GET /api/guides/stats/:id
// @access  Public
const getGuideStats = asyncHandler(async (req, res) => {
  const guide = await User.findOne({ 
    _id: req.params.id, 
    role: 'guide' 
  });

  if (!guide) {
    return res.status(404).json({
      success: false,
      message: 'Guide not found'
    });
  }

  const tours = await Tour.find({ guide: guide._id, isActive: true });
  const bookings = await Booking.find({ 
    tour: { $in: tours.map(tour => tour._id) }
  });
  
  const reviews = await Review.find({ 
    tour: { $in: tours.map(tour => tour._id) }
  });
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const stats = {
    totalTours: tours.length,
    totalBookings: bookings.length,
    totalReviews: reviews.length,
    averageRating: Math.round(avgRating * 10) / 10,
    totalRevenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
    monthlyBookings: bookings.filter(booking => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return booking.createdAt >= monthAgo;
    }).length
  };

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  getGuides,
  getGuideById,
  createGuide,
  updateGuide,
  updateGuideProfile,
  deleteGuide,
  getGuideStats
};
