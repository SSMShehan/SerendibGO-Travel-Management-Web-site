// Script to create test drivers for the staff dashboard in MongoDB Atlas
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://asbthanayamwatta2_db_user:a9tYLTCwJCXc0xjX@cluster0.gv7sbeb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestDrivers() {
  try {
    console.log('Creating test drivers in MongoDB Atlas...');
    
    // Test drivers data
    const testDrivers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.driver@example.com',
        password: 'password123',
        phone: '+94771234567',
        role: 'driver',
        isVerified: false,
        isActive: true,
        profile: {
          vehicleType: 'sedan',
          vehicleModel: 'Toyota Camry',
          vehicleCapacity: 4,
          fuelType: 'petrol',
          pricePerDay: 5000,
          location: 'Colombo',
          vehicleDescription: 'Comfortable sedan for city tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          status: 'pending'
        }
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.driver@example.com',
        password: 'password123',
        phone: '+94771234568',
        role: 'driver',
        isVerified: true,
        isActive: true,
        profile: {
          vehicleType: 'suv',
          vehicleModel: 'Toyota Land Cruiser',
          vehicleCapacity: 7,
          fuelType: 'diesel',
          pricePerDay: 8000,
          location: 'Kandy',
          vehicleDescription: 'Spacious SUV for family tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth', 'WiFi'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          status: 'active'
        }
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.driver@example.com',
        password: 'password123',
        phone: '+94771234569',
        role: 'driver',
        isVerified: false,
        isActive: false,
        profile: {
          vehicleType: 'van',
          vehicleModel: 'Toyota Hiace',
          vehicleCapacity: 12,
          fuelType: 'diesel',
          pricePerDay: 10000,
          location: 'Galle',
          vehicleDescription: 'Large van for group tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth', 'WiFi', 'Charging Ports'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          status: 'pending'
        }
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.driver@example.com',
        password: 'password123',
        phone: '+94771234570',
        role: 'driver',
        isVerified: true,
        isActive: true,
        profile: {
          vehicleType: 'luxury',
          vehicleModel: 'BMW 5 Series',
          vehicleCapacity: 4,
          fuelType: 'petrol',
          pricePerDay: 15000,
          location: 'Colombo',
          vehicleDescription: 'Luxury sedan for premium tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth', 'WiFi', 'Leather Seats', 'Sunroof'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          status: 'active'
        }
      },
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'david.driver@example.com',
        password: 'password123',
        phone: '+94771234571',
        role: 'driver',
        isVerified: false,
        isActive: true,
        profile: {
          vehicleType: 'hatchback',
          vehicleModel: 'Honda Fit',
          vehicleCapacity: 4,
          fuelType: 'petrol',
          pricePerDay: 4000,
          location: 'Negombo',
          vehicleDescription: 'Economical hatchback for budget tours',
          vehicleFeatures: ['AC', 'GPS'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          status: 'maintenance'
        }
      }
    ];

    // Create drivers
    for (const driverData of testDrivers) {
      // Check if driver already exists
      const existingDriver = await User.findOne({ email: driverData.email });
      if (existingDriver) {
        console.log(`Driver ${driverData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      driverData.password = await bcrypt.hash(driverData.password, salt);

      // Create driver
      const driver = await User.create(driverData);
      console.log(`Created driver: ${driver.firstName} ${driver.lastName} (${driver.email})`);
    }

    // Also create a staff user for testing
    const staffData = {
      firstName: 'Admin',
      lastName: 'Staff',
      email: 'staff@serandibgo.com',
      password: await bcrypt.hash('password123', 10),
      phone: '+94771234500',
      role: 'staff',
      isVerified: true,
      isActive: true
    };

    const existingStaff = await User.findOne({ email: staffData.email });
    if (!existingStaff) {
      const staff = await User.create(staffData);
      console.log(`Created staff user: ${staff.firstName} ${staff.lastName} (${staff.email})`);
    } else {
      console.log(`Staff user ${staffData.email} already exists`);
    }

    console.log('\nTest data creation completed in MongoDB Atlas!');
    console.log('You can now login with:');
    console.log('- Staff: staff@serandibgo.com / password123');
    console.log('- Driver: john.driver@example.com / password123');
    console.log('- Driver: sarah.driver@example.com / password123');

  } catch (error) {
    console.error('Error creating test drivers:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestDrivers();
