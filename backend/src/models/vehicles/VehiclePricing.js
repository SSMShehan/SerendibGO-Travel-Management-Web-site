const mongoose = require('mongoose');

const vehiclePricingSchema = new mongoose.Schema({
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
  pricingType: {
    type: String,
    enum: ['standard', 'dynamic', 'seasonal', 'event', 'custom'],
    default: 'standard',
    required: [true, 'Pricing type is required']
  },
  name: {
    type: String,
    required: [true, 'Pricing rule name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  basePricing: {
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
      default: 0
    },
    dailyRate: {
      type: Number,
      min: [0, 'Daily rate cannot be negative'],
      default: 0
    },
    weeklyRate: {
      type: Number,
      min: [0, 'Weekly rate cannot be negative'],
      default: 0
    },
    monthlyRate: {
      type: Number,
      min: [0, 'Monthly rate cannot be negative'],
      default: 0
    },
    perKmRate: {
      type: Number,
      min: [0, 'Per-km rate cannot be negative'],
      default: 0
    },
    minimumCharge: {
      type: Number,
      min: [0, 'Minimum charge cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
      default: 'USD'
    }
  },
  dynamicPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    factors: [{
      name: {
        type: String,
        required: [true, 'Factor name is required']
      },
      type: {
        type: String,
        enum: ['demand', 'time', 'weather', 'event', 'distance', 'custom'],
        required: [true, 'Factor type is required']
      },
      weight: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
        max: [1, 'Weight cannot exceed 1'],
        default: 0.5
      },
      multiplier: {
        type: Number,
        min: [0.1, 'Multiplier must be at least 0.1'],
        max: [5, 'Multiplier cannot exceed 5'],
        default: 1
      },
      conditions: [{
        field: String,
        operator: {
          type: String,
          enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'regex']
        },
        value: mongoose.Schema.Types.Mixed,
        adjustment: {
          type: Number,
          min: [-1, 'Adjustment cannot be less than -1'],
          max: [5, 'Adjustment cannot exceed 5'],
          default: 0
        }
      }]
    }]
  },
  seasonalPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    seasons: [{
      name: {
        type: String,
        required: [true, 'Season name is required']
      },
      startDate: {
        type: String, // MM-DD format
        required: [true, 'Start date is required']
      },
      endDate: {
        type: String, // MM-DD format
        required: [true, 'End date is required']
      },
      multiplier: {
        type: Number,
        min: [0.1, 'Multiplier must be at least 0.1'],
        max: [5, 'Multiplier cannot exceed 5'],
        default: 1
      },
      fixedRates: {
        hourlyRate: Number,
        dailyRate: Number,
        weeklyRate: Number,
        monthlyRate: Number,
        perKmRate: Number
      }
    }]
  },
  timeBasedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    timeSlots: [{
      name: {
        type: String,
        required: [true, 'Time slot name is required']
      },
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
      days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }],
      multiplier: {
        type: Number,
        min: [0.1, 'Multiplier must be at least 0.1'],
        max: [5, 'Multiplier cannot exceed 5'],
        default: 1
      },
      fixedRates: {
        hourlyRate: Number,
        dailyRate: Number,
        weeklyRate: Number,
        monthlyRate: Number,
        perKmRate: Number
      }
    }]
  },
  distancePricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    tiers: [{
      name: {
        type: String,
        required: [true, 'Tier name is required']
      },
      minDistance: {
        type: Number,
        min: [0, 'Minimum distance cannot be negative'],
        required: [true, 'Minimum distance is required']
      },
      maxDistance: {
        type: Number,
        min: [0, 'Maximum distance cannot be negative']
      },
      ratePerKm: {
        type: Number,
        min: [0, 'Rate per km cannot be negative'],
        required: [true, 'Rate per km is required']
      },
      discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [1, 'Discount cannot exceed 100%'],
        default: 0
      }
    }]
  },
  eventPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    events: [{
      name: {
        type: String,
        required: [true, 'Event name is required']
      },
      startDate: {
        type: Date,
        required: [true, 'Event start date is required']
      },
      endDate: {
        type: Date,
        required: [true, 'Event end date is required']
      },
      location: {
        city: String,
        district: String,
        radius: {
          type: Number,
          min: [0, 'Radius cannot be negative'],
          default: 0
        }
      },
      multiplier: {
        type: Number,
        min: [0.1, 'Multiplier must be at least 0.1'],
        max: [5, 'Multiplier cannot exceed 5'],
        default: 1
      },
      fixedRates: {
        hourlyRate: Number,
        dailyRate: Number,
        weeklyRate: Number,
        monthlyRate: Number,
        perKmRate: Number
      }
    }]
  },
  discounts: [{
    name: {
      type: String,
      required: [true, 'Discount name is required']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'bulk', 'loyalty', 'promo'],
      required: [true, 'Discount type is required']
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required']
    },
    conditions: {
      minDuration: Number, // minimum booking duration in hours
      minDistance: Number, // minimum distance in km
      minAmount: Number, // minimum booking amount
      validFrom: Date,
      validTo: Date,
      maxUses: Number,
      usedCount: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  surcharges: [{
    name: {
      type: String,
      required: [true, 'Surcharge name is required']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'per_km', 'per_hour'],
      required: [true, 'Surcharge type is required']
    },
    value: {
      type: Number,
      required: [true, 'Surcharge value is required']
    },
    conditions: {
      timeSlots: [String], // specific time slots
      days: [String], // specific days
      locations: [String], // specific locations
      vehicleTypes: [String], // specific vehicle types
      minAmount: Number // minimum booking amount to apply surcharge
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    default: 1
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

// Indexes for efficient queries
vehiclePricingSchema.index({ vehicle: 1, isActive: 1 });
vehiclePricingSchema.index({ owner: 1, isActive: 1 });
vehiclePricingSchema.index({ pricingType: 1, isActive: 1 });
vehiclePricingSchema.index({ priority: 1 });

// Virtual for checking if pricing rule is currently active
vehiclePricingSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // Check seasonal pricing
  if (this.seasonalPricing.enabled) {
    const currentMonthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const activeSeason = this.seasonalPricing.seasons.find(season => {
      return currentMonthDay >= season.startDate && currentMonthDay <= season.endDate;
    });
    if (activeSeason) return true;
  }
  
  // Check event pricing
  if (this.eventPricing.enabled) {
    const activeEvent = this.eventPricing.events.find(event => {
      return now >= event.startDate && now <= event.endDate;
    });
    if (activeEvent) return true;
  }
  
  return true;
});

// Middleware to update `updatedAt` field
vehiclePricingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate price for a booking
vehiclePricingSchema.statics.calculatePrice = async function(vehicleId, bookingData) {
  const { startTime, endTime, distance, location, date } = bookingData;
  
  // Get active pricing rules for the vehicle
  const pricingRules = await this.find({
    vehicle: vehicleId,
    isActive: true
  }).sort({ priority: 1 });
  
  if (pricingRules.length === 0) {
    throw new Error('No active pricing rules found for this vehicle');
  }
  
  let basePrice = 0;
  let finalPrice = 0;
  let appliedRules = [];
  
  // Calculate base price from the highest priority rule
  const primaryRule = pricingRules[0];
  const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60); // hours
  
  // Calculate base price based on duration and distance
  if (primaryRule.basePricing.hourlyRate > 0) {
    basePrice += primaryRule.basePricing.hourlyRate * duration;
  }
  if (primaryRule.basePricing.perKmRate > 0 && distance > 0) {
    basePrice += primaryRule.basePricing.perKmRate * distance;
  }
  if (primaryRule.basePricing.dailyRate > 0 && duration >= 24) {
    const days = Math.floor(duration / 24);
    basePrice += primaryRule.basePricing.dailyRate * days;
  }
  
  // Apply minimum charge
  if (primaryRule.basePricing.minimumCharge > 0 && basePrice < primaryRule.basePricing.minimumCharge) {
    basePrice = primaryRule.basePricing.minimumCharge;
  }
  
  finalPrice = basePrice;
  appliedRules.push({
    rule: primaryRule.name,
    type: 'base',
    amount: basePrice
  });
  
  // Apply additional pricing rules
  for (let i = 1; i < pricingRules.length; i++) {
    const rule = pricingRules[i];
    let rulePrice = 0;
    
    // Apply seasonal pricing
    if (rule.seasonalPricing.enabled) {
      const activeSeason = rule.seasonalPricing.seasons.find(season => {
        const bookingDate = new Date(date);
        const monthDay = `${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
        return monthDay >= season.startDate && monthDay <= season.endDate;
      });
      
      if (activeSeason) {
        rulePrice = basePrice * activeSeason.multiplier;
        appliedRules.push({
          rule: rule.name,
          type: 'seasonal',
          season: activeSeason.name,
          multiplier: activeSeason.multiplier,
          amount: rulePrice
        });
      }
    }
    
    // Apply time-based pricing
    if (rule.timeBasedPricing.enabled) {
      const bookingStartTime = new Date(startTime);
      const hour = bookingStartTime.getHours();
      const day = bookingStartTime.toLocaleDateString('en-US', { weekday: 'long' });
      
      const activeTimeSlot = rule.timeBasedPricing.timeSlots.find(slot => {
        const slotStart = parseInt(slot.startTime.split(':')[0]);
        const slotEnd = parseInt(slot.endTime.split(':')[0]);
        return hour >= slotStart && hour < slotEnd && slot.days.includes(day);
      });
      
      if (activeTimeSlot) {
        rulePrice = basePrice * activeTimeSlot.multiplier;
        appliedRules.push({
          rule: rule.name,
          type: 'time-based',
          timeSlot: activeTimeSlot.name,
          multiplier: activeTimeSlot.multiplier,
          amount: rulePrice
        });
      }
    }
    
    // Apply event pricing
    if (rule.eventPricing.enabled) {
      const bookingDate = new Date(date);
      const activeEvent = rule.eventPricing.events.find(event => {
        return bookingDate >= event.startDate && bookingDate <= event.endDate;
      });
      
      if (activeEvent) {
        rulePrice = basePrice * activeEvent.multiplier;
        appliedRules.push({
          rule: rule.name,
          type: 'event',
          event: activeEvent.name,
          multiplier: activeEvent.multiplier,
          amount: rulePrice
        });
      }
    }
    
    // Use the highest price from all rules
    if (rulePrice > finalPrice) {
      finalPrice = rulePrice;
    }
  }
  
  // Apply discounts
  let totalDiscount = 0;
  for (const rule of pricingRules) {
    for (const discount of rule.discounts) {
      if (discount.isActive && discount.conditions.validFrom <= new Date() && discount.conditions.validTo >= new Date()) {
        let discountAmount = 0;
        
        if (discount.type === 'percentage') {
          discountAmount = finalPrice * (discount.value / 100);
        } else if (discount.type === 'fixed') {
          discountAmount = discount.value;
        }
        
        totalDiscount += discountAmount;
        appliedRules.push({
          rule: rule.name,
          type: 'discount',
          discount: discount.name,
          amount: -discountAmount
        });
      }
    }
  }
  
  // Apply surcharges
  let totalSurcharge = 0;
  for (const rule of pricingRules) {
    for (const surcharge of rule.surcharges) {
      if (surcharge.isActive) {
        let surchargeAmount = 0;
        
        if (surcharge.type === 'percentage') {
          surchargeAmount = finalPrice * (surcharge.value / 100);
        } else if (surcharge.type === 'fixed') {
          surchargeAmount = surcharge.value;
        } else if (surcharge.type === 'per_km' && distance > 0) {
          surchargeAmount = surcharge.value * distance;
        } else if (surcharge.type === 'per_hour') {
          surchargeAmount = surcharge.value * duration;
        }
        
        totalSurcharge += surchargeAmount;
        appliedRules.push({
          rule: rule.name,
          type: 'surcharge',
          surcharge: surcharge.name,
          amount: surchargeAmount
        });
      }
    }
  }
  
  finalPrice = finalPrice - totalDiscount + totalSurcharge;
  
  return {
    basePrice,
    finalPrice: Math.max(0, finalPrice),
    currency: primaryRule.basePricing.currency,
    appliedRules,
    breakdown: {
      basePrice,
      discounts: totalDiscount,
      surcharges: totalSurcharge,
      finalPrice: Math.max(0, finalPrice)
    }
  };
};

module.exports = mongoose.model('VehiclePricing', vehiclePricingSchema);
