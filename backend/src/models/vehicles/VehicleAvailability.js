const mongoose = require('mongoose');

const vehicleAvailabilitySchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vehicle owner is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance', 'blocked'],
      default: 'available'
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String,
    enum: ['available', 'maintenance', 'personal_use', 'holiday', 'other'],
    default: 'available'
  },
  customReason: {
    type: String,
    maxlength: [100, 'Custom reason cannot exceed 100 characters']
  },
  recurringPattern: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  recurringDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  recurringEndDate: {
    type: Date
  },
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

// Compound index for efficient queries
vehicleAvailabilitySchema.index({ vehicle: 1, date: 1 });
vehicleAvailabilitySchema.index({ owner: 1, date: 1 });
vehicleAvailabilitySchema.index({ date: 1, isAvailable: 1 });

// Virtual for checking if date is in the past
vehicleAvailabilitySchema.virtual('isPastDate').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date < today;
});

// Virtual for checking if date is today
vehicleAvailabilitySchema.virtual('isToday').get(function() {
  const today = new Date();
  const recordDate = new Date(this.date);
  return today.toDateString() === recordDate.toDateString();
});

// Virtual for checking if date is in the future
vehicleAvailabilitySchema.virtual('isFutureDate').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date > today;
});

// Middleware to update `updatedAt` field
vehicleAvailabilitySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get availability for a date range
vehicleAvailabilitySchema.statics.getAvailabilityRange = async function(vehicleId, startDate, endDate) {
  return this.find({
    vehicle: vehicleId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to check if vehicle is available for a specific time slot
vehicleAvailabilitySchema.statics.checkTimeSlotAvailability = async function(vehicleId, date, startTime, endTime) {
  const availability = await this.findOne({
    vehicle: vehicleId,
    date: date
  });

  if (!availability || !availability.isAvailable) {
    return false;
  }

  // Check if the requested time slot conflicts with any existing bookings
  const conflictingSlot = availability.timeSlots.find(slot => {
    if (slot.status === 'booked' || slot.status === 'blocked') {
      return (startTime >= slot.startTime && startTime < slot.endTime) ||
             (endTime > slot.startTime && endTime <= slot.endTime) ||
             (startTime <= slot.startTime && endTime >= slot.endTime);
    }
    return false;
  });

  return !conflictingSlot;
};

// Static method to create recurring availability
vehicleAvailabilitySchema.statics.createRecurringAvailability = async function(vehicleId, ownerId, startDate, endDate, pattern, days, timeSlots) {
  const availabilities = [];
  const currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    let shouldCreate = false;

    switch (pattern) {
      case 'daily':
        shouldCreate = true;
        break;
      case 'weekly':
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        shouldCreate = days.includes(dayName);
        break;
      case 'monthly':
        shouldCreate = currentDate.getDate() === startDate.getDate();
        break;
    }

    if (shouldCreate) {
      availabilities.push({
        vehicle: vehicleId,
        owner: ownerId,
        date: new Date(currentDate),
        timeSlots: timeSlots,
        isAvailable: true,
        reason: 'available',
        recurringPattern: pattern,
        recurringDays: days,
        recurringEndDate: endDate
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return this.insertMany(availabilities);
};

module.exports = mongoose.model('VehicleAvailability', vehicleAvailabilitySchema);
