const mongoose = require('mongoose');

const tripStopSchema = new mongoose.Schema({
  stopType: {
    type: String,
    enum: ['pickup', 'dropoff', 'waypoint', 'rest_stop', 'fuel_stop', 'meal_stop', 'sightseeing'],
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    landmark: String,
    instructions: String
  },
  timing: {
    estimatedArrival: Date,
    estimatedDeparture: Date,
    actualArrival: Date,
    actualDeparture: Date,
    duration: Number // in minutes
  },
  activities: [{
    name: String,
    description: String,
    duration: Number, // in minutes
    cost: Number,
    notes: String
  }],
  notes: String,
  order: {
    type: Number,
    required: true
  }
}, { _id: false });

const routeSegmentSchema = new mongoose.Schema({
  fromStop: {
    type: Number, // order index
    required: true
  },
  toStop: {
    type: Number, // order index
    required: true
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: Number, // in minutes
  route: {
    type: String,
    enum: ['shortest', 'fastest', 'scenic', 'avoid_tolls', 'avoid_highways', 'custom'],
    default: 'fastest'
  },
  waypoints: [{
    latitude: Number,
    longitude: Number,
    name: String
  }],
  trafficConditions: {
    type: String,
    enum: ['light', 'moderate', 'heavy', 'severe'],
    default: 'moderate'
  },
  roadConditions: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  weatherConditions: {
    type: String,
    enum: ['clear', 'cloudy', 'rainy', 'stormy', 'foggy'],
    default: 'clear'
  },
  notes: String
}, { _id: false });

const tripSchema = new mongoose.Schema({
  // Basic trip information
  tripReference: {
    type: String,
    unique: true,
    required: [true, 'Trip reference is required']
  },
  bookingRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleBookingRequest',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Trip details
  tripType: {
    type: String,
    enum: ['one_way', 'round_trip', 'multi_city', 'city_tour', 'airport_transfer', 'custom'],
    required: true
  },
  tripCategory: {
    type: String,
    enum: ['business', 'leisure', 'airport', 'city_tour', 'long_distance', 'event', 'wedding', 'other'],
    required: true
  },
  
  // Route and stops
  stops: [tripStopSchema],
  routeSegments: [routeSegmentSchema],
  
  // Timing
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Distance and duration
  totalDistance: {
    type: Number, // in kilometers
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: Number, // in minutes
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    distancePrice: {
      type: Number,
      default: 0
    },
    timePrice: {
      type: Number,
      default: 0
    },
    additionalFees: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['fixed', 'percentage']
      }
    }],
    discounts: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['fixed', 'percentage']
      }
    }],
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
      default: 'USD'
    }
  },
  
  // Trip status and workflow
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'delayed', 'no_show'],
    default: 'scheduled'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'delayed', 'no_show']
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
    notes: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  }],
  
  // Real-time tracking
  tracking: {
    isActive: {
      type: Boolean,
      default: false
    },
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      timestamp: Date
    },
    trackingHistory: [{
      latitude: Number,
      longitude: Number,
      timestamp: {
        type: Date,
        default: Date.now
      },
      speed: Number, // km/h
      heading: Number, // degrees
      accuracy: Number // meters
    }],
    estimatedArrival: Date,
    delayReason: String,
    delayMinutes: Number
  },
  
  // Communication
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'status_update', 'location_update', 'delay_notification', 'system'],
      default: 'message'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Special requirements
  specialRequirements: {
    accessibility: {
      wheelchairAccess: {
        type: Boolean,
        default: false
      },
      mobilityAssistance: {
        type: Boolean,
        default: false
      },
      accessibilityNotes: String
    },
    comfort: {
      airConditioning: {
        type: Boolean,
        default: true
      },
      music: {
        type: Boolean,
        default: false
      },
      wifi: {
        type: Boolean,
        default: false
      },
      comfortNotes: String
    },
    safety: {
      childSeat: {
        type: Boolean,
        default: false
      },
      boosterSeat: {
        type: Boolean,
        default: false
      },
      safetyNotes: String
    },
    other: {
      smokingAllowed: {
        type: Boolean,
        default: false
      },
      petFriendly: {
        type: Boolean,
        default: false
      },
      customRequests: String
    }
  },
  
  // Trip experience
  experience: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    photos: [String], // URLs to photos
    highlights: [String],
    issues: [String],
    suggestions: String
  },
  
  // Cancellation and refund
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: String,
    cancellationTime: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'denied'],
      default: 'pending'
    },
    cancellationPolicy: String
  },
  
  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone', 'walk_in'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
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
tripSchema.index({ customer: 1, createdAt: -1 });
tripSchema.index({ vehicleOwner: 1, createdAt: -1 });
tripSchema.index({ driver: 1, createdAt: -1 });
tripSchema.index({ vehicle: 1, createdAt: -1 });
tripSchema.index({ status: 1, createdAt: -1 });
tripSchema.index({ scheduledStartTime: 1 });
tripSchema.index({ tripReference: 1 });
tripSchema.index({ 'tracking.isActive': 1 });

// Virtual for checking if trip is active
tripSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress' || this.tracking.isActive;
});

// Virtual for checking if trip can be cancelled
tripSchema.virtual('canBeCancelled').get(function() {
  return ['scheduled', 'confirmed'].includes(this.status);
});

// Virtual for calculating trip progress
tripSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'in_progress') {
    const now = new Date();
    const start = new Date(this.scheduledStartTime);
    const end = new Date(this.scheduledEndTime);
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }
  return 0;
});

// Virtual for estimated time remaining
tripSchema.virtual('estimatedTimeRemaining').get(function() {
  if (this.status !== 'in_progress') return null;
  const now = new Date();
  const end = new Date(this.scheduledEndTime);
  return Math.max(0, end - now);
});

// Middleware to update `updatedAt` field
tripSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate trip reference
tripSchema.statics.generateTripReference = function() {
  const prefix = 'TRP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method to get trips for a user
tripSchema.statics.getUserTrips = async function(userId, role, filters = {}) {
  let query = {};
  
  if (role === 'customer') {
    query.customer = userId;
  } else if (role === 'vehicle_owner') {
    query.vehicleOwner = userId;
  } else if (role === 'driver') {
    query.driver = userId;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query.scheduledStartTime = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  if (filters.search) {
    query.$or = [
      { tripReference: { $regex: filters.search, $options: 'i' } },
      { 'stops.location.city': { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('customer', 'name email phone')
    .populate('vehicleOwner', 'name email phone')
    .populate('driver', 'name phone')
    .populate('vehicle', 'name make model type')
    .populate('bookingRequest', 'bookingReference')
    .sort({ scheduledStartTime: -1 });
};

// Static method to get active trips
tripSchema.statics.getActiveTrips = async function() {
  return this.find({
    status: { $in: ['confirmed', 'in_progress'] },
    scheduledStartTime: { $lte: new Date() },
    scheduledEndTime: { $gte: new Date() }
  })
  .populate('customer', 'name phone')
  .populate('driver', 'name phone')
  .populate('vehicle', 'name make model')
  .sort({ scheduledStartTime: 1 });
};

module.exports = mongoose.model('Trip', tripSchema);
