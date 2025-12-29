// Check what's in both collections
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Driver = require('./src/models/vehicles/Driver');

// Connect to MongoDB Atlas - serandibgo database
mongoose.connect('mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/serandibgo?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkBothCollections() {
  try {
    console.log('=== CHECKING USERS COLLECTION ===');
    
    // Check users collection
    const totalUsers = await User.countDocuments();
    console.log(`Total users: ${totalUsers}`);
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('Users by role:');
    usersByRole.forEach(role => {
      console.log(`  ${role._id}: ${role.count}`);
    });
    
    const drivers = await User.find({ role: 'driver' }).select('firstName lastName email phone isVerified isActive');
    console.log(`\nFound ${drivers.length} users with driver role:`);
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.firstName} ${driver.lastName} (${driver.email})`);
      console.log(`   Verified: ${driver.isVerified}, Active: ${driver.isActive}`);
    });

    console.log('\n=== CHECKING DRIVERS COLLECTION ===');
    
    // Check drivers collection
    const totalDrivers = await Driver.countDocuments();
    console.log(`Total drivers in drivers collection: ${totalDrivers}`);
    
    const driverDocs = await Driver.find().populate('user', 'firstName lastName email role');
    console.log(`\nFound ${driverDocs.length} driver documents:`);
    driverDocs.forEach((driver, index) => {
      console.log(`${index + 1}. Driver ID: ${driver.driverId}`);
      console.log(`   Status: ${driver.status}`);
      console.log(`   User: ${driver.user ? `${driver.user.firstName} ${driver.user.lastName} (${driver.user.email}) - Role: ${driver.user.role}` : 'No user linked'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkBothCollections();
