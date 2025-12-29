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

const testPasswords = async () => {
  try {
    await connectDB();
    
    console.log('\n=== Testing Common Passwords ===');
    
    const user = await User.findOne({ email: 'asbthanayamwatta22@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    const commonPasswords = [
      'password',
      'password123',
      '123456',
      'admin',
      'user',
      'driver',
      'asbthanayamwatta22',
      'asbthanayamwatta2',
      'serendibgo',
      'serandibgo'
    ];
    
    console.log('Testing passwords for:', user.email);
    
    for (const password of commonPasswords) {
      const match = await bcrypt.compare(password, user.password);
      console.log(`"${password}": ${match ? '✅ MATCH' : '❌'}`);
    }
    
  } catch (error) {
    console.error('Error testing passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

testPasswords();
