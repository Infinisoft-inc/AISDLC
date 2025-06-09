/**
 * Reusable Supabase Client
 * Can be used across the entire AI-SDLC application
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '../doppler/supabase-secrets.js';

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

/**
 * Create a Supabase client instance
 */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function createSupabaseClientWithDoppler(): Promise<SupabaseClient> {
  const url = await getSupabaseUrl();
  const serviceRoleKey = await getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration in Doppler');
  }

  return createSupabaseClient({ url, serviceRoleKey });
}