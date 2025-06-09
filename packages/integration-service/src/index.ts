/**
 * Integration Service - Functional Client Factory
 * Lightweight service for creating authenticated clients
 */

// Export types
export type {
  DopplerConfig,
  SupabaseCredentials,
  GitHubCredentials,
  TenantData,
  IntegrationResult
} from './types.js';

// Export Doppler functions
export {
  getSupabaseCredentials,
  getGitHubCredentials
} from './getDopplerSecrets.js';

// Export Supabase functions
export {
  createSupabaseClient,
  getInstallationIdByOrg,
  listOrganizations
} from './createSupabaseClient.js';

// Export GitHub functions
export {
  createGitHubClient,
  createGitHubInstallationClient
} from './createGitHubClient.js';

/**
 * Convenience function: Get installation ID for organization
 */
export async function getInstallationId(dopplerToken: string, organizationName: string) {
  // Import functions to avoid dynamic import issues
  const { getSupabaseCredentials } = await import('./getDopplerSecrets.js');
  const { createSupabaseClient, getInstallationIdByOrg } = await import('./createSupabaseClient.js');

  // Get Supabase credentials from Doppler
  const supabaseResult = await getSupabaseCredentials({ token: dopplerToken });
  if (!supabaseResult.success || !supabaseResult.data) {
    return supabaseResult;
  }

  // Create Supabase client and query
  const supabaseClient = createSupabaseClient(supabaseResult.data);
  return getInstallationIdByOrg(supabaseClient, organizationName);
}

/**
 * Convenience function: Create complete GitHub setup for organization
 */
export async function createGitHubSetup(dopplerToken: string, organizationName: string): Promise<any> {
  const { getGitHubCredentials } = await import('./getDopplerSecrets.js');
  const { createGitHubInstallationClient } = await import('./createGitHubClient.js');

  // Get installation ID
  const installationResult = await getInstallationId(dopplerToken, organizationName);
  if (!installationResult.success || !installationResult.data) {
    return installationResult;
  }

  // Get GitHub credentials
  const githubCredsResult = await getGitHubCredentials({ token: dopplerToken });
  if (!githubCredsResult.success || !githubCredsResult.data) {
    return githubCredsResult;
  }

  // Create GitHub client
  const tenantData = installationResult.data as any;
  return createGitHubInstallationClient(
    githubCredsResult.data,
    tenantData.installationId
  );
}
