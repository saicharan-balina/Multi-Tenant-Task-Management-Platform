const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

console.log('====== MONGODB CONNECTION DIAGNOSTIC ======');
console.log('Environment variables:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`- USE_MEMORY_SERVER: ${process.env.USE_MEMORY_SERVER}`);
console.log(`- USE_MEMORY_SERVER (type): ${typeof process.env.USE_MEMORY_SERVER}`);

// Check for existing MongoDB collections
async function checkLocalMongoDb() {
  try {
    console.log('\n===== CHECKING LOCAL MONGODB =====');
    console.log(`Connecting to: ${process.env.MONGO_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.db.databaseName}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nCollections found:');
    if (collections.length === 0) {
      console.log('No collections found - database might be empty');
    } else {
      for (const collection of collections) {
        console.log(`- ${collection.name}`);
        
        // Get document count for each collection
        const count = await conn.connection.db.collection(collection.name).countDocuments();
        console.log(`  Documents: ${count}`);
        
        // If there are documents, show a sample
        if (count > 0) {
          const sample = await conn.connection.db.collection(collection.name).findOne();
          console.log(`  Sample document: ${JSON.stringify(sample, null, 2)}`);
        }
      }
    }
    
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error(`Error connecting to local MongoDB: ${error.message}`);
  }
}

// Check in-memory MongoDB
async function checkMemoryMongoDb() {
  try {
    console.log('\n===== CHECKING IN-MEMORY MONGODB =====');
    
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`Memory server URI: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`Connected to In-Memory MongoDB: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.db.databaseName}`);
    
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('Memory server stopped and connection closed.');
    
  } catch (error) {
    console.error(`Error with in-memory MongoDB: ${error.message}`);
  }
}

// Run diagnostics
async function runDiagnostics() {
  await checkLocalMongoDb();
  await checkMemoryMongoDb();
  
  console.log('\n====== CONCLUSION ======');
  console.log('If you see collections and documents in the LOCAL MONGODB section, your data is being stored in your local database.');
  console.log('If you don\'t see any collections or the database is empty, but your app can still log in/out users, it\'s likely using the in-memory database.');
  console.log('\nRECOMMENDATION:');
  console.log('1. Make sure your .env file has USE_MEMORY_SERVER=false (string "false", not boolean)');
  console.log('2. Check your db.js to ensure it\'s correctly interpreting environment variables');
  console.log('3. Verify MongoDB is running and accessible');
  console.log('4. Restart your server to apply changes');
}

runDiagnostics();
