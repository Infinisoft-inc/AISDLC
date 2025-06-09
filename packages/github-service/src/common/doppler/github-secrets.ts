/**
 * GitHub-specific secret getters using Doppler
 * Functional programming approach with SRP
 */
import { createDopplerClient, getSecret } from './client';

const PROJECT = 'ai-sdlc';
const CONFIG = 'prd';

// Create singleton client
const dopplerClient = createDopplerClient({ project: PROJECT, config: CONFIG });

/**
 * Get GitHub App ID
 */
export async function getGitHubAppId(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_APP_ID');
}

/**
 * Get GitHub App private key
 */
export async function getGitHubPrivateKey(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_PRIVATE_KEY');
}

/**
 * Get GitHub Client ID
 */
export async function getGitHubClientId(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_CLIENT_ID');
}

/**
 * Get GitHub Client Secret
 */
export async function getGitHubClientSecret(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_CLIENT_SECRET');
}

/**
 * Get GitHub Webhook Secret
 */
export async function getGitHubWebhookSecret(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_WEBHOOK_SECRET');
}

/**
 * Get fallback installation ID (deprecated - use Supabase lookup instead)
 */
export async function getFallbackInstallationId(): Promise<string> {
  console.warn('⚠️ Using fallback installation ID - prefer Supabase lookup');
  return getSecret(dopplerClient, PROJECT, CONFIG, 'GITHUB_INSTALLATION_ID');
}
