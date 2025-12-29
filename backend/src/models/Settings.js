const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Platform Settings
  platform: {
    siteName: {
      type: String,
      default: 'SerendibGo',
      required: true
    },
    siteDescription: {
      type: String,
      default: 'Your gateway to Sri Lankan adventures'
    },
    siteUrl: {
      type: String,
      default: 'https://serendibgo.com'
    },
    timezone: {
      type: String,
      default: 'Asia/Colombo'
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    language: {
      type: String,
      default: 'en'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    emailVerificationRequired: {
      type: Boolean,
      default: true
    },
    maxFileUploadSize: {
      type: String,
      default: '10MB'
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    }
  },

  // Email Settings
  email: {
    smtpHost: {
      type: String,
      default: 'smtp.gmail.com'
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUsername: {
      type: String,
      default: 'noreply@serendibgo.com'
    },
    smtpPassword: {
      type: String,
      default: ''
    },
    fromEmail: {
      type: String,
      default: 'noreply@serendibgo.com'
    },
    fromName: {
      type: String,
      default: 'SerendibGo Team'
    },
    emailTemplates: {
      welcome: {
        type: Boolean,
        default: true
      },
      bookingConfirmation: {
        type: Boolean,
        default: true
      },
      passwordReset: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: false
      }
    }
  },

  // Payment Settings
  payment: {
    stripeEnabled: {
      type: Boolean,
      default: true
    },
    stripePublicKey: {
      type: String,
      default: ''
    },
    stripeSecretKey: {
      type: String,
      default: ''
    },
    paypalEnabled: {
      type: Boolean,
      default: false
    },
    paypalClientId: {
      type: String,
      default: ''
    },
    paypalClientSecret: {
      type: String,
      default: ''
    },
    bankTransferEnabled: {
      type: Boolean,
      default: true
    },
    minimumDeposit: {
      type: Number,
      default: 1000
    },
    refundPolicy: {
      type: String,
      default: '7 days'
    },
    commissionRate: {
      type: Number,
      default: 5.0
    }
  },

  // System Settings
  system: {
    version: {
      type: String,
      default: '1.2.0'
    },
    environment: {
      type: String,
      default: 'production',
      enum: ['development', 'staging', 'production']
    },
    databaseStatus: {
      type: String,
      default: 'connected',
      enum: ['connected', 'disconnected', 'error']
    },
    cacheStatus: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive', 'error']
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
