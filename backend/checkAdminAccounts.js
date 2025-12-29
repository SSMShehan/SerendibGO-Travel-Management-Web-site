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
  role: { type: String, enum: ['user', 'driver', 'guide', 'staff', 'admin', 'vehicle_owner', 'super_admin', 'manager', 'support_staff'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    status: { type: String, default: 'pending' }
  }
});

const User = mongoose.model('User', userSchema);

const checkAdminAccounts = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Checking All Admin Accounts ===');
    
    // Find all admin accounts
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'super_admin', 'staff'] } 
    }).select('+password');
    
    console.log(`Found ${adminUsers.length} admin/staff accounts:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
    });
    
    // Test password for admin@serandibgo.com
    const adminUser = await User.findOne({ email: 'admin@serandibgo.com' }).select('+password');
    if (adminUser) {
      console.log('\n=== Testing Password for admin@serandibgo.com ===');
      const passwordMatch = await bcrypt.compare('password123', adminUser.password);
      console.log('Password "password123" matches:', passwordMatch ? '✅ YES' : '❌ NO');
      
      // Test other common passwords
      const commonPasswords = ['admin123', 'admin', 'password', '123456'];
      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, adminUser.password);
        console.log(`Password "${pwd}" matches:`, match ? '✅ YES' : '❌ NO');
      }
    } else {
      console.log('\n❌ admin@serandibgo.com not found in database');
    }
    
  } catch (error) {
    console.error('Error checking admin accounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkAdminAccounts();
