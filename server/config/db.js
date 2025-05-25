const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Debug logging for environment variables
    console.log('ENV Variables Debug:');
    console.log(`MONGO_URI present: ${!!process.env.MONGO_URI}`);
    console.log(`MONGO_URI value: ${process.env.MONGO_URI}`);
    console.log(`USE_MEMORY_SERVER value: ${process.env.USE_MEMORY_SERVER}`);
    console.log(`USE_MEMORY_SERVER type: ${typeof process.env.USE_MEMORY_SERVER}`);
    
    // If MONGO_URI is provided and not using memory server, use that
    if (process.env.MONGO_URI && process.env.USE_MEMORY_SERVER !== 'true') {
      console.log('Using local MongoDB connection');
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log(`Database name: ${conn.connection.db.databaseName}`);
    } else {
      // Otherwise use in-memory MongoDB server
      console.log('Using in-memory MongoDB server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`Memory server URI: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
      console.log(`In-memory database name: ${conn.connection.db.databaseName}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
