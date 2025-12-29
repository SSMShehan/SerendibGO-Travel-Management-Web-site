const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/serendibgo?retryWrites=true&w=majority&appName=Cluster0');

async function checkAndApproveVehicles() {
  try {
    console.log('=== CHECKING VEHICLES ===');
    
    // Find all vehicles
    const allVehicles = await Vehicle.find({});
    console.log(`Total vehicles in database: ${allVehicles.length}`);
    
    // Find vehicles that need approval
    const vehiclesNeedingApproval = await Vehicle.find({
      'approvalDetails.needsApproval': true
    });
    console.log(`Vehicles needing approval: ${vehiclesNeedingApproval.length}`);
    
    // Find available vehicles
    const availableVehicles = await Vehicle.find({
      status: 'available'
    });
    console.log(`Available vehicles: ${availableVehicles.length}`);
    
    // Show details of vehicles needing approval
    if (vehiclesNeedingApproval.length > 0) {
      console.log('\n=== VEHICLES NEEDING APPROVAL ===');
      vehiclesNeedingApproval.forEach((vehicle, index) => {
        console.log(`${index + 1}. ${vehicle.name} (${vehicle.make} ${vehicle.model})`);
        console.log(`   Status: ${vehicle.status}`);
        console.log(`   Needs Approval: ${vehicle.approvalDetails?.needsApproval}`);
        console.log(`   Owner: ${vehicle.owner}`);
        console.log('');
      });
      
      // Approve the first few vehicles for testing
      console.log('=== APPROVING VEHICLES FOR TESTING ===');
      const vehiclesToApprove = vehiclesNeedingApproval.slice(0, 3);
      
      for (const vehicle of vehiclesToApprove) {
        await Vehicle.findByIdAndUpdate(vehicle._id, {
          'approvalDetails.needsApproval': false,
          'approvalDetails.isApproved': true,
          'approvalDetails.approvedAt': new Date(),
          'approvalDetails.approvedBy': '64f8b8b8b8b8b8b8b8b8b8b8' // Mock admin ID
        });
        console.log(`✅ Approved: ${vehicle.name}`);
      }
      
      console.log(`\nApproved ${vehiclesToApprove.length} vehicles for testing.`);
    } else {
      console.log('No vehicles need approval.');
    }
    
    // Show final counts
    const finalAvailableVehicles = await Vehicle.find({
      status: 'available',
      'approvalDetails.needsApproval': { $ne: true }
    });
    console.log(`\nFinal available vehicles for booking: ${finalAvailableVehicles.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAndApproveVehicles();
