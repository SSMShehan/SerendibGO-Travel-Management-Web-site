const mongoose = require('mongoose');

const driverLicenseSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: [true, 'License number is required']
  },
  licenseType: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'],
    required: [true, 'License type is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'License issue date is required']
  },
  expiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  issuingAuthority: {
    type: String,
    required: [true, 'Issuing authority is required']
  },
  licenseClass: {
    type: String,
    enum: ['Light Vehicle', 'Heavy Vehicle', 'Motorcycle', 'Bus', 'Truck'],
    required: [true, 'License class is required']
  },
  restrictions: [String],
  endorsements: [String]
}, { _id: false });

const vehicleTypeSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'minivan', 'truck', 'bus', 'motorcycle', 'bicycle'],
    required: true
  },
  experience: {
    type: Number, // years of experience
    min: 0,
    required: true
  },
  isPreferred: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: {
    type: String, // HH:MM format
    required: true
  },
  endTime: {
    type: String, // HH:MM format
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const driverSchema = new mongoose.Schema({
  // Basic information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Driver-specific information
  driverId: {
    type: String,
    unique: true,
    required: [true, 'Driver ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive', 'blacklisted'],
    default: 'pending'
  },
  
  // Personal information
  personalInfo: {
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required']
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required']
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required']
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required']
      },
      email: String
    }
  },
  
  // License information
  license: driverLicenseSchema,
  
  // Vehicle preferences and experience
  vehicleTypes: [vehicleTypeSchema],
  
  // Availability
  availability: [availabilitySchema],
  
  // Location and service areas
  serviceAreas: [{
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    radius: {
      type: Number, // in kilometers
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Current location
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdated: Date,
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  
  // Performance metrics
  performance: {
    totalTrips: {
      type: Number,
      default: 0
    },
    completedTrips: {
      type: Number,
      default: 0
    },
    cancelledTrips: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    onTimePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    customerComplaints: {
      type: Number,
      default: 0
    },
    safetyIncidents: {
      type: Number,
      default: 0
    }
  },
  
  // Financial information
  financial: {
    baseRate: {
      type: Number,
      min: 0,
      required: [true, 'Base rate is required']
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
      default: 'USD'
    },
    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 20 // percentage
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'mobile_money', 'check'],
      default: 'bank_transfer'
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      branchName: String,
      accountHolderName: String
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    pendingPayout: {
      type: Number,
      default: 0
    }
  },
  
  // Documents and verification
  documents: {
    profilePhoto: String,
    licensePhoto: String,
    identityDocument: String,
    backgroundCheck: String,
    insuranceDocument: String,
    vehicleRegistration: String,
    otherDocuments: [String]
  },
  
  verification: {
    identityVerified: {
      type: Boolean,
      default: false
    },
    licenseVerified: {
      type: Boolean,
      default: false
    },
    backgroundCheckPassed: {
      type: Boolean,
      default: false
    },
    insuranceVerified: {
      type: Boolean,
      default: false
    },
    vehicleVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Preferences
  preferences: {
    maxTripDistance: {
      type: Number, // in kilometers
      default: 200
    },
    maxTripDuration: {
      type: Number, // in hours
      default: 8
    },
    preferredTripTypes: [{
      type: String,
      enum: ['one_way', 'round_trip', 'multi_city', 'city_tour', 'airport_transfer', 'custom']
    }],
    workingHours: {
      startTime: String, // HH:MM
      endTime: String,   // HH:MM
      timeZone: {
        type: String,
        default: 'Asia/Colombo'
      }
    },
    languages: [String],
    specialSkills: [String],
    notes: String
  },
  
  // Status history
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'inactive', 'blacklisted']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'referral', 'walk_in'],
      default: 'web'
    },
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
driverSchema.index({ user: 1 });
driverSchema.index({ driverId: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ 'currentLocation.isOnline': 1 });
driverSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.district': 1 });
driverSchema.index({ 'performance.averageRating': -1 });
driverSchema.index({ createdAt: -1 });

// Virtual for checking if driver is available
driverSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.currentLocation.isOnline;
});

// Virtual for checking if driver can be assigned
driverSchema.virtual('canBeAssigned').get(function() {
  return this.status === 'active' && 
         this.verification.identityVerified && 
         this.verification.licenseVerified && 
         this.verification.backgroundCheckPassed;
});

// Virtual for calculating driver score
driverSchema.virtual('driverScore').get(function() {
  const rating = this.performance.averageRating || 0;
  const onTime = this.performance.onTimePercentage || 0;
  const complaints = this.performance.customerComplaints || 0;
  const incidents = this.performance.safetyIncidents || 0;
  
  // Simple scoring algorithm (can be made more sophisticated)
  let score = (rating * 20) + (onTime * 0.6) - (complaints * 5) - (incidents * 10);
  return Math.max(0, Math.min(100, score));
});

// Middleware to update `updatedAt` field
driverSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate driver ID
driverSchema.statics.generateDriverId = function() {
  const prefix = 'DRV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method to find available drivers
driverSchema.statics.findAvailableDrivers = async function(criteria = {}) {
  const {
    city,
    district,
    vehicleType,
    startTime,
    endTime,
    maxDistance = 50,
    minRating = 0
  } = criteria;
  
  const query = {
    status: 'active',
    'currentLocation.isOnline': true,
    'verification.identityVerified': true,
    'verification.licenseVerified': true,
    'verification.backgroundCheckPassed': true,
    'performance.averageRating': { $gte: minRating }
  };
  
  // Filter by service area
  if (city && district) {
    query['serviceAreas'] = {
      $elemMatch: {
        city: { $regex: new RegExp(city, 'i') },
        district: { $regex: new RegExp(district, 'i') },
        isActive: true
      }
    };
  }
  
  // Filter by vehicle type
  if (vehicleType) {
    query['vehicleTypes'] = {
      $elemMatch: {
        vehicleType: vehicleType,
        experience: { $gte: 1 }
      }
    };
  }
  
  // Filter by availability
  if (startTime && endTime) {
    const dayOfWeek = new Date(startTime).toLocaleString('en-US', { weekday: 'long' });
    query['availability'] = {
      $elemMatch: {
        dayOfWeek: dayOfWeek,
        startTime: { $lte: startTime.split('T')[1] },
        endTime: { $gte: endTime.split('T')[1] },
        isAvailable: true
      }
    };
  }
  
  return this.find(query)
    .populate('user', 'name email phone')
    .sort({ 'performance.averageRating': -1, 'performance.onTimePercentage': -1 });
};

// Static method to get driver statistics
driverSchema.statics.getDriverStats = async function(filters = {}) {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query.createdAt = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDrivers: { $sum: 1 },
        activeDrivers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        onlineDrivers: {
          $sum: { $cond: [{ $eq: ['$currentLocation.isOnline', true] }, 1, 0] }
        },
        averageRating: { $avg: '$performance.averageRating' },
        totalTrips: { $sum: '$performance.totalTrips' },
        totalEarnings: { $sum: '$financial.totalEarnings' }
      }
    }
  ]);
  
  return stats[0] || {
    totalDrivers: 0,
    activeDrivers: 0,
    onlineDrivers: 0,
    averageRating: 0,
    totalTrips: 0,
    totalEarnings: 0
  };
};

// Get personal driver statistics
driverSchema.statics.getDriverPersonalStats = async function(driverId, dateFilter = {}) {
  const driver = await this.findById(driverId);
  if (!driver) {
    return {
      totalTrips: 0,
      completedTrips: 0,
      cancelledTrips: 0,
      averageRating: 0,
      totalEarnings: 0,
      onTimePercentage: 100
    };
  }
  
  // For now, return the driver's performance metrics
  // In a real implementation, you might want to calculate stats from trips
  return {
    totalTrips: driver.performance.totalTrips || 0,
    completedTrips: driver.performance.completedTrips || 0,
    cancelledTrips: driver.performance.cancelledTrips || 0,
    averageRating: driver.performance.averageRating || 0,
    totalEarnings: driver.financial.totalEarnings || 0,
    onTimePercentage: driver.performance.onTimePercentage || 100
  };
};

module.exports = mongoose.model('Driver', driverSchema);
