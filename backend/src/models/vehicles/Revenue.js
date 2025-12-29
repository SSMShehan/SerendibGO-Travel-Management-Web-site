const mongoose = require('mongoose');

const revenueTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: [true, 'Transaction ID is required']
  },
  type: {
    type: String,
    enum: ['booking', 'commission', 'refund', 'penalty', 'bonus', 'adjustment', 'payout'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  currency: {
    type: String,
    enum: ['USD', 'LKR', 'EUR', 'GBP'],
    default: 'USD'
  },
  description: String,
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Trip', 'VehicleBookingRequest', 'MaintenanceRecord']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'mobile_money', 'check', 'other'],
    default: 'bank_transfer'
  },
  processedAt: Date,
  notes: String
}, { _id: false });

const revenueSchema = new mongoose.Schema({
  // Basic information
  vehicleOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vehicle owner is required']
  },
  
  // Revenue period
  period: {
    year: {
      type: Number,
      required: [true, 'Year is required']
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: [true, 'Month is required']
    },
    quarter: {
      type: Number,
      min: 1,
      max: 4
    }
  },
  
  // Revenue breakdown
  revenue: {
    grossRevenue: {
      type: Number,
      min: [0, 'Gross revenue cannot be negative'],
      default: 0
    },
    netRevenue: {
      type: Number,
      min: [0, 'Net revenue cannot be negative'],
      default: 0
    },
    platformCommission: {
      type: Number,
      min: [0, 'Platform commission cannot be negative'],
      default: 0
    },
    driverPayments: {
      type: Number,
      min: [0, 'Driver payments cannot be negative'],
      default: 0
    },
    maintenanceCosts: {
      type: Number,
      min: [0, 'Maintenance costs cannot be negative'],
      default: 0
    },
    insuranceCosts: {
      type: Number,
      min: [0, 'Insurance costs cannot be negative'],
      default: 0
    },
    fuelCosts: {
      type: Number,
      min: [0, 'Fuel costs cannot be negative'],
      default: 0
    },
    otherExpenses: {
      type: Number,
      min: [0, 'Other expenses cannot be negative'],
      default: 0
    }
  },
  
  // Transaction details
  transactions: [revenueTransactionSchema],
  
  // Performance metrics
  metrics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    averageBookingValue: {
      type: Number,
      default: 0
    },
    utilizationRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    repeatCustomers: {
      type: Number,
      default: 0
    }
  },
  
  // Payout information
  payout: {
    totalEarnings: {
      type: Number,
      min: [0, 'Total earnings cannot be negative'],
      default: 0
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0
    },
    pendingAmount: {
      type: Number,
      min: [0, 'Pending amount cannot be negative'],
      default: 0
    },
    payoutDate: Date,
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'check', 'cash', 'mobile_money'],
      default: 'bank_transfer'
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      branchName: String,
      accountHolderName: String
    }
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'paid', 'disputed'],
    default: 'draft'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'paid', 'disputed']
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
  
  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'system'],
      default: 'system'
    },
    version: {
      type: String,
      default: '1.0'
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
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
revenueSchema.index({ vehicleOwner: 1, 'period.year': -1, 'period.month': -1 });
revenueSchema.index({ 'period.year': -1, 'period.month': -1 });
revenueSchema.index({ status: 1, createdAt: -1 });
revenueSchema.index({ 'payout.payoutStatus': 1 });

// Virtual for checking if revenue is overdue for payout
revenueSchema.virtual('isOverdue').get(function() {
  return this.status === 'approved' && 
         this.payout.pendingAmount > 0 && 
         new Date() > new Date(this.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
});

// Virtual for calculating profit margin
revenueSchema.virtual('profitMargin').get(function() {
  if (this.revenue.grossRevenue <= 0) return 0;
  return ((this.revenue.netRevenue / this.revenue.grossRevenue) * 100).toFixed(2);
});

// Virtual for calculating ROI
revenueSchema.virtual('roi').get(function() {
  const totalCosts = this.revenue.platformCommission + 
                    this.revenue.driverPayments + 
                    this.revenue.maintenanceCosts + 
                    this.revenue.insuranceCosts + 
                    this.revenue.fuelCosts + 
                    this.revenue.otherExpenses;
  
  if (totalCosts <= 0) return 0;
  return (((this.revenue.netRevenue - totalCosts) / totalCosts) * 100).toFixed(2);
});

// Middleware to update `updatedAt` field
revenueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate transaction ID
revenueSchema.statics.generateTransactionId = function() {
  const prefix = 'TXN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method to get revenue for a specific period
revenueSchema.statics.getRevenueForPeriod = async function(vehicleOwnerId, year, month) {
  return this.findOne({
    vehicleOwner: vehicleOwnerId,
    'period.year': year,
    'period.month': month
  });
};

// Static method to get revenue statistics
revenueSchema.statics.getRevenueStats = async function(vehicleOwnerId, period = 'year') {
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'month':
      dateFilter = { 
        'period.year': now.getFullYear(),
        'period.month': now.getMonth() + 1
      };
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      dateFilter = { 
        'period.year': now.getFullYear(),
        'period.quarter': quarter
      };
      break;
    case 'year':
      dateFilter = { 'period.year': now.getFullYear() };
      break;
  }
  
  const query = vehicleOwnerId ? { vehicleOwner: vehicleOwnerId, ...dateFilter } : dateFilter;
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$revenue.grossRevenue' },
        totalNetRevenue: { $sum: '$revenue.netRevenue' },
        totalCommission: { $sum: '$revenue.platformCommission' },
        totalBookings: { $sum: '$metrics.totalBookings' },
        averageBookingValue: { $avg: '$metrics.averageBookingValue' },
        averageUtilization: { $avg: '$metrics.utilizationRate' },
        averageSatisfaction: { $avg: '$metrics.customerSatisfaction' }
      }
    }
  ]);
  
  return stats[0] || {
    totalRevenue: 0,
    totalNetRevenue: 0,
    totalCommission: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    averageUtilization: 0,
    averageSatisfaction: 0
  };
};

module.exports = mongoose.model('Revenue', revenueSchema);
