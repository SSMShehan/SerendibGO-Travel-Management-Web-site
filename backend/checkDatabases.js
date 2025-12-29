const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://admin:admin123@serandibgo.izvdsyx.mongodb.net/serendibgo?appName=serandibgo';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkDatabases = async () => {
  try {
    await connectDB();

    console.log('\n=== Checking Databases and Collections ===');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();

    console.log('Available databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Check current database collections
    const currentDb = mongoose.connection.db;
    const collections = await currentDb.listCollections().toArray();

    console.log(`\nCollections in current database (${currentDb.databaseName}):`);
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`- ${col.name}`);
      });
    } else {
      console.log('No collections found');
    }

    // Try to connect to the default database (without serandibgo)
    console.log('\n=== Trying Default Database ===');
    await mongoose.connection.close();

    const defaultUri = 'mongodb+srv://admin:admin123@serandibgo.izvdsyx.mongodb.net/?appName=serandibgo';
    await mongoose.connect(defaultUri);

    const defaultDb = mongoose.connection.db;
    const defaultCollections = await defaultDb.listCollections().toArray();

    console.log(`Collections in default database (${defaultDb.databaseName}):`);
    if (defaultCollections.length > 0) {
      defaultCollections.forEach(col => {
        console.log(`- ${col.name}`);
      });

      // Check users collection in default database
      if (defaultCollections.some(col => col.name === 'users')) {
        const usersCollection = defaultDb.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log(`\nUsers in default database: ${userCount}`);

        if (userCount > 0) {
          const sampleUsers = await usersCollection.find({}).limit(3).toArray();
          console.log('Sample users:');
          sampleUsers.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}`);
          });
        }
      }
    } else {
      console.log('No collections found in default database');
    }

  } catch (error) {
    console.error('Error checking databases:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkDatabases();
