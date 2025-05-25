const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection URI: ${process.env.MONGO_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create a simple test model
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Try to save a document
    console.log('Attempting to save a test document...');
    const testDoc = new Test({ name: 'Test Document' });
    await testDoc.save();
    console.log('Test document saved successfully!');
    
    // Retrieve the document to confirm it was saved
    const docs = await Test.find();
    console.log('Retrieved documents:', docs);
    
    // Clean up - delete the test document
    await Test.deleteMany({});
    console.log('Test documents cleaned up');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    console.error(error);
    
    // More detailed error information
    if (error.name === 'MongoNetworkError') {
      console.error('This is a network connectivity issue. Make sure MongoDB is running and accessible.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not select a MongoDB server. Make sure your MongoDB instance is running.');
    }
  }
}

testMongoConnection();
