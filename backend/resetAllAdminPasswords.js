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

const resetAllAdminPasswords = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Resetting All Admin Passwords to "admin123" ===');
    
    // Find all admin accounts
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'super_admin', 'staff'] } 
    }).select('+password');
    
    for (const user of adminUsers) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update the password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`✅ Reset password for ${user.email} (${user.role}) to "admin123"`);
    }
    
    console.log('\n🎉 All admin passwords reset to "admin123"');
    console.log('\nYou can now login with:');
    console.log('- admin@serandibgo.com / admin123');
    console.log('- admin@gmail.com / admin123');
    console.log('- staff@serandibgo.com / admin123');
    
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

resetAllAdminPasswords();
