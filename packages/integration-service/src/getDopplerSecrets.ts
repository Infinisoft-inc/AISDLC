/**
 * Get secrets from Doppler
 * Single responsibility: Doppler secret retrieval
 */

import { DopplerSDK } from '@dopplerhq/node-sdk';
import type { DopplerConfig, IntegrationResult, SupabaseCredentials, GitHubCredentials } from './types';
import { url } from 'inspector';

/**
 * Get Supabase credentials from Doppler
 */
export async function getSupabaseCredentials(config: DopplerConfig): Promise<IntegrationResult<SupabaseCredentials>> {
  try {
    const doppler = new DopplerSDK({ accessToken: config.token });
    const project = config.project || 'ai-sdlc';
    const environment = config.config || 'prd';

    const [urlSecret, keySecret] = await Promise.all([
      doppler.secrets.get(project, environment, 'NEXT_PUBLIC_SUPABASE_URL'),
      doppler.secrets.get(project, environment, 'SUPABASE_SERVICE_ROLE_KEY')
    ]);

    if (!urlSecret?.value?.computed || !keySecret?.value?.computed) {
      return {
        success: false,
        error: 'Supabase credentials not found in Doppler'
      };
    }

    return {
      success: true,
      data: {
        url: String(urlSecret.value.computed),
        serviceRoleKey: String(keySecret.value.computed)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get Supabase credentials: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Get GitHub credentials from Doppler
 */
export async function getGitHubCredentials(config: DopplerConfig): Promise<IntegrationResult<GitHubCredentials>> {
  try {
    const doppler = new DopplerSDK({ accessToken: config.token });
    const project = config.project || 'ai-sdlc';
    const environment = config.config || 'prd';

    const [appId, clientId, clientSecret, privateKey] = await Promise.all([
      doppler.secrets.get(project, environment, 'GITHUB_APP_ID'),
      doppler.secrets.get(project, environment, 'GITHUB_CLIENT_ID'),
      doppler.secrets.get(project, environment, 'GITHUB_CLIENT_SECRET'),
      doppler.secrets.get(project, environment, 'GITHUB_PRIVATE_KEY')
    ]);

    if (!appId?.value || !clientId?.value || !clientSecret?.value || !privateKey?.value) {
      return {
        success: false,
        error: 'GitHub credentials not found in Doppler'
      };
    }

    return {
      success: true,
      data: {
        appId: String(appId.value.computed),
        clientId: String(clientId.value.computed),
        clientSecret: String(clientSecret.value.computed),
        privateKey: String(privateKey.value.computed)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get GitHub credentials: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
