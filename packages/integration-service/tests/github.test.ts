/**
 * GitHub Integration Tests
 */

import './setup';
import { getGitHubCredentials } from '../src/getDopplerSecrets';
import { createGitHubClient, createGitHubInstallationClient } from '../src/createGitHubClient';
import { getInstallationId } from '../src/index';

describe('GitHub Integration', () => {
  const dopplerConfig = {
    token: process.env.DOPPLER_TOKEN!,
    project: process.env.DOPPLER_PROJECT || 'ai-sdlc',
    config: process.env.DOPPLER_CONFIG || 'prd'
  };

  const testOrganization = process.env.TEST_ORGANIZATION!;

  test('should create GitHub App client', async () => {
    const credsResult = await getGitHubCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const client = createGitHubClient(credsResult.data!);
    expect(client).toBeDefined();
    
    // Test basic API call
    const { data: app } = await client.rest.apps.getAuthenticated();
    expect(app).toBeDefined();
    expect(app?.name).toBeDefined();

    console.log(`✅ GitHub App client created for: ${app?.name}`);
  }, 15000);

  test('should create GitHub installation client', async () => {
    const credsResult = await getGitHubCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const installationResult = await getInstallationId(dopplerConfig.token, testOrganization);
    expect(installationResult.success).toBe(true);

    const tenantData = installationResult.data as any;
    const clientResult = await createGitHubInstallationClient(
      credsResult.data!,
      tenantData.installationId
    );
    
    expect(clientResult.success).toBe(true);
    expect(clientResult.data).toBeDefined();
    
    // Test installation-specific API call by listing repositories
    const client = clientResult.data!;
    const { data: repos } = await client.rest.apps.listReposAccessibleToInstallation();

    expect(repos).toBeDefined();
    expect(Array.isArray(repos.repositories)).toBe(true);

    console.log(`✅ GitHub installation client created, found ${repos.repositories.length} repositories`);
  }, 15000);

  test('should list repositories for installation', async () => {
    const credsResult = await getGitHubCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const installationResult = await getInstallationId(dopplerConfig.token, testOrganization);
    expect(installationResult.success).toBe(true);

    const tenantData2 = installationResult.data as any;
    const clientResult = await createGitHubInstallationClient(
      credsResult.data!,
      tenantData2.installationId
    );
    expect(clientResult.success).toBe(true);
    
    const client = clientResult.data!;
    const { data: repos } = await client.rest.apps.listReposAccessibleToInstallation();
    
    expect(repos).toBeDefined();
    expect(Array.isArray(repos.repositories)).toBe(true);
    
    console.log(`✅ Found ${repos.repositories.length} accessible repositories`);
    if (repos.repositories.length > 0) {
      console.log('Sample repos:', repos.repositories.slice(0, 3).map(r => r.name).join(', '));
    }
  }, 15000);

  test('should handle invalid installation ID', async () => {
    const credsResult = await getGitHubCredentials(dopplerConfig);
    expect(credsResult.success).toBe(true);
    
    const clientResult = await createGitHubInstallationClient(
      credsResult.data!,
      999999999 // Invalid installation ID
    );
    
    expect(clientResult.success).toBe(false);
    expect(clientResult.error).toBeDefined();
    expect(clientResult.error).toContain('Failed to create GitHub installation client');
    
    console.log('✅ Invalid installation ID handled correctly');
  }, 15000);
});
