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

const User = mongoose.model('User', userSchema);

const resetAllAccounts = async () => {
  try {
    await connectDB();
    
    console.log('\n=== REMOVING ALL EXISTING ACCOUNTS ===');
    
    // Delete all users
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing accounts`);
    
    console.log('\n=== CREATING NEW ACCOUNTS FOR ALL USER TYPES ===');
    
    // Define all user accounts
    const newAccounts = [
      // Admin Accounts
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@serandibgo.com',
        password: 'admin123',
        phone: '+94771234567',
        role: 'admin',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234567',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          department: 'management',
          permissions: ['all'],
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          maxBookingsPerDay: 10,
          advanceBookingDays: 365
        }
      },
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@serandibgo.com',
        password: 'admin123',
        phone: '+94771234568',
        role: 'super_admin',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234568',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          department: 'management',
          permissions: ['all'],
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          maxBookingsPerDay: 10,
          advanceBookingDays: 365
        }
      },
      
      // Staff Accounts
      {
        firstName: 'Staff',
        lastName: 'Member',
        email: 'staff@serandibgo.com',
        password: 'admin123',
        phone: '+94771234569',
        role: 'staff',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234569',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          department: 'operations',
          permissions: ['bookings', 'users', 'vehicles'],
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          maxBookingsPerDay: 5,
          advanceBookingDays: 30
        }
      },
      {
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@serandibgo.com',
        password: 'admin123',
        phone: '+94771234570',
        role: 'manager',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234570',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          department: 'management',
          permissions: ['bookings', 'users', 'vehicles', 'hotels'],
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          maxBookingsPerDay: 8,
          advanceBookingDays: 90
        }
      },
      
      // Guide Accounts
      {
        firstName: 'Rajesh',
        lastName: 'Perera',
        email: 'guide@serandibgo.com',
        password: 'guide123',
        phone: '+94771234571',
        role: 'guide',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234571',
          address: 'Kandy, Sri Lanka',
          status: 'active',
          bio: 'Experienced tour guide with 8 years of expertise in Sri Lankan tourism',
          experience: '8 years',
          languages: ['English', 'Sinhala', 'Tamil'],
          specialties: ['Historical Tours', 'Cultural Heritage', 'Adventure Tours'],
          location: 'Kandy, Sri Lanka',
          pricePerDay: 150,
          certifications: ['Tour Guide License', 'Wildlife Guide Certificate'],
          responseTime: 'Within 2 hours',
          highlights: ['Expert in Sri Lankan history', 'Fluent in multiple languages', 'Certified wildlife guide'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '08:00', end: '18:00' },
          maxBookingsPerDay: 3,
          advanceBookingDays: 30
        }
      },
      {
        firstName: 'Priya',
        lastName: 'Fernando',
        email: 'guide2@serandibgo.com',
        password: 'guide123',
        phone: '+94771234572',
        role: 'guide',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234572',
          address: 'Galle, Sri Lanka',
          status: 'active',
          bio: 'Specialized in cultural and heritage tours',
          experience: '5 years',
          languages: ['English', 'Sinhala'],
          specialties: ['Cultural Tours', 'Heritage Sites', 'Photography Tours'],
          location: 'Galle, Sri Lanka',
          pricePerDay: 120,
          certifications: ['Cultural Guide License'],
          responseTime: 'Within 4 hours',
          highlights: ['Cultural expert', 'Photography enthusiast'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          workingHours: { start: '09:00', end: '17:00' },
          maxBookingsPerDay: 2,
          advanceBookingDays: 14
        }
      },
      
      // Driver Accounts
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'driver@serandibgo.com',
        password: 'driver123',
        phone: '+94771234573',
        role: 'driver',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234573',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          vehicleType: 'sedan',
          vehicleModel: 'Toyota Camry',
          vehicleCapacity: 4,
          fuelType: 'petrol',
          pricePerDay: 5000,
          location: 'Colombo',
          vehicleDescription: 'Comfortable sedan for city tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '06:00', end: '20:00' },
          maxBookingsPerDay: 4,
          advanceBookingDays: 30
        }
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'driver2@serandibgo.com',
        password: 'driver123',
        phone: '+94771234574',
        role: 'driver',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234574',
          address: 'Kandy, Sri Lanka',
          status: 'active',
          vehicleType: 'suv',
          vehicleModel: 'Toyota Land Cruiser',
          vehicleCapacity: 7,
          fuelType: 'diesel',
          pricePerDay: 8000,
          location: 'Kandy',
          vehicleDescription: 'Spacious SUV for family tours',
          vehicleFeatures: ['AC', 'GPS', 'Bluetooth', 'WiFi'],
          vehicleImages: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=400'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '07:00', end: '19:00' },
          maxBookingsPerDay: 3,
          advanceBookingDays: 21
        }
      },
      
      // Hotel Owner Accounts
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'hotel@serandibgo.com',
        password: 'hotel123',
        phone: '+94771234575',
        role: 'hotel_owner',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234575',
          address: 'Colombo, Sri Lanka',
          status: 'active',
          hotelName: 'Colombo Grand Hotel',
          hotelLocation: 'Colombo',
          hotelDescription: 'Luxury hotel in the heart of Colombo',
          hotelFeatures: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '00:00', end: '23:59' },
          maxBookingsPerDay: 50,
          advanceBookingDays: 365
        }
      },
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'hotel2@serandibgo.com',
        password: 'hotel123',
        phone: '+94771234576',
        role: 'hotel_owner',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234576',
          address: 'Galle, Sri Lanka',
          status: 'active',
          hotelName: 'Galle Heritage Hotel',
          hotelLocation: 'Galle',
          hotelDescription: 'Boutique hotel in historic Galle Fort',
          hotelFeatures: ['WiFi', 'Restaurant', 'Garden', 'Historic Building'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '00:00', end: '23:59' },
          maxBookingsPerDay: 20,
          advanceBookingDays: 180
        }
      },
      
      // Tourist/Regular User Accounts
      {
        firstName: 'Alex',
        lastName: 'Brown',
        email: 'tourist@serandibgo.com',
        password: 'tourist123',
        phone: '+94771234577',
        role: 'tourist',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234577',
          address: 'Colombo, Sri Lanka',
          status: 'active'
        }
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'user@serandibgo.com',
        password: 'user123',
        phone: '+94771234578',
        role: 'tourist',
        isVerified: true,
        isActive: true,
        profile: {
          phone: '+94771234578',
          address: 'Kandy, Sri Lanka',
          status: 'active'
        }
      }
    ];
    
    // Create all accounts
    for (const accountData of newAccounts) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      accountData.password = await bcrypt.hash(accountData.password, salt);
      
      // Create user
      const user = await User.create(accountData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }
    
    console.log('\n🎉 ALL ACCOUNTS CREATED SUCCESSFULLY!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('\n🔐 ADMIN ACCOUNTS:');
    console.log('- admin@serandibgo.com / admin123');
    console.log('- superadmin@serandibgo.com / admin123');
    console.log('\n👥 STAFF ACCOUNTS:');
    console.log('- staff@serandibgo.com / admin123');
    console.log('- manager@serandibgo.com / admin123');
    console.log('\n🗺️ GUIDE ACCOUNTS:');
    console.log('- guide@serandibgo.com / guide123');
    console.log('- guide2@serandibgo.com / guide123');
    console.log('\n🚗 DRIVER ACCOUNTS:');
    console.log('- driver@serandibgo.com / driver123');
    console.log('- driver2@serandibgo.com / driver123');
    console.log('\n🏨 HOTEL OWNER ACCOUNTS:');
    console.log('- hotel@serandibgo.com / hotel123');
    console.log('- hotel2@serandibgo.com / hotel123');
    console.log('\n👤 TOURIST ACCOUNTS:');
    console.log('- tourist@serandibgo.com / tourist123');
    console.log('- user@serandibgo.com / user123');
    
  } catch (error) {
    console.error('Error resetting accounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

resetAllAccounts();
