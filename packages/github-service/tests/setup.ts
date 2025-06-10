/**
 * Test setup for GitHub Service
 * Loads environment variables and validates configuration
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadTestConfig, validateTestConfig } from './config/test-config.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.test.local');

// Load test environment variables
config({ path: envPath });

// Check if we have real credentials or should skip integration tests
const hasRealCredentials = process.env.DOPPLER_TOKEN &&
                          process.env.DOPPLER_TOKEN !== 'your-test-doppler-token' &&
                          process.env.TEST_ORGANIZATION &&
                          process.env.TEST_ORGANIZATION === 'Infinisoft-inc';

if (!hasRealCredentials) {
  console.warn('⚠️ No real credentials found in environment variables.');
  console.warn('   Integration tests will be skipped.');
  console.warn('   To run integration tests:');
  console.warn('   1. Copy .env.test to .env.test.local');
  console.warn('   2. Fill in your real Doppler token and organization');
  console.warn('   3. Run tests again');
}

// Load centralized test configuration
const centralizedConfig = loadTestConfig();

// Validate configuration
const validation = validateTestConfig(centralizedConfig);
if (!validation.valid) {
  console.error('❌ Invalid test configuration:');
  validation.errors.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

console.log('✅ GitHub Service test environment loaded successfully');

// Export both legacy and new configurations
export const testConfig = {
  hasRealCredentials,
  dopplerToken: process.env.DOPPLER_TOKEN || 'mock-token',
  organization: centralizedConfig.organization,
  repository: centralizedConfig.repository,
  expectedInstallationId: process.env.EXPECTED_INSTALLATION_ID
    ? parseInt(process.env.EXPECTED_INSTALLATION_ID)
    : undefined,
  testEpicNumber: process.env.TEST_EPIC_NUMBER
    ? parseInt(process.env.TEST_EPIC_NUMBER)
    : undefined,
  testFeatureNumber: process.env.TEST_FEATURE_NUMBER
    ? parseInt(process.env.TEST_FEATURE_NUMBER)
    : undefined,
  testTaskNumber: process.env.TEST_TASK_NUMBER
    ? parseInt(process.env.TEST_TASK_NUMBER)
    : undefined,
};

// Export centralized configuration
export { centralizedConfig };
