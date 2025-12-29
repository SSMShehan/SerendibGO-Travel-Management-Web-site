const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@serandibgo.izvdsyx.mongodb.net/serendibgo?appName=serandibgo';

const Booking = require(path.join(__dirname, 'src/models/Booking'));
require(path.join(__dirname, 'src/models/User'));

const verifyFix = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Create a dummy booking with NUMBER duration (simulating Tour booking)
        // We need valid User and Guide IDs.
        // Let's fetch the first user and guide we find or just use random IDs if validation allows (Controller checks existence, Schema just strict types?)
        // Schema: user: ref User, generic.

        const user = await mongoose.model('User').findOne();
        if (!user) {
            console.log('No users found to test with.');
            return;
        }

        console.log('Testing with User:', user._id);

        const dummyBooking = new Booking({
            user: user._id,
            guide: user._id, // Using same user as guide for simplicity
            bookingDate: new Date(),
            startDate: new Date(),
            endDate: new Date(),
            duration: "5", // Check if string "5" works (which Mongoose casts number to)
            groupSize: 2,
            totalAmount: 100,
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Simulating the controller logic:
        // Controller passed `duration` as number `5`.
        // Mongoose casts 5 to "5".
        // Previously, "5" failed Enum validation.
        // Now it should pass.

        console.log('Attempting to save booking with duration "5"...');
        await dummyBooking.save();
        console.log('✅ Booking saved successfully! Schema fix verified.');

        // Clean up
        await Booking.findByIdAndDelete(dummyBooking._id);
        console.log('Cleaned up test booking.');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFix();
