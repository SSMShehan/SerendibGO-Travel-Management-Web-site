const mongoose = require('mongoose');

const vehicleBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  
  // Vehicle and User References
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Trip Details
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
        latitude: Number,
        longitude: Number
      }
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
        latitude: Number,
        longitude: Number
      }
    },
    
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    
    duration: {
      type: Number, // in hours
      required: true
    },
    
    distance: {
      type: Number, // in kilometers
      default: 0
    }
  },
  
  // Passenger Details
  passengers: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least 1 adult is required']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infants count cannot be negative']
    }
  },
  
  // Guest Details
  guestDetails: {
    firstName: {
      type: String,
      required: [true, 'First name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    nationality: String,
    passportNumber: String
  },
  
  // Special Requests
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  
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
    durationPrice: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    serviceCharge: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  
  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed', 'partial'],
    default: 'pending'
  },
  
  // Payment Details
  paymentDetails: {
    method: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'digital_wallet']
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  },
  
  // Driver Assignment
  driver: {
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    driverNotes: String
  },
  
  // Trip Status Updates
  statusUpdates: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Cancellation Details
  cancellationDetails: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  
  // Reviews and Ratings
  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    reviewedAt: Date,
    vehicleRating: {
      cleanliness: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      driver: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 }
    }
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
vehicleBookingSchema.index({ vehicle: 1 });
vehicleBookingSchema.index({ user: 1 });
vehicleBookingSchema.index({ bookingReference: 1 });
vehicleBookingSchema.index({ bookingStatus: 1 });
vehicleBookingSchema.index({ paymentStatus: 1 });
vehicleBookingSchema.index({ 'tripDetails.startDate': 1 });
vehicleBookingSchema.index({ 'tripDetails.endDate': 1 });

// Virtual for total passengers
vehicleBookingSchema.virtual('totalPassengers').get(function() {
  return this.passengers.adults + this.passengers.children + this.passengers.infants;
});

// Virtual for trip duration in days
vehicleBookingSchema.virtual('tripDurationDays').get(function() {
  const start = new Date(this.tripDetails.startDate);
  const end = new Date(this.tripDetails.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Method to check if booking is active
vehicleBookingSchema.methods.isActive = function() {
  const now = new Date();
  return this.bookingStatus === 'confirmed' || 
         this.bookingStatus === 'in_progress' ||
         (this.bookingStatus === 'pending' && this.tripDetails.startDate > now);
};

// Method to check if booking can be cancelled
vehicleBookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilTrip = (this.tripDetails.startDate - now) / (1000 * 60 * 60);
  
  return this.bookingStatus === 'pending' || 
         this.bookingStatus === 'confirmed' ||
         (this.bookingStatus === 'in_progress' && hoursUntilTrip > 2);
};

// Method to calculate cancellation fee
vehicleBookingSchema.methods.calculateCancellationFee = function() {
  const now = new Date();
  const hoursUntilTrip = (this.tripDetails.startDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilTrip > 24) {
    return 0; // Free cancellation
  } else if (hoursUntilTrip > 2) {
    return this.pricing.totalPrice * 0.1; // 10% fee
  } else {
    return this.pricing.totalPrice * 0.5; // 50% fee
  }
};

// Pre-save middleware
vehicleBookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate booking reference if not provided
  if (!this.bookingReference) {
    this.bookingReference = `VB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  
  // Calculate duration if not provided
  if (!this.tripDetails.duration) {
    const start = new Date(this.tripDetails.startDate);
    const end = new Date(this.tripDetails.endDate);
    this.tripDetails.duration = Math.ceil((end - start) / (1000 * 60 * 60));
  }
  
  // Calculate total price if not provided
  if (!this.pricing.totalPrice) {
    this.pricing.totalPrice = this.pricing.basePrice + 
                             this.pricing.distancePrice + 
                             this.pricing.durationPrice + 
                             this.pricing.taxes + 
                             this.pricing.serviceCharge;
  }
  
  next();
});

module.exports = mongoose.model('VehicleBooking', vehicleBookingSchema);
