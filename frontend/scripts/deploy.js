#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Spotify Wrapped App...\n');

// Check if .env exists and has required variables
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Please run setup first.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
const missingVars = requiredVars.filter(varName => !envContent.includes(varName));

if (missingVars.length > 0) {
  console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('Please update your .env file with Spotify credentials.');
  process.exit(1);
}

console.log('✅ Environment variables configured');

// Check if build exists
const buildPath = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildPath)) {
  console.log('📦 Building project...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully\n');
  } catch (error) {
    console.log('❌ Build failed');
    process.exit(1);
  }
} else {
  console.log('✅ Build already exists');
}

console.log('🌐 Deployment options:');
console.log('1. Vercel (Recommended):');
console.log('   - Install: npm install -g vercel');
console.log('   - Deploy: vercel');
console.log('   - Set env vars in Vercel dashboard\n');

console.log('2. Netlify:');
console.log('   - Drag and drop build folder to netlify.com');
console.log('   - Add serverless functions in netlify/functions/\n');

console.log('3. Other platforms:');
console.log('   - Upload build folder to your hosting provider');
console.log('   - Configure environment variables\n');

console.log('📋 Don\'t forget to:');
console.log('- Update Spotify app redirect URI to production URL');
console.log('- Set environment variables on your hosting platform');
console.log('- Test the authentication flow after deployment');
