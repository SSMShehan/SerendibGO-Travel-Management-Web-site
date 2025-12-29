const mongoose = require('mongoose');

const roomAvailabilitySchema = new mongoose.Schema({
  // References
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required']
  },
  
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required']
  },
  
  // Date and time
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  
  // Availability state
  status: {
    type: String,
    enum: [
      'available',      // Ready for booking
      'booked',         // Booked through our system
      'offline_booked', // Booked outside our system
      'maintenance',    // Under maintenance
      'blocked',        // Temporarily blocked by owner
      'out_of_order'    // Not functional
    ],
    default: 'available'
  },
  
  // Number of rooms available (for rooms with multiple units)
  availableRooms: {
    type: Number,
    default: 0,
    min: [0, 'Available rooms cannot be negative']
  },
  
  // Total rooms for this date
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [1, 'Total rooms must be at least 1']
  },
  
  // Pricing for this date (can override room base price)
  pricing: {
    basePrice: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['LKR', 'USD', 'EUR', 'GBP'],
      default: 'LKR'
    },
    isOverride: {
      type: Boolean,
      default: false
    }
  },
  
  // Booking details (for offline bookings)
  offlineBooking: {
    guestName: {
      type: String,
      trim: true
    },
    guestContact: {
      type: String,
      trim: true
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    },
    numberOfRooms: {
      type: Number,
      min: [1, 'Number of rooms must be at least 1']
    },
    notes: {
      type: String,
      trim: true
    }
  },
  
  // Maintenance details
  maintenance: {
    reason: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    estimatedCompletion: {
      type: Date
    },
    assignedTo: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  
  // Blocking details
  blocking: {
    reason: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes for better query performance
roomAvailabilitySchema.index({ room: 1, date: 1 }, { unique: true });
roomAvailabilitySchema.index({ hotel: 1, date: 1 });
roomAvailabilitySchema.index({ date: 1, status: 1 });
roomAvailabilitySchema.index({ status: 1 });

// Update updatedAt field on save
roomAvailabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if room is available for booking
roomAvailabilitySchema.virtual('isAvailableForBooking').get(function() {
  return this.status === 'available' && this.availableRooms > 0;
});

// Virtual for checking if room is in maintenance
roomAvailabilitySchema.virtual('isInMaintenance').get(function() {
  return this.status === 'maintenance';
});

// Virtual for checking if room is blocked
roomAvailabilitySchema.virtual('isBlocked').get(function() {
  return this.status === 'blocked' || this.status === 'out_of_order';
});

// Method to check if date is in the past
roomAvailabilitySchema.methods.isPastDate = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date < today;
};

// Method to check if date is today
roomAvailabilitySchema.methods.isToday = function() {
  const today = new Date();
  const recordDate = new Date(this.date);
  return today.toDateString() === recordDate.toDateString();
};

// Method to check if date is in the future
roomAvailabilitySchema.methods.isFutureDate = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date > today;
};

// Static method to get availability for date range
roomAvailabilitySchema.statics.getAvailabilityForRange = async function(roomId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return await this.find({
    room: roomId,
    date: {
      $gte: start,
      $lte: end
    }
  }).sort({ date: 1 });
};

// Static method to check for conflicts
roomAvailabilitySchema.statics.checkConflicts = async function(roomId, startDate, endDate, excludeId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const query = {
    room: roomId,
    date: {
      $gte: start,
      $lte: end
    },
    status: {
      $in: ['booked', 'offline_booked', 'maintenance', 'blocked', 'out_of_order']
    }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return await this.find(query);
};

// Static method to create default availability for a room
roomAvailabilitySchema.statics.createDefaultAvailability = async function(roomId, hotelId, startDate, endDate, createdBy) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const availabilities = [];
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    availabilities.push({
      room: roomId,
      hotel: hotelId,
      date: new Date(date),
      status: 'available',
      availableRooms: 1, // Default to 1 room available
      totalRooms: 1,
      createdBy: createdBy
    });
  }
  
  return await this.insertMany(availabilities);
};

module.exports = mongoose.model('RoomAvailability', roomAvailabilitySchema);
