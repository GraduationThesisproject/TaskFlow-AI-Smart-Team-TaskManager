#!/usr/bin/env node

/**
 * Socket.IO Test Runner
 * 
 * This script runs all Socket.IO tests independently.
 * Usage: node run-socket-tests.js [test-file]
 * 
 * Examples:
 * - node run-socket-tests.js                    # Run all socket tests
 * - node run-socket-tests.js socket.board       # Run only board socket tests
 * - node run-socket-tests.js socket.task        # Run only task socket tests
 * - node run-socket-tests.js socket.notification # Run only notification socket tests
 * - node run-socket-tests.js socket.workspace   # Run only workspace socket tests
 */

const { spawn } = require('child_process');
const path = require('path');

// Test file patterns
const testFiles = {
  'socket.board': 'socket.board.test.js',
  'socket.task': 'socket.task.test.js', 
  'socket.notification': 'socket.notification.test.js',
  'socket.workspace': 'socket.workspace.test.js'
};

// Get command line arguments
const args = process.argv.slice(2);
const testPattern = args[0];

// Determine which tests to run
let testPatterns = [];
if (testPattern && testFiles[testPattern]) {
  testPatterns = [testFiles[testPattern]];
} else if (testPattern) {
  console.log(`Unknown test pattern: ${testPattern}`);
  console.log('Available patterns:');
  Object.keys(testFiles).forEach(key => {
    console.log(`  - ${key}`);
  });
  process.exit(1);
} else {
  // Run all socket tests
  testPatterns = Object.values(testFiles);
}

console.log('🚀 Running Socket.IO Tests...\n');

// Set test environment
process.env.NODE_ENV = 'test';

// Run Jest with the specified patterns
const jestArgs = [
  '--config', path.join(__dirname, '../../jest.config.js'),
  '--testTimeout', '30000',
  '--verbose',
  '--detectOpenHandles',
  '--forceExit'
];

// Add test patterns
testPatterns.forEach(pattern => {
  jestArgs.push('--testPathPattern', pattern);
});

// Spawn Jest process
const jestProcess = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '../..'),
  env: {
    ...process.env,
    NODE_ENV: 'test'
  }
});

// Handle process events
jestProcess.on('close', (code) => {
  console.log(`\n✨ Socket.IO tests completed with exit code: ${code}`);
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  process.exit(1);
});

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping tests...');
  jestProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping tests...');
  jestProcess.kill('SIGTERM');
});
