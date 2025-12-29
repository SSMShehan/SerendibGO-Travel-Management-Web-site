const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/serendibgo?retryWrites=true&w=majority&appName=Cluster0');

async function listAllVehicles() {
  try {
    console.log('=== ALL VEHICLES IN DATABASE ===');
    
    const vehicles = await Vehicle.find({}).populate('owner', 'firstName lastName email');
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. ${vehicle.name || 'Unnamed Vehicle'}`);
      console.log(`   ID: ${vehicle._id}`);
      console.log(`   Make: ${vehicle.make}`);
      console.log(`   Model: ${vehicle.model}`);
      console.log(`   Year: ${vehicle.year}`);
      console.log(`   Status: ${vehicle.status}`);
      console.log(`   Needs Approval: ${vehicle.approvalDetails?.needsApproval || false}`);
      console.log(`   Owner: ${vehicle.owner?.firstName} ${vehicle.owner?.lastName} (${vehicle.owner?.email})`);
      console.log(`   Pricing: ${vehicle.pricing?.currency || 'LKR'} ${vehicle.pricing?.dailyRate || 'N/A'} per day`);
      console.log(`   Capacity: ${vehicle.capacity?.passengers || vehicle.seatingCapacity || 'N/A'} passengers`);
    });
    
    console.log(`\nTotal vehicles: ${vehicles.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

listAllVehicles();
