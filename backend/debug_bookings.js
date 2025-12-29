const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

// Hardcode URI as fallback
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@serandibgo.izvdsyx.mongodb.net/serendibgo?appName=serandibgo';

const Booking = require(path.join(__dirname, 'src/models/Booking'));
// Ensure referenced models are registered
require(path.join(__dirname, 'src/models/User'));
require(path.join(__dirname, 'src/models/Tour'));
require(path.join(__dirname, 'src/models/CustomTrip'));

const debugBookings = async () => {
    try {
        console.log('Connecting to MongoDB...', MONGO_URI.substring(0, 20) + '...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        console.log('Fetching last 20 bookings...');
        const bookings = await Booking.find().sort({ createdAt: -1 }).limit(20);

        console.log(`Found ${bookings.length} bookings.`);
        console.log('---------------------------------------------------');

        for (const booking of bookings) {
            try {
                console.log(`ID: ${booking._id}`);
                console.log(`Status: ${booking.status}`);
                console.log(`Raw Tour Field:`, booking.tour); // This might be hidden by Mongoose if not in schema or if null
                console.log(`Raw Guide Field:`, booking.guide);

                // Inspect strictness
                const rawObj = booking.toObject();
                console.log(`ToObject Tour:`, rawObj.tour);

                // Attempt Populate
                const populated = await Booking.findById(booking._id).populate('tour');
                if (populated.tour) {
                    console.log(`Populated Tour Title: "${populated.tour.title}"`);
                } else {
                    console.log(`Populated Tour is NULL/Missing.`);
                    if (booking.tour) {
                        console.log(`WARNING: Tour ID exists (${booking.tour}) but population failed!`);
                    } else {
                        console.log(`Tour ID was null/undefined in document.`);
                    }
                }
            } catch (err) {
                console.error(`Error processing booking ${booking._id}:`, err.message);
            }
            console.log('---------------------------------------------------');
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Disconnected.');
        }
    }
};

debugBookings();
