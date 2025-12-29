const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Hotel Reference
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required']
  },
  
  // Room Type
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: [
      'Standard', 'Deluxe', 'Superior', 'Executive', 'Suite', 'Presidential Suite',
      'Family Room', 'Twin Room', 'Double Room', 'Single Room', 'Dormitory',
      'Villa', 'Bungalow', 'Chalet', 'Cottage'
    ]
  },
  
  // Occupancy
  maxOccupancy: {
    adults: {
      type: Number,
      required: [true, 'Adult occupancy is required'],
      min: [1, 'Minimum adult occupancy is 1'],
      max: [10, 'Maximum adult occupancy is 10']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children occupancy cannot be negative'],
      max: [8, 'Maximum children occupancy is 8']
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, 'Infant occupancy cannot be negative'],
      max: [4, 'Maximum infant occupancy is 4']
    }
  },
  
  // Room Size
  size: {
    type: Number, // in square meters
    min: [10, 'Minimum room size is 10 sqm'],
    max: [500, 'Maximum room size is 500 sqm']
  },
  
  // Bed Configuration
  bedConfiguration: [{
    type: {
      type: String,
      required: true,
      enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Sofa Bed', 'Bunk Bed']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Minimum bed quantity is 1']
    },
    size: {
      type: String,
      enum: ['90cm', '120cm', '135cm', '150cm', '180cm', '200cm']
    }
  }],
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR', 'GBP']
    },
    seasonalRates: [{
      name: {
        type: String,
        required: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      priceMultiplier: {
        type: Number,
        default: 1,
        min: [0.1, 'Minimum price multiplier is 0.1'],
        max: [5, 'Maximum price multiplier is 5']
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    discounts: [{
      name: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'early_bird', 'last_minute']
      },
      value: Number,
      minStay: Number,
      advanceBooking: Number, // days in advance
      validFrom: Date,
      validTo: Date,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Amenities
  amenities: {
    // Basic Amenities
    airConditioning: { type: Boolean, default: false },
    fan: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    television: { type: Boolean, default: false },
    minibar: { type: Boolean, default: false },
    safe: { type: Boolean, default: false },
    telephone: { type: Boolean, default: false },
    alarmClock: { type: Boolean, default: false },
    
    // Bathroom Amenities
    privateBathroom: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false },
    bathtub: { type: Boolean, default: false },
    shower: { type: Boolean, default: false },
    toiletries: { type: Boolean, default: false },
    hairdryer: { type: Boolean, default: false },
    towels: { type: Boolean, default: false },
    
    // Room Features
    balcony: { type: Boolean, default: false },
    seaView: { type: Boolean, default: false },
    mountainView: { type: Boolean, default: false },
    gardenView: { type: Boolean, default: false },
    cityView: { type: Boolean, default: false },
    poolView: { type: Boolean, default: false },
    workDesk: { type: Boolean, default: false },
    seatingArea: { type: Boolean, default: false },
    diningArea: { type: Boolean, default: false },
    kitchenette: { type: Boolean, default: false },
    
    // Accessibility
    wheelchairAccessible: { type: Boolean, default: false },
    accessibleBathroom: { type: Boolean, default: false },
    accessibleElevator: { type: Boolean, default: false },
    
    // Additional Services
    roomService: { type: Boolean, default: false },
    housekeeping: { type: Boolean, default: false },
    laundryService: { type: Boolean, default: false },
    wakeUpService: { type: Boolean, default: false }
  },
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['room', 'bathroom', 'view', 'amenity', 'bedroom', 'living_area']
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Availability
  availability: {
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms is required'],
      min: [1, 'Minimum total rooms is 1']
    },
    availableRooms: {
      type: Number,
      default: 0,
      min: [0, 'Available rooms cannot be negative']
    },
    blockedRooms: {
      type: Number,
      default: 0,
      min: [0, 'Blocked rooms cannot be negative']
    },
    maintenanceRooms: {
      type: Number,
      default: 0,
      min: [0, 'Maintenance rooms cannot be negative']
    }
  },
  
  // Policies
  policies: {
    checkInTime: {
      type: String,
      default: '14:00'
    },
    checkOutTime: {
      type: String,
      default: '12:00'
    },
    minStay: {
      type: Number,
      default: 1,
      min: [1, 'Minimum stay is 1 night']
    },
    maxStay: {
      type: Number,
      default: 30,
      min: [1, 'Maximum stay is 1 night']
    },
    cancellationPolicy: {
      type: String,
      enum: ['Free cancellation', '24 hours', '48 hours', '7 days', '14 days', 'Non-refundable'],
      default: '24 hours'
    },
    ageRestrictions: {
      minAge: {
        type: Number,
        default: 0
      },
      maxAge: {
        type: Number,
        default: 100
      }
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'renovation'],
    default: 'active'
  },
  
  // General Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Ratings
  ratings: {
    overall: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: { type: Number, default: 0, min: 0, max: 5 },
    comfort: { type: Number, default: 0, min: 0, max: 5 },
    location: { type: Number, default: 0, min: 0, max: 5 },
    value: { type: Number, default: 0, min: 0, max: 5 }
  },
  
  reviewCount: {
    type: Number,
    default: 0
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
  timestamps: true
});

// Indexes for better performance
roomSchema.index({ hotel: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ 'pricing.basePrice': 1 });
roomSchema.index({ 'ratings.overall': -1 });

// Virtual for current price (considering seasonal rates)
roomSchema.virtual('currentPrice').get(function() {
  const now = new Date();
  const seasonalRate = this.pricing.seasonalRates.find(rate => 
    rate.isActive && 
    now >= rate.startDate && 
    now <= rate.endDate
  );
  
  if (seasonalRate) {
    return this.pricing.basePrice * seasonalRate.priceMultiplier;
  }
  
  return this.pricing.basePrice;
});

// Virtual for primary image
roomSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Method to check availability for date range
roomSchema.methods.checkAvailability = function(startDate, endDate, quantity = 1) {
  // This would check against bookings for the date range
  // Implementation would query the Booking model
  return this.availability.availableRooms >= quantity;
};

// Method to calculate price for date range
roomSchema.methods.calculatePrice = function(startDate, endDate, quantity = 1) {
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  let totalPrice = 0;
  
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const seasonalRate = this.pricing.seasonalRates.find(rate => 
      rate.isActive && 
      currentDate >= rate.startDate && 
      currentDate <= rate.endDate
    );
    
    const dailyPrice = seasonalRate ? 
      this.pricing.basePrice * seasonalRate.priceMultiplier : 
      this.pricing.basePrice;
    
    totalPrice += dailyPrice;
  }
  
  return totalPrice * quantity;
};

// Pre-save middleware
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure available rooms don't exceed total rooms
  if (this.availability.availableRooms > this.availability.totalRooms) {
    this.availability.availableRooms = this.availability.totalRooms;
  }
  
  next();
});

module.exports = mongoose.model('Room', roomSchema);
