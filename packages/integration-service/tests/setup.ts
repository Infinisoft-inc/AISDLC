/**
 * Test setup - Load environment variables
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Validate required environment variables
const requiredEnvVars = [
  'DOPPLER_TOKEN',
  'TEST_ORGANIZATION'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease copy .env.test and fill in your test credentials.');
  process.exit(1);
}

console.log('✅ Test environment loaded successfully');
