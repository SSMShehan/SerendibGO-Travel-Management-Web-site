const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  // Location Information (Sri Lankan specific)
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: [
        'Colombo', 'Kandy', 'Galle', 'Negombo', 'Bentota', 'Hikkaduwa', 
        'Unawatuna', 'Mirissa', 'Weligama', 'Tangalle', 'Arugam Bay',
        'Nuwara Eliya', 'Ella', 'Bandarawela', 'Haputale',
        'Sigiriya', 'Dambulla', 'Anuradhapura', 'Polonnaruwa', 'Trincomalee',
        'Batticaloa', 'Jaffna', 'Kalpitiya', 'Chilaw', 'Puttalam'
      ]
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      enum: [
        'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
        'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
        'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
        'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
        'Monaragala', 'Ratnapura', 'Kegalle'
      ]
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [5.9, 'Invalid latitude for Sri Lanka'],
        max: [9.8, 'Invalid latitude for Sri Lanka']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [79.7, 'Invalid longitude for Sri Lanka'],
        max: [81.9, 'Invalid longitude for Sri Lanka']
      }
    },
    area: {
      type: String,
      enum: [
        'Beach', 'Hill Country', 'Cultural Triangle', 'Wildlife', 'City Center',
        'Suburbs', 'Heritage Site', 'National Park', 'Plantation', 'Coastal'
      ]
    }
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String,
    emergencyContact: String
  },
  
  // Hotel Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hotel owner is required']
  },
  
  // Hotel Category (Sri Lankan specific)
  category: {
    type: String,
    required: [true, 'Hotel category is required'],
    enum: [
      'Beach Resort', 'Hill Station Hotel', 'Heritage Hotel', 'Wildlife Lodge',
      'Ayurveda Retreat', 'Boutique Hotel', 'Budget Hostel', 'Luxury Hotel',
      'Guest House', 'Villa', 'Eco Lodge', 'Plantation Bungalow'
    ]
  },
  
  // Star Rating
  starRating: {
    type: Number,
    min: [1, 'Minimum star rating is 1'],
    max: [5, 'Maximum star rating is 5'],
    default: 3
  },
  
  // Tourist-Focused Amenities
  amenities: {
    // Basic Amenities
    wifi: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
    bar: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    spa: { type: Boolean, default: false },
    
    // Tourist-Specific Amenities
    airportPickup: { type: Boolean, default: false },
    tourBooking: { type: Boolean, default: false },
    currencyExchange: { type: Boolean, default: false },
    laundryService: { type: Boolean, default: false },
    englishSpeakingStaff: { type: Boolean, default: false },
    localTransportation: { type: Boolean, default: false },
    safetyDepositBox: { type: Boolean, default: false },
    internationalAdapters: { type: Boolean, default: false },
    
    // Sri Lankan Specific
    ayurveda: { type: Boolean, default: false },
    culturalShows: { type: Boolean, default: false },
    localCuisine: { type: Boolean, default: false },
    heritageExperience: { type: Boolean, default: false },
    wildlifeSafari: { type: Boolean, default: false },
    plantationTour: { type: Boolean, default: false }
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
      enum: ['exterior', 'interior', 'room', 'amenity', 'restaurant', 'pool', 'spa', 'view']
    }
  }],
  
  // Room Types
  roomTypes: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    maxOccupancy: {
      type: Number,
      required: true,
      min: [1, 'Minimum occupancy is 1']
    },
    bedTypes: [{
      type: String,
      enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Triple', 'Family']
    }],
    size: {
      type: Number, // in square meters
      min: [10, 'Minimum room size is 10 sqm']
    },
    amenities: [String],
    images: [String],
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    seasonalRates: [{
      name: String,
      startDate: Date,
      endDate: Date,
      multiplier: {
        type: Number,
        default: 1
      }
    }],
    availability: {
      type: Number,
      default: 0,
      min: [0, 'Availability cannot be negative']
    }
  }],
  
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
    cancellationPolicy: {
      type: String,
      enum: ['Free cancellation', '24 hours', '48 hours', '7 days', '14 days', 'Non-refundable'],
      default: '24 hours'
    },
    petPolicy: {
      type: String,
      enum: ['Pets allowed', 'Pets not allowed', 'Pets allowed with fee'],
      default: 'Pets not allowed'
    },
    childPolicy: {
      type: String,
      default: 'Children welcome'
    },
    smokingPolicy: {
      type: String,
      enum: ['Non-smoking', 'Smoking allowed', 'Designated smoking areas'],
      default: 'Non-smoking'
    }
  },
  
  // Tourist Information
  touristInfo: {
    nearbyAttractions: [{
      name: String,
      distance: Number, // in km
      type: {
        type: String,
        enum: ['UNESCO Site', 'Beach', 'Temple', 'National Park', 'Museum', 'Market', 'Restaurant']
      }
    }],
    transportation: {
      airportDistance: Number, // in km
      trainStationDistance: Number,
      busStationDistance: Number,
      tukTukAvailable: { type: Boolean, default: false },
      carRentalAvailable: { type: Boolean, default: false }
    },
    localEvents: [{
      name: String,
      date: Date,
      description: String
    }]
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'draft'
  },
  
  approvalDate: Date,
  rejectionReason: String,
  
  // Ratings and Reviews
  ratings: {
    overall: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: { type: Number, default: 0, min: 0, max: 5 },
    location: { type: Number, default: 0, min: 0, max: 5 },
    service: { type: Number, default: 0, min: 0, max: 5 },
    value: { type: Number, default: 0, min: 0, max: 5 },
    amenities: { type: Number, default: 0, min: 0, max: 5 }
  },
  
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Business Information
  isActive: {
    type: Boolean,
    default: true
  },
  
  featured: {
    type: Boolean,
    default: false
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
hotelSchema.index({ 'location.city': 1 });
hotelSchema.index({ 'location.district': 1 });
hotelSchema.index({ category: 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ 'ratings.overall': -1 });
hotelSchema.index({ featured: 1 });
hotelSchema.index({ 'location.coordinates': '2dsphere' });

// Include virtual fields in JSON output
hotelSchema.set('toJSON', { virtuals: true });
hotelSchema.set('toObject', { virtuals: true });

// Virtual for average room price
hotelSchema.virtual('averageRoomPrice').get(function() {
  if (!this.roomTypes || this.roomTypes.length === 0) return 0;
  const totalPrice = this.roomTypes.reduce((sum, room) => sum + room.basePrice, 0);
  return totalPrice / this.roomTypes.length;
});

// Virtual for primary image
hotelSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : this.images[0].url;
});

// Method to calculate distance from a point
hotelSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.location.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to update ratings
hotelSchema.methods.updateRatings = function() {
  // This would be called when a new review is added
  // Implementation would calculate average ratings from reviews
};

// Pre-save middleware
hotelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
