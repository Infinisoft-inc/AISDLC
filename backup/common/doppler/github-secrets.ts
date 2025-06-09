/**
 * GitHub-specific secret getters using Doppler
 * Reusable across the entire AI-SDLC application
 */
import { getSecret } from './client';

/**
 * Get GitHub App ID
 */
export async function getGitHubAppId(): Promise<string> {
  return getSecret('GITHUB_APP_ID');
}

/**
 * Get GitHub App private key
 */
export async function getGitHubPrivateKey(): Promise<string> {
  return getSecret('GITHUB_PRIVATE_KEY');
}

/**
 * Get GitHub Client ID
 */
export async function getGitHubClientId(): Promise<string> {
  return getSecret('GITHUB_CLIENT_ID');
}

/**
 * Get GitHub Client Secret
 */
export async function getGitHubClientSecret(): Promise<string> {
  return getSecret('GITHUB_CLIENT_SECRET');
}

/**
 * Get GitHub Webhook Secret
 */
export async function getGitHubWebhookSecret(): Promise<string> {
  return getSecret('GITHUB_WEBHOOK_SECRET');
}

/**
 * Get Supabase URL
 */
export async function getSupabaseUrl(): Promise<string> {
  return getSecret('NEXT_PUBLIC_SUPABASE_URL');
}

/**
 * Get Supabase Service Role Key
 */
export async function getSupabaseServiceKey(): Promise<string> {
  return getSecret('SUPABASE_SERVICE_ROLE_KEY');
}
