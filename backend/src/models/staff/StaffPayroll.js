const mongoose = require('mongoose');

const StaffPayrollSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Salary Information
  salary: {
    baseSalary: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'EUR']
    },
    payFrequency: {
      type: String,
      enum: ['monthly', 'weekly', 'daily'],
      default: 'monthly'
    },
    payDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    }
  },

  // Allowances and Deductions
  allowances: {
    housing: {
      type: Number,
      default: 0,
      min: 0
    },
    transport: {
      type: Number,
      default: 0,
      min: 0
    },
    medical: {
      type: Number,
      default: 0,
      min: 0
    },
    meal: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  deductions: {
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    epf: {
      type: Number,
      default: 0,
      min: 0
    },
    etf: {
      type: Number,
      default: 0,
      min: 0
    },
    loan: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Payment History
  paymentHistory: [{
    period: {
      startDate: Date,
      endDate: Date
    },
    grossSalary: Number,
    totalAllowances: Number,
    totalDeductions: Number,
    netSalary: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date,
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'cheque'],
      default: 'bank_transfer'
    },
    transactionId: String,
    notes: String
  }],

  // Bank Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    branchCode: String,
    swiftCode: String
  },

  // Status and Settings
  isActive: {
    type: Boolean,
    default: true
  },
  
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Additional Information
  notes: String,
  
  // Performance Bonuses
  bonuses: [{
    amount: Number,
    reason: String,
    period: String,
    awardedAt: {
      type: Date,
      default: Date.now
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Overtime Settings
  overtimeSettings: {
    hourlyRate: {
      type: Number,
      default: 0
    },
    maxHoursPerDay: {
      type: Number,
      default: 8
    },
    weekendMultiplier: {
      type: Number,
      default: 1.5
    },
    holidayMultiplier: {
      type: Number,
      default: 2.0
    }
  }
}, {
  timestamps: true
});

// Indexes
StaffPayrollSchema.index({ staff: 1 });
StaffPayrollSchema.index({ 'paymentHistory.status': 1 });
StaffPayrollSchema.index({ isActive: 1 });

// Virtual for calculating total allowances
StaffPayrollSchema.virtual('totalAllowances').get(function() {
  const allowances = this.allowances;
  return allowances.housing + allowances.transport + allowances.medical + 
         allowances.meal + allowances.other;
});

// Virtual for calculating total deductions
StaffPayrollSchema.virtual('totalDeductions').get(function() {
  const deductions = this.deductions;
  return deductions.tax + deductions.epf + deductions.etf + 
         deductions.loan + deductions.other;
});

// Virtual for calculating gross salary
StaffPayrollSchema.virtual('grossSalary').get(function() {
  return this.salary.baseSalary + this.totalAllowances;
});

// Virtual for calculating net salary
StaffPayrollSchema.virtual('netSalary').get(function() {
  return this.grossSalary - this.totalDeductions;
});

// Method to add payment record
StaffPayrollSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push({
    ...paymentData,
    grossSalary: this.grossSalary,
    totalAllowances: this.totalAllowances,
    totalDeductions: this.totalDeductions,
    netSalary: this.netSalary
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to calculate salary for a specific period
StaffPayrollSchema.methods.calculatePeriodSalary = function(startDate, endDate, overtimeHours = 0) {
  const baseSalary = this.salary.baseSalary;
  const allowances = this.totalAllowances;
  const deductions = this.totalDeductions;
  
  // Calculate overtime pay
  const overtimePay = overtimeHours * this.overtimeSettings.hourlyRate;
  
  const grossSalary = baseSalary + allowances + overtimePay;
  const netSalary = grossSalary - deductions;
  
  return {
    baseSalary,
    allowances,
    overtimePay,
    deductions,
    grossSalary,
    netSalary
  };
};

module.exports = mongoose.model('StaffPayroll', StaffPayrollSchema);
