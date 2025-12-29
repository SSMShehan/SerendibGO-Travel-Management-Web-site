const crypto = require('crypto');
const User = require('../models/User');
const Driver = require('../models/vehicles/Driver');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role = 'tourist' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role
  });

  // If user is registering as a driver, create a basic driver profile
  if (role === 'driver') {
    try {
      // Generate driver ID
      const driverId = Driver.generateDriverId();

      // Create basic driver profile
      const driver = await Driver.create({
        user: user._id,
        driverId,
        status: 'pending',
        // Set minimal required fields with defaults
        personalInfo: {
          dateOfBirth: new Date('1990-01-01'), // Default date, user will update
          gender: 'other', // Default, user will update
          nationality: 'Sri Lankan', // Default, user will update
          emergencyContact: {
            name: `${firstName} ${lastName}`,
            relationship: 'Self',
            phone: phone,
            email: email
          }
        },
        license: {
          licenseNumber: 'TBD', // To be determined
          licenseType: 'B',
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          issuingAuthority: 'Department of Motor Traffic',
          licenseClass: 'Light Vehicle'
        },
        vehicleTypes: [{
          vehicleType: 'sedan',
          experience: 0,
          isPreferred: true
        }],
        serviceAreas: [{
          city: 'Colombo',
          district: 'Colombo',
          radius: 50,
          isActive: true
        }],
        financial: {
          baseRate: 0,
          currency: 'LKR',
          paymentMethod: 'bank_transfer'
        }
      });

      // Add initial status to history
      driver.statusHistory.push({
        status: 'pending',
        timestamp: new Date(),
        updatedBy: user._id,
        notes: 'Basic driver profile created during registration'
      });

      await driver.save();

      console.log(`Basic driver profile created for user ${user._id}`);
    } catch (error) {
      console.error('Error creating driver profile:', error);
      // Don't fail registration if driver profile creation fails
    }
  }

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't fail registration if email fails
  }

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Prepare response message based on role
  let message = 'User registered successfully. Please check your email for verification.';
  if (role === 'driver') {
    message += ' Please complete your driver profile to start accepting rides.';
  }

  res.status(201).json({
    status: 'success',
    message,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        profile: user.profile
      },
      token,
      needsProfileCompletion: role === 'driver'
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Set cookie options
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 30;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        profile: user.profile
      },
      token
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    avatar: req.body.avatar,
    'preferences.language': req.body.preferences?.language,
    'preferences.notifications': req.body.preferences?.notifications,
    passportNumber: req.body.passportNumber,
    address: req.body.address,
    country: req.body.country,
    region: req.body.region,
    city: req.body.city
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(req.body.currentPassword);
  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      status: 'error',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  // Generate new token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    data: {
      token
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No user found with this email address'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Email sending failed:', error);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: 'error',
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is invalid or has expired'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    data: {
      token
    }
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      status: 'error',
      message: 'Token is invalid or has expired'
    });
  }

  // Verify user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.isVerified) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Email sending failed:', error);

    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: 'error',
      message: 'Email could not be sent'
    });
  }
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};

