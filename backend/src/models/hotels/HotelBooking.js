const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({
  // References
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required']
  },
  
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Booking Details
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  
  numberOfRooms: {
    type: Number,
    required: [true, 'Number of rooms is required'],
    min: [1, 'Minimum number of rooms is 1'],
    default: 1
  },
  
  // Guest Information
  guests: {
    adults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      min: [1, 'At least one adult is required'],
      max: [10, 'Maximum 10 adults per room']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
      max: [8, 'Maximum 8 children per room']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infant count cannot be negative'],
      max: [4, 'Maximum 4 infants per room']
    }
  },
  
  // Guest Contact Details
  guestDetails: {
    firstName: {
      type: String,
      required: [true, 'Guest first name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Guest last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Guest phone number is required'],
      trim: true
    },
    nationality: {
      type: String,
      trim: true
    },
    passportNumber: {
      type: String,
      trim: true
    }
  },
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, 'Taxes cannot be negative']
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: [0, 'Service charge cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['LKR', 'USD', 'EUR', 'GBP'],
      default: 'LKR'
    }
  },
  
  // Status
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed'],
    default: 'pending'
  },
  
  // Additional Information
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  
  cancellationReason: {
    type: String,
    trim: true
  },
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  
  confirmedAt: {
    type: Date
  },
  
  cancelledAt: {
    type: Date
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
hotelBookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingReference = `HB${timestamp}${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
hotelBookingSchema.index({ hotel: 1, checkInDate: 1 });
hotelBookingSchema.index({ user: 1, bookedAt: -1 });
hotelBookingSchema.index({ bookingReference: 1 });

// Virtual for guest full name
hotelBookingSchema.virtual('guestFullName').get(function() {
  return `${this.guestDetails.firstName} ${this.guestDetails.lastName}`;
});

// Virtual for number of nights
hotelBookingSchema.virtual('numberOfNights').get(function() {
  const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if booking is active
hotelBookingSchema.methods.isActive = function() {
  const now = new Date();
  return this.bookingStatus === 'confirmed' && 
         this.checkInDate <= now && 
         this.checkOutDate > now;
};

// Method to check if booking can be cancelled
hotelBookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilCheckIn = (this.checkInDate - now) / (1000 * 60 * 60);
  return this.bookingStatus === 'confirmed' && hoursUntilCheckIn > 24;
};

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);
