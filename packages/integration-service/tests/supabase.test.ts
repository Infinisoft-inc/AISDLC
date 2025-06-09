/**
 * Supabase Integration Tests
 */

import './setup';
import { getSupabaseCredentials } from '../src/getDopplerSecrets';
import { createSupabaseClient, getInstallationIdByOrg, listOrganizations } from '../src/createSupabaseClient';

describe('Supabase Integration', () => {
  const dopplerConfig = {
    token: process.env.DOPPLER_TOKEN!,
    project: process.env.DOPPLER_PROJECT || 'ai-sdlc',
    config: process.env.DOPPLER_CONFIG || 'prd'
  };

  const testOrganization = process.env.TEST_ORGANIZATION!;
  const expectedInstallationId = process.env.EXPECTED_INSTALLATION_ID 
    ? parseInt(process.env.EXPECTED_INSTALLATION_ID) 
    : undefined;

  test('should create Supabase client with valid credentials', async () => {
    const credsResult = await getSupabaseCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const client = createSupabaseClient(credsResult.data!);
    expect(client).toBeDefined();
    
    console.log('✅ Supabase client created successfully');
  }, 10000);

  test('should fetch installation ID for test organization', async () => {
    const credsResult = await getSupabaseCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const client = createSupabaseClient(credsResult.data!);
    const result = await getInstallationIdByOrg(client, testOrganization);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.organizationName).toBe(testOrganization);
    expect(result.data?.installationId).toBeDefined();
    expect(typeof result.data?.installationId).toBe('number');
    
    if (expectedInstallationId) {
      expect(result.data?.installationId).toBe(expectedInstallationId);
    }
    
    console.log(`✅ Installation ID for ${testOrganization}: ${result.data?.installationId}`);
  }, 10000);

  test('should list all organizations', async () => {
    const credsResult = await getSupabaseCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const client = createSupabaseClient(credsResult.data!);
    const result = await listOrganizations(client);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0);
    
    // Verify test organization is in the list
    const testOrg = result.data!.find(org => org.organizationName === testOrganization);
    expect(testOrg).toBeDefined();
    
    console.log(`✅ Found ${result.data!.length} organizations`);
    console.log('Organizations:', result.data!.map(org => org.organizationName).join(', '));
  }, 10000);

  test('should handle non-existent organization', async () => {
    const credsResult = await getSupabaseCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const client = createSupabaseClient(credsResult.data!);
    const result = await getInstallationIdByOrg(client, 'non-existent-org-12345');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('No GitHub App installation found');
    
    console.log('✅ Non-existent organization handled correctly');
  }, 10000);
});
