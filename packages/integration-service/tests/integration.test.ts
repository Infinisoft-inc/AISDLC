/**
 * End-to-End Integration Tests
 */

import './setup';
import { getInstallationId, createGitHubSetup } from '../src/index';

describe('End-to-End Integration', () => {
  const dopplerToken = process.env.DOPPLER_TOKEN!;
  const testOrganization = process.env.TEST_ORGANIZATION!;

  test('should get installation ID with convenience function', async () => {
    const result = await getInstallationId(dopplerToken, testOrganization);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const tenantData = result.data as any;
    expect(tenantData?.organizationName).toBe(testOrganization);
    expect(typeof tenantData?.installationId).toBe('number');

    console.log(`✅ Installation ID lookup: ${tenantData?.installationId}`);
  }, 15000);

  test('should create complete GitHub setup', async () => {
    const result = await createGitHubSetup(dopplerToken, testOrganization);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    // Test the GitHub client works by listing repositories (installation tokens can't access user info)
    const client = result.data;
    const { data: repos } = await client.rest.apps.listReposAccessibleToInstallation();

    expect(repos).toBeDefined();
    expect(Array.isArray(repos.repositories)).toBe(true);
    console.log(`✅ Complete GitHub setup created, found ${repos.repositories.length} accessible repositories`);
  }, 15000);

  test('should handle invalid organization in complete setup', async () => {
    const result = await createGitHubSetup(dopplerToken, 'non-existent-org-12345');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('No GitHub App installation found');
    
    console.log('✅ Invalid organization in complete setup handled correctly');
  }, 15000);

  test('should handle invalid Doppler token in complete setup', async () => {
    const result = await createGitHubSetup('invalid-token', testOrganization);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    console.log('✅ Invalid Doppler token in complete setup handled correctly');
  }, 15000);
});
