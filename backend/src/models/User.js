const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
  },
  passportNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['tourist', 'hotel_owner', 'guide', 'driver', 'vehicle_owner', 'staff', 'admin', 'super_admin', 'manager', 'support_staff'],
    default: 'tourist'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'si', 'ta']
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  // Additional fields for different roles
  profile: {
    // For staff members
    staffId: String,
    department: {
      type: String,
      enum: ['operations', 'support', 'finance', 'marketing', 'technical', 'management'],
      default: 'operations'
    },
    permissions: [{
      module: String,
      actions: [String] // ['read', 'write', 'delete', 'approve']
    }],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hireDate: Date,
    salary: Number,
    workingHours: {
      start: String,
      end: String,
      timezone: String
    },
    performance: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      completedTasks: {
        type: Number,
        default: 0
      },
      lastReview: Date
    },
    // For hotel owners
    hotelName: String,
    hotelAddress: String,
    hotelLicense: String,

    // For guides
    guideLicense: String,
    languages: [String],
    experience: Number, // years
    specialties: [String],
    location: String,
    pricePerDay: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    bio: String,
    certifications: [String],
    responseTime: {
      type: String,
      default: 'Within 24 hours'
    },
    highlights: [String],
    availability: {
      type: String,
      default: 'Available'
    },
    workingDays: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    blockedDates: [{
      date: {
        type: Date,
        required: true
      },
      reason: {
        type: String,
        default: 'Not available'
      }
    }],
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    maxBookingsPerDay: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },

    // For drivers
    driverLicense: String,
    vehicleTypes: [String],
    licenseNumber: String,

    // For staff - permissions are handled in profile.permissions above
    department: String,
    position: String,
    hireDate: Date,
    salary: Number,
    completedTasks: {
      type: Number,
      default: 0
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = require('crypto').randomBytes(20).toString('hex');

  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = require('crypto').randomBytes(20).toString('hex');

  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

