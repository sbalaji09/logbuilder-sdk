/**
 * Basic test script to verify SDK connects to local LogBuilder backend
 *
 * Before running:
 * 1. Start your LogBuilder backend on localhost:8080
 * 2. Create an API key in your dashboard
 * 3. Replace 'your-api-key-here' below with your actual API key
 * 4. Run: node test.js
 */

const { LogBuilder } = require('./dist');

// Configure logger to point to local backend
const logger = new LogBuilder({
  apiKey: 'lak_502e9efb89eabb0e4692a7472a8215cfc1d212ad1f4b996c37ff2bff672210d8',  // Replace with actual API key from your dashboard
  projectID: 'test-project',
  environment: 'development',
  endpointURL: 'http://localhost:8080/api/v1/logs/batch'
});

console.log('SDK initialized - sending test logs...');

// Send different types of logs
logger.info('SDK test started', { testId: 1, timestamp: Date.now() });

logger.warn('This is a test warning', {
  warningType: 'test',
  severity: 'medium'
});

logger.error('This is a test error', {
  errorCode: 'TEST_ERROR',
  stack: 'Test stack trace',
  userId: 123
});

logger.debug('Debug information', {
  debugLevel: 'verbose',
  component: 'test-script'
});

logger.info('SDK test completed successfully');

// Give time for logs to batch and send, then shutdown gracefully
console.log('Waiting 7 seconds for logs to flush...');
setTimeout(async () => {
  console.log('Shutting down logger...');
  await logger.shutdown();
  console.log('Logger shutdown complete. Check your LogBuilder dashboard!');
  process.exit(0);
}, 7000);
