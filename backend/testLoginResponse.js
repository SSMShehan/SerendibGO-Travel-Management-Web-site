// Test script to debug the login issue
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@serandibgo.com',
      password: 'password123'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data structure:');
    console.log('- response.data:', typeof response.data);
    console.log('- response.data.status:', response.data.status);
    console.log('- response.data.data:', typeof response.data.data);
    console.log('- response.data.data.user:', typeof response.data.data?.user);
    console.log('- response.data.data.token:', typeof response.data.data?.token);
    
    console.log('\nFull response.data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testLogin();
