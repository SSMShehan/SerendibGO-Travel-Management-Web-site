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

const checkUserPermissions = async () => {
  try {
    await connectDB();
    
    console.log('\n=== CHECKING ALL USER PERMISSIONS ===');
    
    // Check all admin/staff users
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'super_admin', 'staff', 'manager'] } 
    });
    
    console.log(`\nFound ${adminUsers.length} admin/staff users:`);
    
    for (const user of adminUsers) {
      console.log(`\n👤 ${user.email} (${user.role})`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`   Permissions: ${user.profile?.permissions?.length || 0}`);
      
      if (user.profile?.permissions) {
        const hasUsersApprove = user.profile.permissions.includes('users:approve');
        const hasVehiclesApprove = user.profile.permissions.includes('vehicles:approve');
        console.log(`   users:approve: ${hasUsersApprove ? '✅' : '❌'}`);
        console.log(`   vehicles:approve: ${hasVehiclesApprove ? '✅' : '❌'}`);
        
        if (!hasUsersApprove || !hasVehiclesApprove) {
          console.log(`   ⚠️  MISSING REQUIRED PERMISSIONS!`);
        }
      } else {
        console.log(`   ⚠️  NO PERMISSIONS ARRAY!`);
      }
    }
    
    // Also check if there are any users without proper permissions
    console.log('\n=== CHECKING FOR USERS WITHOUT PERMISSIONS ===');
    const usersWithoutPermissions = await User.find({
      role: { $in: ['admin', 'super_admin', 'staff', 'manager'] },
      $or: [
        { 'profile.permissions': { $exists: false } },
        { 'profile.permissions': { $size: 0 } }
      ]
    });
    
    if (usersWithoutPermissions.length > 0) {
      console.log(`\n⚠️  Found ${usersWithoutPermissions.length} users without permissions:`);
      for (const user of usersWithoutPermissions) {
        console.log(`   - ${user.email} (${user.role})`);
      }
      
      console.log('\n🔧 FIXING MISSING PERMISSIONS...');
      
      // Define permissions based on role
      const adminPermissions = [
        'users:approve', 'users:reject', 'users:view', 'users:edit', 'users:delete',
        'vehicles:approve', 'vehicles:reject', 'vehicles:view', 'vehicles:edit', 'vehicles:delete',
        'hotels:approve', 'hotels:reject', 'hotels:view', 'hotels:edit', 'hotels:delete',
        'bookings:approve', 'bookings:reject', 'bookings:view', 'bookings:edit', 'bookings:delete',
        'staff:create', 'staff:edit', 'staff:delete', 'staff:view',
        'analytics:view', 'reports:generate', 'settings:edit'
      ];
      
      for (const user of usersWithoutPermissions) {
        if (user.role === 'super_admin') {
          user.profile.permissions = [...adminPermissions, 'all'];
        } else if (user.role === 'admin') {
          user.profile.permissions = adminPermissions;
        } else if (user.role === 'manager') {
          user.profile.permissions = adminPermissions.filter(p => !p.includes('staff:delete') && !p.includes('settings:edit'));
        } else if (user.role === 'staff') {
          user.profile.permissions = adminPermissions.filter(p => 
            p.includes('view') || p.includes('approve') || p.includes('reject') || p === 'staff:view'
          );
        }
        
        user.isActive = true;
        user.isVerified = true;
        user.profile.status = 'active';
        
        await user.save();
        console.log(`   ✅ Fixed permissions for ${user.email}`);
      }
    }
    
    console.log('\n🎉 PERMISSION CHECK COMPLETED!');
    
  } catch (error) {
    console.error('Error checking permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkUserPermissions();
