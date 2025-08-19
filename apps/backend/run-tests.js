#!/usr/bin/env node

/**
 * Comprehensive test runner for TaskFlow Backend
 * 
 * Usage:
 *   node run-tests.js                    # Run all tests
 *   node run-tests.js --unit             # Run only unit tests
 *   node run-tests.js --integration      # Run only integration tests
 *   node run-tests.js --coverage         # Run with coverage
 *   node run-tests.js --watch            # Run in watch mode
 *   node run-tests.js --file auth        # Run specific test file
 *   node run-tests.js --pattern "login"  # Run tests matching pattern
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const flags = {
  unit: args.includes('--unit'),
  integration: args.includes('--integration'),
  coverage: args.includes('--coverage'),
  watch: args.includes('--watch'),
  verbose: args.includes('--verbose'),
  silent: args.includes('--silent'),
  file: args.includes('--file'),
  pattern: args.includes('--pattern')
};

// Build Jest command
let jestArgs = [];

// Test type selection
if (flags.unit) {
  jestArgs.push('--testPathPattern=(?!integration).*\\.test\\.js$');
} else if (flags.integration) {
  jestArgs.push('--testPathPattern=integration\\.test\\.js$');
}

// Coverage
if (flags.coverage) {
  jestArgs.push('--coverage');
}

// Watch mode
if (flags.watch) {
  jestArgs.push('--watch');
}

// Verbose output
if (flags.verbose) {
  jestArgs.push('--verbose');
}

// Silent mode
if (flags.silent) {
  jestArgs.push('--silent');
}

// Specific file
if (flags.file) {
  const fileIndex = args.indexOf('--file') + 1;
  if (fileIndex < args.length) {
    const fileName = args[fileIndex];
    jestArgs.push(`--testPathPattern=${fileName}`);
  }
}

// Test name pattern
if (flags.pattern) {
  const patternIndex = args.indexOf('--pattern') + 1;
  if (patternIndex < args.length) {
    const pattern = args[patternIndex];
    jestArgs.push(`--testNamePattern="${pattern}"`);
  }
}

// Display banner
console.log('\n🧪 TaskFlow Backend Test Suite\n');
console.log('═'.repeat(50));

if (flags.unit) {
  console.log('📋 Running Unit Tests');
} else if (flags.integration) {
  console.log('🔗 Running Integration Tests');
} else {
  console.log('🎯 Running All Tests');
}

if (flags.coverage) {
  console.log('📊 Generating Coverage Report');
}

if (flags.watch) {
  console.log('👀 Watch Mode Enabled');
}

console.log('═'.repeat(50));
console.log();

// Run Jest
const jestPath = path.join(__dirname, 'node_modules', '.bin', 'jest');
const jestProcess = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

jestProcess.on('close', (code) => {
  console.log('\n' + '═'.repeat(50));
  
  if (code === 0) {
    console.log('✅ All tests passed!');
    
    if (flags.coverage) {
      console.log('📊 Coverage report generated in ./coverage/');
      console.log('   Open coverage/lcov-report/index.html to view detailed report');
    }
  } else {
    console.log('❌ Some tests failed');
    console.log('📝 Review the output above for details');
  }
  
  console.log('═'.repeat(50));
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  process.exit(1);
});
