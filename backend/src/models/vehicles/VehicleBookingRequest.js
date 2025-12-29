const mongoose = require('mongoose');

const vehicleBookingRequestSchema = new mongoose.Schema({
  // Basic booking information
  bookingReference: {
    type: String,
    unique: true,
    required: [true, 'Booking reference is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  vehicleOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vehicle owner is required']
  },
  
  // Trip details
  tripDetails: {
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup address is required']
      },
      city: {
        type: String,
        required: [true, 'Pickup city is required']
      },
      district: {
        type: String,
        required: [true, 'Pickup district is required']
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, 'Pickup latitude is required']
        },
        longitude: {
          type: Number,
          required: [true, 'Pickup longitude is required']
        }
      },
      landmark: String,
      instructions: String
    },
    dropoffLocation: {
      address: {
        type: String,
        required: [true, 'Dropoff address is required']
      },
      city: {
        type: String,
        required: [true, 'Dropoff city is required']
      },
      district: {
        type: String,
        required: [true, 'Dropoff district is required']
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, 'Dropoff latitude is required']
        },
        longitude: {
          type: Number,
          required: [true, 'Dropoff longitude is required']
        }
      },
      landmark: String,
      instructions: String
    },
    estimatedDistance: {
      type: Number,
      min: [0, 'Distance cannot be negative'],
      required: [true, 'Estimated distance is required']
    },
    estimatedDuration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      required: [true, 'Estimated duration is required']
    },
    route: {
      type: String,
      enum: ['shortest', 'fastest', 'scenic', 'custom'],
      default: 'fastest'
    },
    stops: [{
      address: String,
      city: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      landmark: String,
      instructions: String,
      estimatedArrival: Date,
      estimatedDeparture: Date
    }]
  },
  
  // Timing details
  timing: {
    pickupDateTime: {
      type: Date,
      required: [true, 'Pickup date and time is required']
    },
    dropoffDateTime: {
      type: Date,
      required: [true, 'Dropoff date and time is required']
    },
    flexibleTiming: {
      type: Boolean,
      default: false
    },
    flexibilityWindow: {
      type: Number,
      min: [0, 'Flexibility window cannot be negative'],
      default: 0
    },
    timeZone: {
      type: String,
      default: 'Asia/Colombo'
    }
  },
  
  // Passenger and luggage details
  passengers: {
    adults: {
      type: Number,
      min: [1, 'At least one adult passenger is required'],
      required: [true, 'Number of adults is required']
    },
    children: {
      type: Number,
      min: [0, 'Children count cannot be negative'],
      default: 0
    },
    infants: {
      type: Number,
      min: [0, 'Infants count cannot be negative'],
      default: 0
    },
    totalPassengers: {
      type: Number,
      min: [1, 'Total passengers must be at least 1'],
      required: [true, 'Total passengers is required']
    },
    luggage: {
      smallBags: {
        type: Number,
        min: [0, 'Small bags count cannot be negative'],
        default: 0
      },
      largeBags: {
        type: Number,
        min: [0, 'Large bags count cannot be negative'],
        default: 0
      },
      specialItems: [{
        type: String,
        enum: ['wheelchair', 'bicycle', 'pet', 'fragile', 'oversized', 'other']
      }],
      specialInstructions: String
    }
  },
  
  // Pricing details
  pricing: {
    basePrice: {
      type: Number,
      min: [0, 'Base price cannot be negative'],
      required: [true, 'Base price is required']
    },
    distancePrice: {
      type: Number,
      min: [0, 'Distance price cannot be negative'],
      default: 0
    },
    timePrice: {
      type: Number,
      min: [0, 'Time price cannot be negative'],
      default: 0
    },
    additionalFees: [{
      name: String,
      amount: {
        type: Number,
        min: [0, 'Additional fee cannot be negative']
      },
      type: {
        type: String,
        enum: ['fixed', 'percentage']
      }
    }],
    discounts: [{
      name: String,
      amount: {
        type: Number,
        min: [0, 'Discount cannot be negative']
      },
      type: {
        type: String,
        enum: ['fixed', 'percentage']
      }
    }],
    subtotal: {
      type: Number,
      min: [0, 'Subtotal cannot be negative'],
      required: [true, 'Subtotal is required']
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: 0
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
      required: [true, 'Total price is required']
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
      default: 'USD'
    },
    pricingBreakdown: {
      type: String,
      default: ''
    }
  },
  
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
  
  // Contact information
  contactInfo: {
    primaryContact: {
      name: {
        type: String,
        required: [true, 'Primary contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Primary contact phone is required']
      },
      email: {
        type: String,
        required: [true, 'Primary contact email is required']
      }
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    alternateContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show']
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
  
  // Response and communication
  response: {
    ownerResponse: {
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'counter_offer'],
        default: 'pending'
      },
      responseTime: Date,
      responseMessage: String,
      counterOffer: {
        price: Number,
        timing: {
          pickupDateTime: Date,
          dropoffDateTime: Date
        },
        terms: String
      }
    },
    customerResponse: {
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
      },
      responseTime: Date,
      responseMessage: String
    },
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
        enum: ['message', 'counter_offer', 'status_update', 'system'],
        default: 'message'
      }
    }]
  },
  
  // Driver assignment
  driver: {
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    driverNotes: String,
    driverInstructions: String,
    driverContact: {
      name: String,
      phone: String
    }
  },
  
  // External platform integration
  externalBooking: {
    platform: {
      type: String,
      enum: ['uber', 'lyft', 'grab', 'ola', 'bolt', 'custom', 'direct'],
      default: 'direct'
    },
    externalBookingId: String,
    externalReference: String,
    platformCommission: {
      type: Number,
      min: [0, 'Platform commission cannot be negative'],
      default: 0
    }
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
      min: [0, 'Refund amount cannot be negative'],
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
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
vehicleBookingRequestSchema.index({ customer: 1, createdAt: -1 });
vehicleBookingRequestSchema.index({ vehicleOwner: 1, createdAt: -1 });
vehicleBookingRequestSchema.index({ vehicle: 1, createdAt: -1 });
vehicleBookingRequestSchema.index({ status: 1, createdAt: -1 });
vehicleBookingRequestSchema.index({ 'timing.pickupDateTime': 1 });
vehicleBookingRequestSchema.index({ bookingReference: 1 });
vehicleBookingRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if booking request is expired
vehicleBookingRequestSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for checking if booking request is active
vehicleBookingRequestSchema.virtual('isActive').get(function() {
  return !this.isExpired && ['pending', 'confirmed', 'accepted'].includes(this.status);
});

// Virtual for checking if booking request can be cancelled
vehicleBookingRequestSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'accepted'].includes(this.status) && !this.isExpired;
});

// Virtual for calculating total duration
vehicleBookingRequestSchema.virtual('totalDuration').get(function() {
  return (new Date(this.timing.dropoffDateTime) - new Date(this.timing.pickupDateTime)) / (1000 * 60 * 60); // hours
});

// Middleware to update `updatedAt` field
vehicleBookingRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate booking reference
vehicleBookingRequestSchema.statics.generateBookingReference = function() {
  const prefix = 'VBR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method to get booking requests for a vehicle owner
vehicleBookingRequestSchema.statics.getOwnerBookings = async function(ownerId, filters = {}) {
  const query = { vehicleOwner: ownerId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query['timing.pickupDateTime'] = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  if (filters.search) {
    query.$or = [
      { bookingReference: { $regex: filters.search, $options: 'i' } },
      { 'contactInfo.primaryContact.name': { $regex: filters.search, $options: 'i' } },
      { 'contactInfo.primaryContact.phone': { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('customer', 'name email phone')
    .populate('vehicle', 'name make model type')
    .populate('driver.assignedDriver', 'name phone')
    .sort({ createdAt: -1 });
};

// Static method to get booking requests for a customer
vehicleBookingRequestSchema.statics.getCustomerBookings = async function(customerId, filters = {}) {
  const query = { customer: customerId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query['timing.pickupDateTime'] = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  return this.find(query)
    .populate('vehicleOwner', 'name email phone')
    .populate('vehicle', 'name make model type')
    .populate('driver.assignedDriver', 'name phone')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('VehicleBookingRequest', vehicleBookingRequestSchema);
