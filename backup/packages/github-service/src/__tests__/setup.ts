/**
 * Jest test setup file
 * Configures global test environment
 */

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
process.env.GITHUB_APP_ID = '123456';

// Global test timeout
jest.setTimeout(10000);
