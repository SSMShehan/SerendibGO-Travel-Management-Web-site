const mongoose = require('mongoose');

const externalBookingIntegrationSchema = new mongoose.Schema({
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
  platform: {
    type: String,
    enum: ['uber', 'lyft', 'grab', 'ola', 'bolt', 'custom', 'api'],
    required: [true, 'Platform is required']
  },
  platformName: {
    type: String,
    required: [true, 'Platform name is required'],
    trim: true,
    maxlength: [100, 'Platform name cannot exceed 100 characters']
  },
  integrationType: {
    type: String,
    enum: ['api', 'webhook', 'manual', 'csv', 'xml'],
    default: 'api',
    required: [true, 'Integration type is required']
  },
  credentials: {
    apiKey: {
      type: String,
      trim: true
    },
    apiSecret: {
      type: String,
      trim: true
    },
    accessToken: {
      type: String,
      trim: true
    },
    refreshToken: {
      type: String,
      trim: true
    },
    webhookUrl: {
      type: String,
      trim: true
    },
    webhookSecret: {
      type: String,
      trim: true
    },
    endpoint: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      trim: true
    }
  },
  settings: {
    autoAccept: {
      type: Boolean,
      default: false
    },
    autoReject: {
      type: Boolean,
      default: false
    },
    minAdvanceBooking: {
      type: Number,
      min: [0, 'Minimum advance booking cannot be negative'],
      default: 0
    },
    maxAdvanceBooking: {
      type: Number,
      min: [0, 'Maximum advance booking cannot be negative'],
      default: 30
    },
    workingHours: {
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format']
      },
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format']
      }
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    serviceAreas: [{
      city: String,
      district: String,
      radius: {
        type: Number,
        min: [0, 'Radius cannot be negative'],
        default: 0
      }
    }],
    pricingRules: {
      usePlatformPricing: {
        type: Boolean,
        default: false
      },
      markupPercentage: {
        type: Number,
        min: [0, 'Markup percentage cannot be negative'],
        max: [100, 'Markup percentage cannot exceed 100%'],
        default: 0
      },
      markupAmount: {
        type: Number,
        min: [0, 'Markup amount cannot be negative'],
        default: 0
      },
      currency: {
        type: String,
        enum: ['USD', 'LKR', 'EUR', 'GBP'],
        default: 'USD'
      }
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      webhookNotifications: {
        type: Boolean,
        default: false
      }
    },
    syncSettings: {
      syncFrequency: {
        type: String,
        enum: ['realtime', '5min', '15min', '30min', '1hour', 'manual'],
        default: 'realtime'
      },
      syncBookings: {
        type: Boolean,
        default: true
      },
      syncAvailability: {
        type: Boolean,
        default: true
      },
      syncPricing: {
        type: Boolean,
        default: false
      },
      syncStatus: {
        type: Boolean,
        default: true
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'error', 'suspended'],
    default: 'pending'
  },
  lastSync: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: ['success', 'error', 'pending', 'never'],
    default: 'never'
  },
  syncError: {
    message: String,
    code: String,
    timestamp: Date
  },
  statistics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    successfulBookings: {
      type: Number,
      default: 0
    },
    failedBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    platformCommission: {
      type: Number,
      default: 0
    },
    lastBookingDate: Date,
    averageRating: {
      type: Number,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5'],
      default: 0
    }
  },
  webhooks: [{
    event: {
      type: String,
      required: [true, 'Webhook event is required']
    },
    url: {
      type: String,
      required: [true, 'Webhook URL is required']
    },
    secret: String,
    isActive: {
      type: Boolean,
      default: true
    },
    lastTriggered: Date,
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    }
  }],
  apiEndpoints: [{
    name: {
      type: String,
      required: [true, 'Endpoint name is required']
    },
    url: {
      type: String,
      required: [true, 'Endpoint URL is required']
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'GET'
    },
    headers: [{
      key: String,
      value: String
    }],
    authentication: {
      type: String,
      enum: ['none', 'basic', 'bearer', 'api_key', 'oauth'],
      default: 'none'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsed: Date,
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    }
  }],
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
externalBookingIntegrationSchema.index({ vehicle: 1, status: 1 });
externalBookingIntegrationSchema.index({ owner: 1, status: 1 });
externalBookingIntegrationSchema.index({ platform: 1, status: 1 });
externalBookingIntegrationSchema.index({ 'settings.syncSettings.syncFrequency': 1 });

// Virtual for checking if integration is currently active
externalBookingIntegrationSchema.virtual('isCurrentlyActive').get(function() {
  return this.status === 'active' && this.lastSync && 
         (new Date() - this.lastSync) < (24 * 60 * 60 * 1000); // Active if synced within 24 hours
});

// Virtual for checking if integration needs sync
externalBookingIntegrationSchema.virtual('needsSync').get(function() {
  if (!this.lastSync) return true;
  
  const now = new Date();
  const timeSinceLastSync = now - this.lastSync;
  
  switch (this.settings.syncSettings.syncFrequency) {
    case 'realtime':
      return timeSinceLastSync > (5 * 60 * 1000); // 5 minutes
    case '5min':
      return timeSinceLastSync > (5 * 60 * 1000);
    case '15min':
      return timeSinceLastSync > (15 * 60 * 1000);
    case '30min':
      return timeSinceLastSync > (30 * 60 * 1000);
    case '1hour':
      return timeSinceLastSync > (60 * 60 * 1000);
    case 'manual':
      return false;
    default:
      return timeSinceLastSync > (15 * 60 * 1000);
  }
});

// Virtual for success rate
externalBookingIntegrationSchema.virtual('successRate').get(function() {
  const total = this.statistics.totalBookings;
  if (total === 0) return 0;
  return (this.statistics.successfulBookings / total) * 100;
});

// Middleware to update `updatedAt` field
externalBookingIntegrationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get integrations needing sync
externalBookingIntegrationSchema.statics.getIntegrationsNeedingSync = async function() {
  const integrations = await this.find({
    status: 'active',
    'settings.syncSettings.syncFrequency': { $ne: 'manual' }
  });
  
  return integrations.filter(integration => integration.needsSync);
};

// Static method to sync integration
externalBookingIntegrationSchema.statics.syncIntegration = async function(integrationId) {
  const integration = await this.findById(integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  if (integration.status !== 'active') {
    throw new Error('Integration is not active');
  }
  
  try {
    // Update last sync time
    integration.lastSync = new Date();
    integration.syncStatus = 'pending';
    await integration.save();
    
    // Here you would implement the actual sync logic based on integration type
    // For now, we'll just simulate a successful sync
    integration.syncStatus = 'success';
    await integration.save();
    
    return {
      success: true,
      message: 'Integration synced successfully',
      lastSync: integration.lastSync
    };
  } catch (error) {
    integration.syncStatus = 'error';
    integration.syncError = {
      message: error.message,
      code: error.code || 'SYNC_ERROR',
      timestamp: new Date()
    };
    await integration.save();
    
    throw error;
  }
};

// Static method to test integration connection
externalBookingIntegrationSchema.statics.testConnection = async function(integrationId) {
  const integration = await this.findById(integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  try {
    // Here you would implement the actual connection test based on integration type
    // For now, we'll just simulate a successful test
    return {
      success: true,
      message: 'Connection test successful',
      responseTime: Math.random() * 1000, // Simulated response time
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error.code || 'CONNECTION_ERROR',
      timestamp: new Date()
    };
  }
};

module.exports = mongoose.model('ExternalBookingIntegration', externalBookingIntegrationSchema);
