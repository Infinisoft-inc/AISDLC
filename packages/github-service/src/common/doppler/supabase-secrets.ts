/**
 * GitHub-specific secret getters using Doppler
 * Functional programming approach with SRP
 */
import { createDopplerClient, getSecret } from './client.js';

const PROJECT = 'ai-sdlc';
const CONFIG = 'prd';

// Create singleton client
const dopplerClient = createDopplerClient({ project: PROJECT, config: CONFIG });

/**
 * Get Supabase URL
 */
export async function getSupabaseUrl(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'SUPABASE_URL');
}
/**
 * Get Supabase Service Role Key
 */
export async function getSupabaseServiceRoleKey(): Promise<string> {
  return getSecret(dopplerClient, PROJECT, CONFIG, 'SUPABASE_SERVICE_ROLE_KEY');
}