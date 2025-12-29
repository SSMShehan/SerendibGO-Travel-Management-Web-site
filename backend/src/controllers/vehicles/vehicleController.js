const Vehicle = require('../../models/Vehicle');
const asyncHandler = require('express-async-handler');
const sampleVehicles = require('../../data/sampleVehicles');
const { saveMemoryFilesToDisk, deleteFileFromDisk } = require('../../utils/fileUpload');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = asyncHandler(async (req, res) => {
  const {
    vehicleType,
    city,
    district,
    minPrice,
    maxPrice,
    passengers,
    amenities,
    search,
    status = 'available',
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = { status }; // Filter by status (default: available)

  // Vehicle type filter
  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  // Location filter
  if (city) {
    query['serviceAreas.city'] = new RegExp(city, 'i');
  }
  if (district) {
    query['serviceAreas.district'] = new RegExp(district, 'i');
  }

  // Price filter
  if (minPrice || maxPrice) {
    query['pricing.basePrice'] = {};
    if (minPrice) query['pricing.basePrice'].$gte = parseInt(minPrice);
    if (maxPrice) query['pricing.basePrice'].$lte = parseInt(maxPrice);
  }

  // Passenger capacity filter
  if (passengers) {
    query['capacity.passengers'] = { $gte: parseInt(passengers) };
  }

  // Amenities filter
  if (amenities) {
    const amenityArray = amenities.split(',');
    const amenityQuery = {};
    amenityArray.forEach(amenity => {
      amenityQuery[`amenities.${amenity}`] = true;
    });
    query.$and = Object.keys(amenityQuery).map(key => ({ [key]: amenityQuery[key] }));
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { make: new RegExp(search, 'i') },
      { model: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  // Sort
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj = { [sort]: sortOrder };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const vehicles = await Vehicle.find(query)
    .populate('owner', 'firstName lastName email phone')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Vehicle.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get my vehicles (for vehicle owner)
// @route   GET /api/vehicles/my-vehicles
// @access  Private (Vehicle Owner)
const getMyVehicles = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { owner: req.user.id };

  if (status) {
    query.status = status;
  }

  // Sort
  const sortObj = { createdAt: -1 };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const vehicles = await Vehicle.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Vehicle.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('owner', 'firstName lastName email phone');

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

// @desc    Add new vehicle
// @route   POST /api/vehicles
// @access  Private (Vehicle Owner)
const addVehicle = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    vehicleType,
    make,
    model,
    year,
    color,
    licensePlate,
    capacity,
    amenities,
    pricing,
    serviceAreas,
    availability
  } = req.body;

  // Check if user is vehicle owner
  if (req.user.role !== 'vehicle_owner') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Vehicle owner role required.'
    });
  }

  // Check if license plate already exists
  const existingVehicle = await Vehicle.findOne({ licensePlate });
  if (existingVehicle) {
    return res.status(400).json({
      status: 'error',
      message: 'A vehicle with this license plate already exists'
    });
  }

  // Create vehicle
  const vehicle = await Vehicle.create({
    name,
    description,
    owner: req.user.id,
    vehicleType,
    make,
    model,
    year,
    color,
    licensePlate,
    capacity: JSON.parse(capacity),
    amenities: JSON.parse(amenities),
    pricing: JSON.parse(pricing),
    serviceAreas: JSON.parse(serviceAreas),
    availability: JSON.parse(availability),
    status: 'pending'
  });

  // Populate owner details
  await vehicle.populate('owner', 'firstName lastName email phone');

  res.status(201).json({
    status: 'success',
    message: 'Vehicle added successfully',
    data: {
      vehicle
    }
  });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Vehicle Owner)
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Check if user owns this vehicle
  if (vehicle.owner.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only update your own vehicles.'
    });
  }

  // Don't allow updates to approved vehicles (only admin can)
  if (vehicle.status === 'approved' || vehicle.status === 'active') {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot update approved vehicles. Contact admin for changes.'
    });
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('owner', 'firstName lastName email phone');

  res.status(200).json({
    status: 'success',
    message: 'Vehicle updated successfully',
    data: {
      vehicle: updatedVehicle
    }
  });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Vehicle Owner)
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Check if user owns this vehicle
  if (vehicle.owner.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only delete your own vehicles.'
    });
  }

  await Vehicle.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Vehicle deleted successfully'
  });
});

// @desc    Update vehicle status (Admin only)
// @route   PUT /api/vehicles/:id/status
// @access  Private (Admin)
const updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, adminNotes } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Update vehicle status
  vehicle.status = status;
  vehicle.approvalDetails = {
    approvedBy: req.user.id,
    approvedAt: new Date(),
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
    adminNotes
  };

  await vehicle.save();

  res.status(200).json({
    status: 'success',
    message: 'Vehicle status updated successfully',
    data: {
      vehicle
    }
  });
});

// @desc    Get vehicle availability
// @route   GET /api/vehicles/:id/availability
// @access  Public
const getVehicleAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Check basic availability
  const isAvailable = vehicle.availability.isAvailable && vehicle.status === 'active';

  res.status(200).json({
    status: 'success',
    data: {
      isAvailable,
      workingHours: vehicle.availability.workingHours,
      workingDays: vehicle.availability.workingDays,
      minimumBookingNotice: vehicle.availability.minimumBookingNotice
    }
  });
});

// @desc    Update vehicle availability
// @route   PUT /api/vehicles/:id/availability
// @access  Private (Vehicle Owner)
const updateVehicleAvailability = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehicle not found'
    });
  }

  // Check if user owns this vehicle
  if (vehicle.owner.toString() !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only update your own vehicles.'
    });
  }

  vehicle.availability = { ...vehicle.availability, ...req.body };
  await vehicle.save();

  res.status(200).json({
    status: 'success',
    message: 'Vehicle availability updated successfully',
    data: {
      vehicle
    }
  });
});

// @desc    Get vehicle types
// @route   GET /api/vehicles/types
// @access  Public
const getVehicleTypes = asyncHandler(async (req, res) => {
  const vehicleTypes = [
    'Car', 'Van', 'Tuk-tuk', 'Bus', 'Minibus', 'SUV', 'Motorcycle',
    'Bicycle', 'Boat', 'Train', 'Airplane', 'Helicopter'
  ];

  res.status(200).json({
    status: 'success',
    data: {
      vehicleTypes
    }
  });
});

// @desc    Get vehicle amenities
// @route   GET /api/vehicles/amenities
// @access  Public
const getVehicleAmenities = asyncHandler(async (req, res) => {
  const amenities = [
    { key: 'airConditioning', label: 'Air Conditioning' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'childSeats', label: 'Child Seats' },
    { key: 'musicSystem', label: 'Music System' },
    { key: 'chargingPorts', label: 'Charging Ports' },
    { key: 'waterBottles', label: 'Water Bottles' },
    { key: 'firstAidKit', label: 'First Aid Kit' },
    { key: 'fireExtinguisher', label: 'Fire Extinguisher' },
    { key: 'gpsNavigation', label: 'GPS Navigation' },
    { key: 'englishSpeakingDriver', label: 'English Speaking Driver' },
    { key: 'localGuide', label: 'Local Guide' },
    { key: 'cameraEquipment', label: 'Camera Equipment' },
    { key: 'umbrella', label: 'Umbrella' },
    { key: 'coolerBox', label: 'Cooler Box' },
    { key: 'phoneCharger', label: 'Phone Charger' }
  ];

  res.status(200).json({
    status: 'success',
    data: {
      amenities
    }
  });
});

// @desc    Register vehicle by driver
// @route   POST /api/vehicles/register
// @access  Private (Driver)
const registerVehicle = asyncHandler(async (req, res) => {
  // Parse JSON strings from FormData
  const parseFormData = (data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  };

  const {
    make,
    model,
    year,
    color,
    licensePlate,
    vin,
    vehicleType,
    fuelType,
    transmission,
    engineCapacity,
    mileage,
    seatingCapacity,
    features,
    amenities,
    location,
    pricing,
    description,
    availability,
    images,
    documents
  } = req.body;

  console.log('Received vehicle registration data:', req.body);
  console.log('Files received:', req.files);
  console.log('Year field value:', req.body.year, 'Type:', typeof req.body.year);
  console.log('User ID for vehicle creation:', req.user.id, 'Type:', typeof req.user.id);
  console.log('Raw features data:', features, 'Type:', typeof features);
  console.log('Raw amenities data:', amenities, 'Type:', typeof amenities);
  console.log('Raw images data:', images, 'Type:', typeof images);
  console.log('Raw documents data:', documents, 'Type:', typeof documents);

  // Parse complex fields
  const parsedFeatures = parseFormData(features);
  const parsedAmenities = parseFormData(amenities);
  const parsedLocation = parseFormData(location);
  const parsedPricing = parseFormData(pricing);
  const parsedAvailability = parseFormData(availability);
  const parsedImages = parseFormData(images);
  const parsedDocuments = parseFormData(documents);

  console.log('Parsed features:', parsedFeatures);
  console.log('Parsed amenities:', parsedAmenities);
  console.log('Parsed images:', parsedImages);
  console.log('Parsed documents:', parsedDocuments);

  // Process uploaded images
  let processedImages = [];
  
  // Handle uploaded files from req.files
  if (req.files && req.files.images && req.files.images.length > 0) {
    console.log('Processing uploaded image files:', req.files.images.length);
    const savedFiles = await saveMemoryFilesToDisk(req.files.images);
    processedImages = savedFiles.map((file, index) => ({
      url: file.url,
      caption: file.originalName,
      isPrimary: index === 0 // First image is primary
    }));
  }
  // Fallback to parsed images (for backward compatibility)
  else if (Array.isArray(parsedImages) && parsedImages.length > 0) {
    console.log('Processing parsed image URLs:', parsedImages.length);
    processedImages = parsedImages.map((url, index) => ({
      url: url,
      caption: '',
      isPrimary: index === 0 // First image is primary
    }));
  }

  console.log('Processed images:', processedImages);

  // Validate and fix location data
  const validLocation = {
    city: parsedLocation?.city && ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Bentota', 'Hikkaduwa', 
      'Unawatuna', 'Mirissa', 'Weligama', 'Tangalle', 'Arugam Bay',
      'Nuwara Eliya', 'Ella', 'Bandarawela', 'Haputale',
      'Sigiriya', 'Dambulla', 'Anuradhapura', 'Polonnaruwa', 'Trincomalee',
      'Batticaloa', 'Jaffna', 'Kalpitiya', 'Chilaw', 'Puttalam'].includes(parsedLocation.city) 
      ? parsedLocation.city 
      : 'Colombo', // Default to Colombo if invalid
    district: parsedLocation?.district && ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Monaragala', 'Ratnapura', 'Kegalle'].includes(parsedLocation.district)
      ? parsedLocation.district
      : 'Colombo', // Default to Colombo if invalid
    coordinates: {
      latitude: (parsedLocation?.coordinates && parsedLocation.coordinates.latitude >= 5.9 && parsedLocation.coordinates.latitude <= 9.8)
        ? parsedLocation.coordinates.latitude
        : 6.9271, // Default Colombo latitude
      longitude: (parsedLocation?.coordinates && parsedLocation.coordinates.longitude >= 79.7 && parsedLocation.coordinates.longitude <= 81.9)
        ? parsedLocation.coordinates.longitude
        : 79.8612 // Default Colombo longitude
    }
  };

  // Check if user is a driver
  if (req.user.role !== 'driver') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Driver role required.'
    });
  }

  // Check if license plate already exists
  const existingVehicle = await Vehicle.findOne({ licensePlate });
  if (existingVehicle) {
    return res.status(400).json({
      status: 'error',
      message: 'A vehicle with this license plate already exists'
    });
  }

  // Create vehicle
  const vehicle = await Vehicle.create({
    name: `${make} ${model} ${year}`,
    description: description || `A ${year} ${make} ${model} in ${color}`,
    owner: req.user.id,
    vehicleType: vehicleType || 'Car',
    make,
    model,
    year: parseInt(year),
    color: color || 'Unknown',
    licensePlate,
    vin: vin || '',
    fuelType: fuelType || 'petrol',
    transmission: transmission || 'manual',
    engineCapacity: engineCapacity || '',
    mileage: parseInt(mileage) || 0,
    capacity: {
      passengers: parseInt(seatingCapacity) || 4,
      luggage: 2 // Default luggage capacity
    },
    features: parsedFeatures || {},
    images: processedImages,
    location: validLocation, // Use validated location
    pricing: {
      basePrice: parsedPricing?.baseRate || 0,
      currency: parsedPricing?.currency || 'LKR',
      perKmRate: parsedPricing?.perKmRate || 0,
      hourlyRate: parsedPricing?.hourlyRate || 0,
      dailyRate: parsedPricing?.dailyRate || 0
    },
    availability: parsedAvailability || {
      isAvailable: true,
      workingHours: { start: '06:00', end: '22:00' },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    status: 'pending', // Set to pending initially - needs staff approval
    // Add registration details with default expiry date
    registration: {
      number: licensePlate,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    // Add insurance details with default expiry date
    insurance: {
      provider: 'Default Insurance',
      policyNumber: `POL-${licensePlate}-${Date.now()}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    approvalDetails: {
      submittedAt: new Date(),
      submittedBy: req.user.id,
      needsApproval: true // Flag to indicate it needs admin approval
    }
  });

  // Populate owner details
  await vehicle.populate('owner', 'firstName lastName email phone');

  res.status(201).json({
    status: 'success',
    message: 'Vehicle registered successfully. It will be reviewed by our team.',
    data: {
      vehicle
    }
  });
});

// @desc    Get driver vehicles
// @route   GET /api/vehicles/driver/:driverId
// @access  Private (Driver)
const getDriverVehicles = asyncHandler(async (req, res) => {
  const driverId = req.params.driverId;
  
  console.log('=== GET DRIVER VEHICLES ===');
  console.log('Requested driver ID:', driverId);
  console.log('Current user ID:', req.user.id);
  console.log('User role:', req.user.role);
  
  // Check if user has driver profile (even if role is still tourist)
  const Driver = require('../../models/vehicles/Driver');
  const driverProfile = await Driver.findOne({ user: req.user.id });
  console.log('Driver profile found:', !!driverProfile);
  
  // Check if user is requesting their own vehicles or is admin
  if (req.user.role !== 'admin' && req.user.role !== 'driver' && !driverProfile) {
    console.log('Access denied: No driver profile');
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Driver profile required.'
    });
  }

  // For drivers, they can only view their own vehicles
  // Use the user ID to find vehicles since vehicles are stored with user ID as owner
  if ((req.user.role === 'driver' || driverProfile) && req.user.id !== driverId) {
    console.log('Access denied: Different user ID');
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only view your own vehicles.'
    });
  }

  // Find vehicles owned by the user (not the driver ID)
  // Allow drivers to see their vehicles even if their profile is pending
  console.log('Searching for vehicles with owner:', req.user.id);
  console.log('User ID type:', typeof req.user.id);
  console.log('User ID value:', req.user.id);
  
  const vehicles = await Vehicle.find({ owner: req.user.id })
    .populate('owner', 'firstName lastName email phone')
    .sort({ createdAt: -1 });

  console.log('Found vehicles:', vehicles.length);
  vehicles.forEach((vehicle, index) => {
    console.log(`Vehicle ${index + 1}:`, {
      id: vehicle._id,
      name: vehicle.name,
      status: vehicle.status,
      owner: vehicle.owner,
      ownerType: typeof vehicle.owner,
      ownerValue: vehicle.owner
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      vehicles
    }
  });
});

// @desc    Get all vehicles for admin/staff review
// @route   GET /api/vehicles/admin/all
// @access  Private (Admin/Staff)
const getAllVehiclesForReview = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }

  // Sort by creation date (newest first)
  const sortObj = { createdAt: -1 };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const vehicles = await Vehicle.find(query)
    .populate('owner', 'firstName lastName email phone')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Vehicle.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getVehicles,
  getMyVehicles,
  getVehicle,
  addVehicle,
  registerVehicle,
  getDriverVehicles,
  getAllVehiclesForReview,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getVehicleAvailability,
  updateVehicleAvailability,
  getVehicleTypes,
  getVehicleAmenities
};
