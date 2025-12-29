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
  phone: String,
  role: { type: String, enum: ['tourist', 'hotel_owner', 'guide', 'driver', 'vehicle_owner', 'staff', 'admin', 'super_admin', 'manager', 'support_staff'], default: 'tourist' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    status: { type: String, default: 'pending' },
    bio: String,
    experience: String,
    languages: [String],
    specialties: [String],
    location: String,
    pricePerDay: Number,
    certifications: [String],
    responseTime: String,
    highlights: [String],
    availability: String,
    workingDays: [String],
    workingHours: Object,
    maxBookingsPerDay: Number,
    advanceBookingDays: Number,
    vehicleTypes: [String],
    blockedDates: [String],
    completedTasks: Number,
    permissions: [String],
    department: String
  }
});

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  features: [String],
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  description: String,
  images: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const createSampleVehicles = async () => {
  try {
    await connectDB();
    
    console.log('\n=== CREATING SAMPLE VEHICLES FOR DRIVERS ===');
    
    // Find driver users
    const drivers = await User.find({ role: 'driver' });
    console.log(`Found ${drivers.length} driver accounts`);
    
    if (drivers.length === 0) {
      console.log('No drivers found. Creating sample vehicles for any user...');
      const anyUsers = await User.find().limit(2);
      for (const user of anyUsers) {
        user.role = 'driver';
        await user.save();
        drivers.push(user);
      }
    }
    
    // Sample vehicles data
    const sampleVehicles = [
      {
        vehicleType: 'sedan',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'White',
        licensePlate: 'ABC-1234',
        capacity: 4,
        fuelType: 'petrol',
        transmission: 'automatic',
        features: ['AC', 'GPS', 'Bluetooth', 'USB Charging'],
        pricePerDay: 5000,
        location: 'Colombo',
        description: 'Comfortable sedan perfect for city tours and airport transfers',
        images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
        status: 'approved'
      },
      {
        vehicleType: 'suv',
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2021,
        color: 'Black',
        licensePlate: 'XYZ-5678',
        capacity: 7,
        fuelType: 'diesel',
        transmission: 'automatic',
        features: ['AC', 'GPS', 'Bluetooth', 'WiFi', 'Sunroof'],
        pricePerDay: 8000,
        location: 'Kandy',
        description: 'Spacious SUV ideal for family tours and long-distance travel',
        images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
        status: 'approved'
      },
      {
        vehicleType: 'hatchback',
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        color: 'Silver',
        licensePlate: 'DEF-9012',
        capacity: 5,
        fuelType: 'petrol',
        transmission: 'manual',
        features: ['AC', 'GPS', 'Bluetooth'],
        pricePerDay: 3500,
        location: 'Galle',
        description: 'Economical hatchback for budget-conscious travelers',
        images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
        status: 'pending'
      },
      {
        vehicleType: 'van',
        make: 'Toyota',
        model: 'Hiace',
        year: 2020,
        color: 'White',
        licensePlate: 'GHI-3456',
        capacity: 12,
        fuelType: 'diesel',
        transmission: 'manual',
        features: ['AC', 'GPS', 'Bluetooth', 'Extra Seats'],
        pricePerDay: 6000,
        location: 'Colombo',
        description: 'Large van perfect for group tours and airport transfers',
        images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
        status: 'approved'
      }
    ];
    
    // Create vehicles for each driver
    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      console.log(`\nCreating vehicles for driver: ${driver.email}`);
      
      // Create 2-3 vehicles per driver
      const vehiclesToCreate = sampleVehicles.slice(i * 2, (i + 1) * 2 + 1);
      
      for (const vehicleData of vehiclesToCreate) {
        // Make license plate unique
        vehicleData.licensePlate = `${vehicleData.licensePlate.split('-')[0]}-${1000 + Math.floor(Math.random() * 9000)}`;
        
        const vehicle = new Vehicle({
          ...vehicleData,
          owner: driver._id
        });
        
        await vehicle.save();
        console.log(`✅ Created ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}) for ${driver.email}`);
      }
    }
    
    // Also create some vehicles with 'pending' status for testing approvals
    console.log('\n=== CREATING PENDING VEHICLES FOR TESTING ===');
    
    const pendingVehicle = new Vehicle({
      owner: drivers[0]._id,
      vehicleType: 'luxury',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      color: 'Blue',
      licensePlate: 'BMW-9999',
      capacity: 5,
      fuelType: 'petrol',
      transmission: 'automatic',
      features: ['AC', 'GPS', 'Bluetooth', 'WiFi', 'Leather Seats', 'Sunroof'],
      pricePerDay: 12000,
      location: 'Colombo',
      description: 'Luxury SUV for premium tours and VIP transfers',
      images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
      status: 'pending'
    });
    
    await pendingVehicle.save();
    console.log(`✅ Created pending vehicle: ${pendingVehicle.make} ${pendingVehicle.model} (${pendingVehicle.licensePlate})`);
    
    console.log('\n🎉 SAMPLE VEHICLES CREATED SUCCESSFULLY!');
    
    // Summary
    const totalVehicles = await Vehicle.countDocuments();
    const approvedVehicles = await Vehicle.countDocuments({ status: 'approved' });
    const pendingVehicles = await Vehicle.countDocuments({ status: 'pending' });
    
    console.log(`\n📊 VEHICLE SUMMARY:`);
    console.log(`Total vehicles: ${totalVehicles}`);
    console.log(`Approved vehicles: ${approvedVehicles}`);
    console.log(`Pending vehicles: ${pendingVehicles}`);
    
  } catch (error) {
    console.error('Error creating sample vehicles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

createSampleVehicles();
