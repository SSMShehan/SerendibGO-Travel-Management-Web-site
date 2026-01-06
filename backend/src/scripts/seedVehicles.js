const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const sampleVehicles = require('../data/sampleVehicles');
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

// Seed vehicles function
const seedVehicles = async () => {
    try {
        console.log('Starting vehicle seeding...');

        // Clear existing vehicle data? 
        // Safer to just add new ones or update if exists, but for 'seed' usually we clear or upsert.
        // Let's clear for now as this is a "refill with real data" task
        await Vehicle.deleteMany({});
        console.log('Cleared existing vehicles');

        // Find a driver/owner user to assign vehicles to (Required by schema)
        let driver = await User.findOne({ role: 'driver' });

        if (!driver) {
            console.log('No driver found, creating a sample driver...');
            driver = await User.create({
                firstName: 'Sampath',
                lastName: 'Driver',
                email: 'sampath.driver@example.com',
                password: 'password123',
                role: 'driver',
                isActive: true,
                isVerified: true
            });
            console.log('Created sample driver:', driver.email);
        }

        // Prepare vehicles with owner/driver ID
        const vehiclesWithOwner = sampleVehicles.map(v => ({
            ...v,
            driver: driver._id,
            owner: driver._id // Set both for safety based on schema validation
        }));

        // Insert vehicles
        const createdVehicles = await Vehicle.insertMany(vehiclesWithOwner);
        console.log(`Successfully seeded ${createdVehicles.length} vehicles`);

        console.log('\nSeeded vehicles:');
        createdVehicles.forEach((v, index) => {
            console.log(`${index + 1}. ${v.name} - ${v.vehicleType}`);
        });

        console.log('\nVehicle seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding vehicles:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    connectDB().then(() => {
        seedVehicles();
    });
}

module.exports = { seedVehicles, connectDB };
