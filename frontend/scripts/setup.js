#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎵 Setting up Spotify Wrapped App...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('⚠️  Please update .env with your Spotify credentials\n');
  } else {
    console.log('❌ env.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

console.log('🚀 Setup complete! Next steps:');
console.log('1. Update .env with your Spotify Client ID and Secret');
console.log('2. Add redirect URI to your Spotify app: http://localhost:3000/api/callback');
console.log('3. Run: npm start');
console.log('4. Visit: http://localhost:3000\n');

console.log('📚 For deployment instructions, see README.md');
