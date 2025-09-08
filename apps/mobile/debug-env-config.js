#!/usr/bin/env node

/**
 * Debug Environment Configuration
 * Check what URLs the mobile app is actually using
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Mobile App Environment Configuration');
console.log('================================================\n');

// Check the actual env.ts file
const envPath = path.join(__dirname, 'config', 'env.ts');
if (fs.existsSync(envPath)) {
    console.log('1️⃣ Reading env.ts file:');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extract all URL configurations
    const urlMatches = envContent.match(/['"`](http:\/\/[^'"`]+)['"`]/g);
    if (urlMatches) {
        console.log('   📍 Found URLs in configuration:');
        urlMatches.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });
    }
    
    // Check specifically for SOCKET_URL
    const socketUrlMatch = envContent.match(/SOCKET_URL.*?['"`]([^'"`]+)['"`]/);
    if (socketUrlMatch) {
        console.log(`\n   🔌 SOCKET_URL: ${socketUrlMatch[1]}`);
    }
    
    // Check for any hardcoded 192.168.217.1
    if (envContent.includes('192.168.217.1')) {
        console.log('\n   ⚠️  WARNING: Found 192.168.217.1 in configuration!');
        const lines = envContent.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('192.168.217.1')) {
                console.log(`   Line ${index + 1}: ${line.trim()}`);
            }
        });
    } else {
        console.log('\n   ✅ No 192.168.217.1 found in configuration');
    }
} else {
    console.log('❌ env.ts file not found');
}

console.log('');

// Check if there are any environment variables set
console.log('2️⃣ Checking environment variables:');
const envVars = [
    'EXPO_PUBLIC_SOCKET_URL',
    'EXPO_PUBLIC_API_URL', 
    'EXPO_PUBLIC_BASE_URL',
    'EXPO_PUBLIC_API_BASE_URL'
];

envVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
        console.log(`   ${envVar}: ${value}`);
    } else {
        console.log(`   ${envVar}: (not set)`);
    }
});

console.log('');

// Check package.json for any scripts that might set environment variables
console.log('3️⃣ Checking package.json scripts:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageContent.scripts) {
        Object.entries(packageContent.scripts).forEach(([scriptName, scriptValue]) => {
            if (typeof scriptValue === 'string' && scriptValue.includes('192.168')) {
                console.log(`   ⚠️  Script "${scriptName}" contains 192.168: ${scriptValue}`);
            }
        });
    }
}

console.log('');

// Check if there's a .env file
console.log('4️⃣ Checking for .env files:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(envFile => {
    const envFilePath = path.join(__dirname, envFile);
    if (fs.existsSync(envFilePath)) {
        console.log(`   📄 Found ${envFile}`);
        const envFileContent = fs.readFileSync(envFilePath, 'utf8');
        if (envFileContent.includes('192.168.217.1')) {
            console.log(`   ⚠️  ${envFile} contains 192.168.217.1`);
        }
    } else {
        console.log(`   📄 ${envFile}: (not found)`);
    }
});

console.log('');

// Check app.json for any extra configuration
console.log('5️⃣ Checking app.json for extra configuration:');
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    if (appJson.expo && appJson.expo.extra) {
        console.log('   📄 Found extra configuration in app.json:');
        console.log(JSON.stringify(appJson.expo.extra, null, 2));
    } else {
        console.log('   📄 No extra configuration in app.json');
    }
}

console.log('\n🔧 RECOMMENDATIONS:');
console.log('===================');
console.log('1. If you see 192.168.217.1 anywhere above, that\'s the source of the issue');
console.log('2. Clear any environment variables that might override the configuration');
console.log('3. Restart the mobile app completely');
console.log('4. Check if there are any cached configurations');
console.log('5. Verify the mobile app is reading from the correct env.ts file');
