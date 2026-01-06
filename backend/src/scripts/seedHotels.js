const mongoose = require('mongoose');
const Hotel = require('../models/hotels/Hotel');
const User = require('../models/User');
const sampleHotels = require('../data/sampleHotels');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@serandibgo.izvdsyx.mongodb.net/serendibgo?appName=serandibgo';
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Seed hotels function
const seedHotels = async () => {
    try {
        console.log('Starting  hotel seeding...');

        // Clear existing hotels
        await Hotel.deleteMany({});
        console.log('Cleared existing hotels');

        // Find a hotel owner to assign (Required by schema)
        let hotelOwner = await User.findOne({ role: 'hotel-owner' });

        if (!hotelOwner) {
            console.log('No hotel owner found, creating a sample hotel owner...');
            hotelOwner = await User.create({
                firstName: 'Sunil',
                lastName: 'Perera',
                email: 'sunil.hotelier@example.com',
                password: 'password123',
                role: 'hotel-owner',
                isActive: true,
                isVerified: true
            });
            console.log('Created sample hotel owner:', hotelOwner.email);
        }

        // Assign owner to hotels
        const hotelsWithOwner = sampleHotels.map(hotel => ({
            ...hotel,
            owner: hotelOwner._id
        }));

        // Insert hotels
        const createdHotels = await Hotel.insertMany(hotelsWithOwner);
        console.log(`Successfully seeded ${createdHotels.length} hotels`);

        createdHotels.forEach((h, index) => {
            console.log(`${index + 1}. ${h.name} - ${h.location.city}`);
        });

        console.log('\nHotel seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding hotels:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    connectDB().then(() => {
        seedHotels();
    });
}

module.exports = { seedHotels, connectDB };
