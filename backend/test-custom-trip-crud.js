// Test script to verify the complete Custom Trip CRUD flow
// This script tests the entire workflow from request to payment confirmation

const mongoose = require('mongoose');
const CustomTrip = require('./src/models/CustomTrip');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');
const Hotel = require('./src/models/hotels/Hotel');

// Test data
const testData = {
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+94771234567',
    role: 'tourist'
  },
  customTripRequest: {
    destination: 'Kandy',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-20'),
    groupSize: 4,
    budget: 150000,
    interests: ['culture', 'nature'],
    accommodation: 'mid-range',
    transport: ['car'],
    activities: [
      { id: 'temple-visit', label: 'Temple of the Tooth', price: 2000 },
      { id: 'botanical-garden', label: 'Royal Botanical Garden', price: 1500 }
    ],
    specialRequests: 'Vegetarian meals preferred',
    dietaryRequirements: 'Vegetarian',
    accessibility: 'Wheelchair accessible vehicle needed',
    contactInfo: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+94771234567',
      emergencyContact: '+94771234568'
    }
  },
  staffAssignment: {
    assignedGuide: null, // Will be set after guide creation
    assignedVehicles: [
      {
        vehicle: null, // Will be set after vehicle creation
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-20'),
        cost: 25000
      }
    ],
    hotelBookings: [
      {
        hotel: null, // Will be set after hotel creation
        checkInDate: new Date('2024-03-15'),
        checkOutDate: new Date('2024-03-17'),
        roomType: 'Deluxe Double',
        numberOfRooms: 2,
        cost: 40000
      },
      {
        hotel: null, // Will be set after hotel creation
        checkInDate: new Date('2024-03-17'),
        checkOutDate: new Date('2024-03-20'),
        roomType: 'Standard Double',
        numberOfRooms: 2,
        cost: 35000
      }
    ],
    totalBudget: {
      guideFee: 30000,
      vehicleCost: 25000,
      hotelCost: 75000,
      activityCost: 7000,
      additionalFees: 3000,
      totalAmount: 140000
    },
    itinerary: [
      {
        day: 1,
        date: new Date('2024-03-15'),
        location: 'Kandy',
        activities: ['Arrival', 'Temple of the Tooth'],
        accommodation: 'Hotel 1',
        meals: ['Lunch', 'Dinner'],
        transport: 'Car',
        notes: 'Arrive by 2 PM'
      },
      {
        day: 2,
        date: new Date('2024-03-16'),
        location: 'Kandy',
        activities: ['Royal Botanical Garden', 'Cultural Show'],
        accommodation: 'Hotel 1',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        transport: 'Car',
        notes: 'Full day exploration'
      }
    ],
    additionalNotes: 'Customer prefers early morning activities'
  }
};

async function testCustomTripCRUD() {
  try {
    console.log('🚀 Starting Custom Trip CRUD Test...\n');

    // Step 1: Create Customer
    console.log('1️⃣ Creating customer...');
    const customer = new User(testData.customer);
    await customer.save();
    console.log('✅ Customer created:', customer.email);

    // Step 2: Create Custom Trip Request
    console.log('\n2️⃣ Creating custom trip request...');
    const customTrip = new CustomTrip({
      customer: customer._id,
      requestDetails: testData.customTripRequest,
      status: 'pending'
    });
    await customTrip.save();
    console.log('✅ Custom trip request created:', customTrip._id);
    console.log('   Status:', customTrip.status);
    console.log('   Destination:', customTrip.requestDetails.destination);

    // Step 3: Staff Assignment (Simulate staff approval)
    console.log('\n3️⃣ Staff assignment and approval...');
    
    // Create a guide
    const guide = new User({
      firstName: 'Saman',
      lastName: 'Perera',
      email: 'saman.perera@serendibgo.com',
      phone: '+94771234569',
      role: 'guide',
      profile: {
        specialties: ['culture', 'nature'],
        pricePerDay: 5000,
        languages: ['English', 'Sinhala'],
        experience: '5 years'
      }
    });
    await guide.save();
    console.log('✅ Guide created:', guide.email);

    // Create hotels
    const hotel1 = new Hotel({
      name: 'Kandy Heritage Hotel',
      location: {
        city: 'Kandy',
        address: '123 Temple Street, Kandy',
        coordinates: [80.6337, 7.2906]
      },
      starRating: 4,
      amenities: ['WiFi', 'Restaurant', 'Pool'],
      roomTypes: [
        {
          name: 'Deluxe Double',
          capacity: 2,
          price: 20000,
          amenities: ['AC', 'TV', 'Balcony']
        }
      ]
    });
    await hotel1.save();

    const hotel2 = new Hotel({
      name: 'Kandy City Hotel',
      location: {
        city: 'Kandy',
        address: '456 Main Street, Kandy',
        coordinates: [80.6337, 7.2906]
      },
      starRating: 3,
      amenities: ['WiFi', 'Restaurant'],
      roomTypes: [
        {
          name: 'Standard Double',
          capacity: 2,
          price: 15000,
          amenities: ['AC', 'TV']
        }
      ]
    });
    await hotel2.save();
    console.log('✅ Hotels created');

    // Update custom trip with staff assignment
    customTrip.staffAssignment = {
      ...testData.staffAssignment,
      assignedGuide: guide._id,
      hotelBookings: [
        {
          ...testData.staffAssignment.hotelBookings[0],
          hotel: hotel1._id
        },
        {
          ...testData.staffAssignment.hotelBookings[1],
          hotel: hotel2._id
        }
      ]
    };
    customTrip.status = 'approved';
    customTrip.approvalDetails = {
      approvedBy: customer._id, // In real scenario, this would be staff user
      approvedAt: new Date(),
      staffComments: 'Trip approved with all requested amenities'
    };
    
    await customTrip.save();
    console.log('✅ Custom trip approved by staff');
    console.log('   Status:', customTrip.status);
    console.log('   Total Budget: LKR', customTrip.staffAssignment.totalBudget.totalAmount);

    // Step 4: Customer Confirmation and Payment
    console.log('\n4️⃣ Customer confirmation and payment...');
    
    // Create booking record
    const booking = new Booking({
      user: customer._id,
      tour: null,
      customTrip: customTrip._id,
      guide: guide._id,
      bookingDate: new Date(),
      startDate: customTrip.requestDetails.startDate,
      endDate: customTrip.requestDetails.endDate,
      duration: 'multi-day',
      groupSize: customTrip.requestDetails.groupSize,
      totalAmount: customTrip.staffAssignment.totalBudget.totalAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: customTrip.requestDetails.specialRequests,
      isActive: true
    });
    await booking.save();
    console.log('✅ Booking record created:', booking._id);

    // Update custom trip status
    customTrip.status = 'confirmed';
    customTrip.booking = booking._id;
    customTrip.paymentStatus = 'paid';
    await customTrip.save();
    console.log('✅ Custom trip confirmed and payment processed');
    console.log('   Status:', customTrip.status);
    console.log('   Payment Status:', customTrip.paymentStatus);

    // Step 5: Verify Integration
    console.log('\n5️⃣ Verifying integration...');
    
    // Fetch user bookings (should include both regular and custom trips)
    const userBookings = await Booking.find({ user: customer._id })
      .populate('tour')
      .populate('customTrip')
      .populate('guide', 'firstName lastName email');
    
    console.log('✅ User bookings found:', userBookings.length);
    userBookings.forEach(booking => {
      console.log(`   - ${booking.customTrip ? 'Custom Trip' : 'Regular Tour'}: ${booking._id}`);
      console.log(`     Status: ${booking.status}, Payment: ${booking.paymentStatus}`);
      console.log(`     Amount: LKR ${booking.totalAmount}`);
    });

    // Fetch custom trips for user
    const userCustomTrips = await CustomTrip.find({ customer: customer._id })
      .populate('staffAssignment.assignedGuide', 'firstName lastName email')
      .populate('staffAssignment.hotelBookings.hotel', 'name location.city');
    
    console.log('✅ User custom trips found:', userCustomTrips.length);
    userCustomTrips.forEach(trip => {
      console.log(`   - ${trip.requestDetails.destination}: ${trip._id}`);
      console.log(`     Status: ${trip.status}, Payment: ${trip.paymentStatus}`);
      console.log(`     Guide: ${trip.staffAssignment.assignedGuide?.firstName} ${trip.staffAssignment.assignedGuide?.lastName}`);
      console.log(`     Hotels: ${trip.staffAssignment.hotelBookings.length}`);
    });

    console.log('\n🎉 Custom Trip CRUD Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Customer creation');
    console.log('   ✅ Custom trip request creation');
    console.log('   ✅ Staff assignment and approval');
    console.log('   ✅ Customer confirmation and payment');
    console.log('   ✅ Booking integration');
    console.log('   ✅ Unified booking system');

    return {
      customer,
      customTrip,
      booking,
      guide,
      hotels: [hotel1, hotel2]
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Export for use in other files
module.exports = {
  testCustomTripCRUD,
  testData
};

// Run test if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB (you'll need to set your connection string)
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/serendibgo_test';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return testCustomTripCRUD();
    })
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}
