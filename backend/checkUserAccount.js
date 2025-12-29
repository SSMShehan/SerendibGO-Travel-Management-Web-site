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

const checkUserAccount = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Checking asbthanayamwatta2@gmail.com Account ===');
    
    // Find the specific user
    const user = await User.findOne({ email: 'asbthanayamwatta2@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User asbthanayamwatta2@gmail.com not found in database');
      
      // Create this user as admin
      console.log('\n=== Creating asbthanayamwatta2@gmail.com as Admin ===');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'asbthanayamwatta2@gmail.com',
        password: hashedPassword,
        phone: '+94771234567',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ Created admin user:', newUser.email);
      console.log('✅ Password: admin123');
      console.log('✅ Role: admin');
      
    } else {
      console.log('✅ User found:', user.email);
      console.log('✅ Role:', user.role);
      console.log('✅ Active:', user.isActive);
      console.log('✅ Verified:', user.isVerified);
      
      // Test password
      const passwordMatch = await bcrypt.compare('admin123', user.password);
      console.log('✅ Password "admin123" matches:', passwordMatch ? 'YES' : 'NO');
      
      // Update to admin if not already
      if (user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        user.isActive = true;
        await user.save();
        console.log('✅ Updated user role to admin');
      }
      
      // Reset password to admin123
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('admin123', salt);
      await user.save();
      console.log('✅ Reset password to admin123');
    }
    
  } catch (error) {
    console.error('Error checking user account:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkUserAccount();
