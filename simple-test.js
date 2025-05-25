// Simple script to test user registration and invite flow
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api'; // Replace with your API URL
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  password: 'password123',
  organizationName: 'Test Organization'
};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Test registration
async function testRegistration() {
  console.log('Testing user registration...');
  try {
    const result = await makeRequest('post', '/auth/register', testUser);
    console.log('Registration successful!');
    console.log(result);
    return result.token;
  } catch (error) {
    console.log('Registration failed.');
    return null;
  }
}

// Test login
async function testLogin() {
  console.log('\nTesting login...');
  try {
    const result = await makeRequest('post', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful!');
    console.log(result);
    return result.token;
  } catch (error) {
    console.log('Login failed.');
    return null;
  }
}

// Test creating an invite
async function testCreateInvite(token) {
  console.log('\nTesting invite creation...');
  try {
    const result = await makeRequest('post', '/invites', {
      email: 'invitee@example.com',
      role: 'member'
    }, token);
    console.log('Invite created successfully!');
    console.log(result);
    return result.data;
  } catch (error) {
    console.log('Invite creation failed.');
    return null;
  }
}

// Test validating an invite token
async function testValidateInviteToken(token) {
  console.log('\nTesting invite token validation...');
  try {
    const result = await makeRequest('get', `/invites/validate/${token}`);
    console.log('Invite token validated successfully!');
    console.log(result);
    return result;
  } catch (error) {
    console.log('Invite validation failed.');
    return null;
  }
}

// Main function to run tests
async function runTests() {
  try {
    // First try to login, if it fails register a new user
    let authToken = await testLogin();
    
    if (!authToken) {
      console.log('\nTrying to register a new user...');
      authToken = await testRegistration();
      
      if (!authToken) {
        console.log('\nCould not authenticate. Exiting tests.');
        return;
      }
    }
    
    // Create an invite
    const invite = await testCreateInvite(authToken);
    if (!invite) {
      console.log('\nCould not create an invite. Exiting tests.');
      return;
    }
    
    // Validate the invite token
    const validationResult = await testValidateInviteToken(invite.token);
    if (!validationResult) {
      console.log('\nCould not validate invite token. Exiting tests.');
      return;
    }
    
    console.log('\nAll tests passed successfully!');
    console.log(`\nInvite URL: ${invite.inviteUrl}`);
    console.log('\nYou can now open this URL in a browser to complete the registration.');
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
  }
}

// Run the tests
runTests();
