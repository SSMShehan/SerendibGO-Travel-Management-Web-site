const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/serandibgo?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function resetUserAuth() {
  try {
    console.log('Connected to MongoDB');
    
    // Find the staff user
    const user = await User.findOne({ email: 'staff@serandibgo.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', {
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    // Generate a new token for testing
    const token = user.generateAuthToken();
    console.log('New token generated:', token);
    
    console.log('User auth reset successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetUserAuth();
