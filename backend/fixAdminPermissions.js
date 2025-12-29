const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/serendibgo?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to serendibgo database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['tourist', 'hotel_owner', 'guide', 'driver', 'vehicle_owner', 'staff', 'admin', 'super_admin', 'manager', 'support_staff'], default: 'tourist' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    status: { type: String, default: 'pending' },
    bio: String,
    experience: String,
    languages: [String],
    specialties: [String],
    location: String,
    pricePerDay: Number,
    certifications: [String],
    responseTime: String,
    highlights: [String],
    availability: String,
    workingDays: [String],
    workingHours: Object,
    maxBookingsPerDay: Number,
    advanceBookingDays: Number,
    vehicleTypes: [String],
    blockedDates: [String],
    completedTasks: Number,
    permissions: [String],
    department: String
  }
});

const User = mongoose.model('User', userSchema);

const fixAdminPermissions = async () => {
  try {
    await connectDB();
    
    console.log('\n=== FIXING ADMIN PERMISSIONS ===');
    
    // Define all required permissions for admin/staff
    const adminPermissions = [
      'users:approve',
      'users:reject',
      'users:view',
      'users:edit',
      'users:delete',
      'vehicles:approve',
      'vehicles:reject',
      'vehicles:view',
      'vehicles:edit',
      'vehicles:delete',
      'hotels:approve',
      'hotels:reject',
      'hotels:view',
      'hotels:edit',
      'hotels:delete',
      'bookings:approve',
      'bookings:reject',
      'bookings:view',
      'bookings:edit',
      'bookings:delete',
      'staff:create',
      'staff:edit',
      'staff:delete',
      'staff:view',
      'analytics:view',
      'reports:generate',
      'settings:edit'
    ];
    
    // Update all admin accounts
    const adminRoles = ['admin', 'super_admin', 'staff', 'manager'];
    
    for (const role of adminRoles) {
      const users = await User.find({ role: role });
      console.log(`\nFound ${users.length} ${role} users`);
      
      for (const user of users) {
        console.log(`Updating permissions for ${user.email} (${role})`);
        
        // Ensure user is active and verified
        user.isActive = true;
        user.isVerified = true;
        
        // Set permissions based on role
        if (role === 'super_admin') {
          user.profile.permissions = [...adminPermissions, 'all'];
        } else if (role === 'admin') {
          user.profile.permissions = adminPermissions;
        } else if (role === 'manager') {
          user.profile.permissions = adminPermissions.filter(p => !p.includes('staff:delete') && !p.includes('settings:edit'));
        } else if (role === 'staff') {
          user.profile.permissions = adminPermissions.filter(p => 
            p.includes('view') || 
            p.includes('approve') || 
            p.includes('reject') ||
            p === 'staff:view'
          );
        }
        
        // Set other profile defaults
        user.profile.status = 'active';
        user.profile.department = role === 'staff' ? 'operations' : 'management';
        user.profile.workingHours = { start: '09:00', end: '17:00' };
        user.profile.workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        user.profile.maxBookingsPerDay = role === 'staff' ? 5 : 10;
        user.profile.advanceBookingDays = role === 'staff' ? 30 : 365;
        
        await user.save();
        console.log(`✅ Updated ${user.email} with ${user.profile.permissions.length} permissions`);
      }
    }
    
    // Also create driver profiles for driver accounts
    console.log('\n=== CREATING DRIVER PROFILES ===');
    const driverUsers = await User.find({ role: 'driver' });
    
    for (const driver of driverUsers) {
      console.log(`Creating driver profile for ${driver.email}`);
      
      // Set driver profile defaults
      driver.profile.status = 'active';
      driver.profile.availability = 'Available';
      driver.profile.workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      driver.profile.workingHours = { start: '06:00', end: '20:00' };
      driver.profile.maxBookingsPerDay = 4;
      driver.profile.advanceBookingDays = 30;
      driver.profile.vehicleTypes = ['sedan', 'suv'];
      driver.profile.responseTime = 'Within 2 hours';
      driver.profile.highlights = ['Professional driver', 'Safe driving record'];
      
      await driver.save();
      console.log(`✅ Created driver profile for ${driver.email}`);
    }
    
    console.log('\n🎉 ALL PERMISSIONS AND PROFILES UPDATED SUCCESSFULLY!');
    
    // Test permissions
    console.log('\n📋 PERMISSION SUMMARY:');
    const testUsers = await User.find({ role: { $in: ['admin', 'super_admin', 'staff', 'manager'] } });
    for (const user of testUsers) {
      console.log(`${user.email} (${user.role}): ${user.profile.permissions.length} permissions`);
      console.log(`  - users:approve: ${user.profile.permissions.includes('users:approve') ? '✅' : '❌'}`);
      console.log(`  - vehicles:approve: ${user.profile.permissions.includes('vehicles:approve') ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('Error fixing permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

fixAdminPermissions();
