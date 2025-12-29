const mongoose = require('mongoose');

const maintenanceItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Maintenance item name is required']
  },
  description: String,
  category: {
    type: String,
    enum: ['engine', 'brakes', 'tires', 'electrical', 'body', 'interior', 'safety', 'other'],
    required: [true, 'Maintenance category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative'],
    default: 0
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  images: [String], // URLs to maintenance photos
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const maintenanceRecordSchema = new mongoose.Schema({
  // Basic information
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
  
  // Maintenance details
  maintenanceType: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'emergency', 'recall', 'upgrade'],
    required: [true, 'Maintenance type is required']
  },
  maintenanceReference: {
    type: String,
    unique: true,
    required: [true, 'Maintenance reference is required']
  },
  
  // Service provider information
  serviceProvider: {
    name: {
      type: String,
      required: [true, 'Service provider name is required']
    },
    type: {
      type: String,
      enum: ['dealership', 'independent_garage', 'mobile_service', 'owner', 'other'],
      required: [true, 'Service provider type is required']
    },
    contactInfo: {
      phone: String,
      email: String,
      address: String
    },
    licenseNumber: String,
    certification: String
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  actualStartDate: Date,
  actualEndDate: Date,
  estimatedDuration: {
    type: Number, // in hours
    default: 1
  },
  actualDuration: Number, // in hours
  
  // Maintenance items
  maintenanceItems: [maintenanceItemSchema],
  
  // Mileage and odometer
  odometerReading: {
    type: Number,
    min: [0, 'Odometer reading cannot be negative'],
    required: [true, 'Odometer reading is required']
  },
  nextServiceMileage: Number,
  nextServiceDate: Date,
  
  // Costs and payments
  costs: {
    laborCost: {
      type: Number,
      min: [0, 'Labor cost cannot be negative'],
      default: 0
    },
    partsCost: {
      type: Number,
      min: [0, 'Parts cost cannot be negative'],
      default: 0
    },
    additionalFees: [{
      name: String,
      amount: {
        type: Number,
        min: [0, 'Additional fee cannot be negative']
      }
    }],
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
      required: [true, 'Total cost is required']
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'GBP'],
      default: 'USD'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'overdue'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'check', 'other'],
      default: 'cash'
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0
    },
    paidDate: Date
  },
  
  // Warranty and guarantees
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    warrantyPeriod: {
      type: Number, // in months
      default: 0
    },
    warrantyEndDate: Date,
    warrantyTerms: String
  },
  
  // Documentation
  documents: {
    invoice: String,
    receipt: String,
    warrantyCard: String,
    serviceReport: String,
    inspectionReport: String,
    otherDocuments: [String]
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'scheduled'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']
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
  
  // Quality and feedback
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  recommendations: String,
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  
  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone', 'walk_in'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
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
maintenanceRecordSchema.index({ vehicle: 1, createdAt: -1 });
maintenanceRecordSchema.index({ vehicleOwner: 1, createdAt: -1 });
maintenanceRecordSchema.index({ status: 1, createdAt: -1 });
maintenanceRecordSchema.index({ scheduledDate: 1 });
maintenanceRecordSchema.index({ maintenanceReference: 1 });
maintenanceRecordSchema.index({ 'serviceProvider.name': 1 });

// Virtual for checking if maintenance is overdue
maintenanceRecordSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && new Date() > this.scheduledDate;
});

// Virtual for checking if maintenance is upcoming
maintenanceRecordSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const scheduledDate = new Date(this.scheduledDate);
  const diffTime = scheduledDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7; // Upcoming within 7 days
});

// Virtual for calculating maintenance cost per mile
maintenanceRecordSchema.virtual('costPerMile').get(function() {
  if (this.odometerReading <= 0) return 0;
  return this.costs.totalCost / this.odometerReading;
});

// Middleware to update `updatedAt` field
maintenanceRecordSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate maintenance reference
maintenanceRecordSchema.statics.generateMaintenanceReference = function() {
  const prefix = 'MNT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method to get maintenance records for a vehicle
maintenanceRecordSchema.statics.getVehicleMaintenance = async function(vehicleId, filters = {}) {
  const query = { vehicle: vehicleId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.maintenanceType) {
    query.maintenanceType = filters.maintenanceType;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query.scheduledDate = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }
  
  if (filters.serviceProvider) {
    query['serviceProvider.name'] = { $regex: filters.serviceProvider, $options: 'i' };
  }
  
  return this.find(query)
    .populate('vehicle', 'name make model')
    .populate('vehicleOwner', 'name email')
    .populate('statusHistory.updatedBy', 'name email')
    .sort({ scheduledDate: -1 });
};

// Static method to get maintenance statistics
maintenanceRecordSchema.statics.getMaintenanceStats = async function(vehicleId, period = 'year') {
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      break;
    case 'quarter':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
      break;
  }
  
  const query = vehicleId ? { vehicle: vehicleId, ...dateFilter } : dateFilter;
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalMaintenance: { $sum: 1 },
        totalCost: { $sum: '$costs.totalCost' },
        averageCost: { $avg: '$costs.totalCost' },
        completedMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        inProgressMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        averageRating: { $avg: '$qualityRating' },
        averageServiceRating: { $avg: '$serviceRating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalMaintenance: 0,
    totalCost: 0,
    averageCost: 0,
    completedMaintenance: 0,
    pendingMaintenance: 0,
    inProgressMaintenance: 0,
    averageRating: 0,
    averageServiceRating: 0
  };
};

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
