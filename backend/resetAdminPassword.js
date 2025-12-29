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

const resetAdminPassword = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Resetting Password for admin@serandibgo.com ===');
    
    // Find the admin user
    const user = await User.findOne({ email: 'admin@serandibgo.com' });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', user.email);
    console.log('Current role:', user.role);
    console.log('Current status:', user.isActive ? 'Active' : 'Inactive');
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully to "password123"');
    
    // Verify the password
    const passwordMatch = await bcrypt.compare('password123', user.password);
    console.log('Password verification:', passwordMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n🎉 Admin login credentials:');
    console.log('Email: admin@serandibgo.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

resetAdminPassword();
