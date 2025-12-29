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
  role: { type: String, enum: ['user', 'driver', 'guide', 'staff', 'admin', 'vehicle_owner'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    status: { type: String, default: 'pending' }
  }
});

const User = mongoose.model('User', userSchema);

const resetPassword = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Resetting Password for asbthanayamwatta22@gmail.com ===');
    
    // Find the user
    const user = await User.findOne({ email: 'asbthanayamwatta22@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Current role:', user.role);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password updated successfully');
    
    // Verify the password
    const passwordMatch = await bcrypt.compare('password123', user.password);
    console.log('Password verification:', passwordMatch);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

resetPassword();
