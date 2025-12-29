const mongoose = require('mongoose');
const Tour = require('../models/Tour');
const User = require('../models/User');
const sampleTours = require('../data/sampleTours');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/serendibgo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed tours function
const seedTours = async () => {
  try {
    console.log('Starting tour seeding...');

    // Clear existing tours
    await Tour.deleteMany({});
    console.log('Cleared existing tours');

    // Find a guide user to assign tours to
    let guide = await User.findOne({ role: 'guide' });
    
    if (!guide) {
      console.log('No guide found, creating a sample guide...');
      guide = await User.create({
        firstName: 'Rajesh',
        lastName: 'Perera',
        email: 'rajesh.perera@example.com',
        password: 'password123',
        role: 'guide',
        isActive: true,
        isVerified: true,
        profile: {
          bio: 'Experienced tour guide with 8 years of expertise in Sri Lankan tourism',
          experience: '8 years',
          languages: ['English', 'Sinhala', 'Tamil'],
          specialties: ['Historical Tours', 'Cultural Heritage', 'Adventure Tours'],
          location: 'Colombo, Sri Lanka',
          pricePerDay: 150,
          certifications: ['Tour Guide License', 'Wildlife Guide Certificate'],
          responseTime: 'Within 2 hours',
          highlights: ['Expert in Sri Lankan history', 'Fluent in multiple languages', 'Certified wildlife guide'],
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          workingHours: { start: '08:00', end: '18:00' },
          maxBookingsPerDay: 3,
          advanceBookingDays: 30
        }
      });
      console.log('Created sample guide:', guide.email);
    }

    // Add guide ID to all sample tours
    const toursWithGuide = sampleTours.map(tour => ({
      ...tour,
      guide: guide._id
    }));

    // Insert tours
    const createdTours = await Tour.insertMany(toursWithGuide);
    console.log(`Successfully seeded ${createdTours.length} tours`);

    // Display seeded tours
    console.log('\nSeeded tours:');
    createdTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.title} - $${tour.price} (${tour.category})`);
    });

    console.log('\nTour seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding tours:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedTours();
  });
}

module.exports = { seedTours, connectDB };
