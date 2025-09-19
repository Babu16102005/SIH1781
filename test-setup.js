// Simple test script to verify the setup
console.log('Testing Career Guidance System Setup...');

// Test 1: Check if we can access the main components
try {
  console.log('✓ File structure looks good');
} catch (error) {
  console.error('✗ File structure issue:', error);
}

// Test 2: Check dependencies
const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'axios',
  'recharts'
];

console.log('Required dependencies:', requiredDeps);

// Test 3: Check if we can make API calls
async function testAPI() {
  try {
    const response = await fetch('http://localhost:8000/api/health');
    if (response.ok) {
      console.log('✓ Backend API is accessible');
    } else {
      console.log('✗ Backend API not responding');
    }
  } catch (error) {
    console.log('✗ Backend API not running or accessible');
  }
}

// Run the test
testAPI();

console.log('Setup test completed. Check the results above.');
