const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Maximum participants must be at least 1']
  },
  minParticipants: {
    type: Number,
    default: 1,
    min: [1, 'Minimum participants must be at least 1']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['adventure', 'cultural', 'nature', 'beach', 'wildlife', 'religious', 'historical', 'culinary']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'easy'
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -90 && coords[0] <= 90 && 
                 coords[1] >= -180 && coords[1] <= 180;
        },
        message: 'Invalid coordinates'
      }
    },
    address: String,
    city: String,
    district: String
  },
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true
    },
    activities: [String],
    accommodation: String,
    meals: [String],
    highlights: [String]
  }],
  included: [String],
  excluded: [String],
  highlights: [String],
  requirements: [String],
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guide is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  tags: [String],
  seasonality: {
    bestMonths: [String],
    avoidMonths: [String]
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  cancellationDetails: String
}, {
  timestamps: true
});

// Indexes for better performance
tourSchema.index({ title: 'text', description: 'text', 'location.name': 'text' });
tourSchema.index({ category: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ duration: 1 });
tourSchema.index({ 'location.coordinates': '2dsphere' });
tourSchema.index({ isActive: 1, isFeatured: 1 });
tourSchema.index({ guide: 1 });

// Virtual for discount percentage
tourSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability
tourSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.maxParticipants > 0;
});

// Method to check availability for specific dates
tourSchema.methods.checkAvailability = function(startDate, endDate) {
  // This would be implemented with actual booking logic
  return this.isActive;
};

// Method to update rating
tourSchema.methods.updateRating = function() {
  const Booking = mongoose.model('Booking');
  return Booking.aggregate([
    { $match: { tour: this._id, status: 'completed' } },
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'booking',
      as: 'reviews'
    }},
    { $unwind: '$reviews' },
    { $group: {
      _id: null,
      averageRating: { $avg: '$reviews.rating' },
      totalReviews: { $sum: 1 }
    }}
  ]).then(result => {
    if (result.length > 0) {
      this.rating.average = Math.round(result[0].averageRating * 10) / 10;
      this.rating.count = result[0].totalReviews;
    }
    return this.save();
  });
};

// Pre-save middleware to ensure only one primary image
tourSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0) img.isPrimary = false;
      });
    }
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);

