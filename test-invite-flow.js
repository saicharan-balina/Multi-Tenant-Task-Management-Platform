// Test script to verify the invite flow
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';
const ORGANIZATION_NAME = 'Test Organization';

// Store token and invite data
let authToken;
let inviteData;

// Helper to log steps
const logStep = (step) => {
  console.log('\n' + '='.repeat(50));
  console.log(`STEP: ${step}`);
  console.log('='.repeat(50));
};

// 1. Register an admin user
const registerAdmin = async () => {
  logStep('Registering admin user');
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: EMAIL,
      password: PASSWORD,
      organizationName: ORGANIZATION_NAME
    });
    
    authToken = res.data.token;
    console.log('✓ Admin registered successfully');
    console.log('Token:', authToken);
    return true;
  } catch (error) {
    console.error('✗ Admin registration failed:', error.response?.data || error.message);
    return false;
  }
};

// 2. Login as admin
const loginAdmin = async () => {
  logStep('Logging in as admin');
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    authToken = res.data.token;
    console.log('✓ Login successful');
    console.log('Token:', authToken);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
};

// 3. Create invite
const createInvite = async () => {
  logStep('Creating invite');
  try {
    const res = await axios.post(
      `${API_URL}/invites`, 
      {
        email: 'invitee@example.com',
        role: 'member'
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    inviteData = res.data.data;
    console.log('✓ Invite created successfully');
    console.log('Invite data:', inviteData);
    return true;
  } catch (error) {
    console.error('✗ Invite creation failed:', error.response?.data || error.message);
    return false;
  }
};

// 4. Validate invite token
const validateInviteToken = async () => {
  logStep('Validating invite token');
  try {
    const res = await axios.get(`${API_URL}/invites/validate/${inviteData.token}`);
    
    console.log('✓ Invite validated successfully');
    console.log('Validation response:', res.data);
    return true;
  } catch (error) {
    console.error('✗ Invite validation failed:', error.response?.data || error.message);
    return false;
  }
};

// Run the test
const runTest = async () => {
  console.log('Starting invite flow test...\n');
  
  // Try to login first, if fails then register
  let loggedIn = await loginAdmin();
  
  if (!loggedIn) {
    const registered = await registerAdmin();
    if (!registered) {
      console.log('Could not register or login admin. Aborting test.');
      return;
    }
  }
  
  // Create the invite
  const inviteCreated = await createInvite();
  if (!inviteCreated) {
    console.log('Could not create invite. Aborting test.');
    return;
  }
  
  // Validate the invite token
  const inviteValidated = await validateInviteToken();
  if (!inviteValidated) {
    console.log('Could not validate invite token. Aborting test.');
    return;
  }
  
  console.log('\nTest completed successfully! The invite link flow is working.');
  console.log(`\nInvite URL: ${inviteData.inviteUrl}`);
  console.log('\nYou can now open this URL in a browser to test the registration process.');
};

// Run the test
runTest();
