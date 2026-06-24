// Environment Variables Check Script
// Run this to verify your environment is configured correctly
// Usage: node check-env.js

require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = {
  'MONGODB_URI': process.env.MONGODB_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
  'NODE_ENV': process.env.NODE_ENV,
  'PORT': process.env.PORT
};

let allValid = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  if (!value) {
    console.log(`❌ ${key} is NOT set`);
    allValid = false;
  } else if (key === 'JWT_SECRET' && value.length < 32) {
    console.log(`⚠️  ${key} is set but TOO SHORT (${value.length} chars, need 32+)`);
    allValid = false;
  } else if (key === 'MONGODB_URI' && !value.startsWith('mongodb')) {
    console.log(`⚠️  ${key} is set but doesn't look like a valid MongoDB URI`);
    allValid = false;
  } else {
    console.log(`✅ ${key} is set`);
    if (key === 'MONGODB_URI') {
      // Mask the password
      const masked = value.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
      console.log(`   → ${masked}`);
    } else if (key === 'JWT_SECRET') {
      console.log(`   → ${value.substring(0, 10)}... (${value.length} characters)`);
    } else {
      console.log(`   → ${value}`);
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('✅ All environment variables are properly configured!');
  console.log('🚀 You can start the server with: npm start');
} else {
  console.log('❌ Some environment variables are missing or invalid');
  console.log('\n📝 Create a .env file with these variables:');
  console.log('');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp');
  console.log('JWT_SECRET=your_super_secret_key_minimum_32_characters_long');
  console.log('NODE_ENV=development');
  console.log('PORT=3000');
  console.log('');
  console.log('💡 See .env.example for a template');
  process.exit(1);
}
