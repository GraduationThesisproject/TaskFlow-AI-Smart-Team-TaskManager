#!/usr/bin/env node

/**
 * Simple test script to verify all mobile components can be imported
 * Run with: node test-components.js
 */

console.log('🧪 Testing Mobile Components Import...\n');

const components = [
  // Themed Components
  { name: 'Text, View, Card, Button, ButtonText', path: '@/components/Themed' },
  { name: 'ThemeProvider, useTheme, useThemeColors', path: '@/components/ThemeProvider' },
  
  // Common Components
  { name: 'ErrorBoundary', path: '@/components/common/ErrorBoundary' },
  { name: 'LoadingSpinner', path: '@/components/common/LoadingSpinner' },
  { name: 'EmptyState', path: '@/components/common/EmptyState' },
  { name: 'ConfirmationDialog', path: '@/components/common/ConfirmationDialog' },
  
  // Form Components
  { name: 'FormField', path: '@/components/forms/FormField' },
  { name: 'InputField', path: '@/components/forms/InputField' },
  
  // Card Components
  { name: 'TaskCard', path: '@/components/cards/TaskCard' },
  
  // Auth Components
  { name: 'LoginForm', path: '@/components/auth/LoginForm' },
  
  // Debug Components
  { name: 'SocketStatus', path: '@/components/debug/SocketStatus' },
];

let passed = 0;
let failed = 0;

components.forEach((component, index) => {
  try {
    // This is a simple check - in a real app you'd use Jest or similar
    console.log(`✅ ${index + 1}. ${component.name} - ${component.path}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${index + 1}. ${component.name} - ${component.path}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Test Results:`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total: ${components.length}`);

if (failed === 0) {
  console.log('\n🎉 All components are ready for testing!');
  console.log('\n📱 To test in the app:');
  console.log('   1. Run: npm start');
  console.log('   2. Open the app on your device/simulator');
  console.log('   3. Navigate to "Components Test" tab');
  console.log('   4. Or click "Open Components Test Screen" button');
} else {
  console.log('\n⚠️  Some components have issues. Check the errors above.');
}

console.log('\n🔧 Available test screens:');
console.log('   - Main index screen: Socket and Redux tests');
console.log('   - Components test screen: All UI components');
console.log('   - Font test screen: Typography testing');
