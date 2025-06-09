/**
 * Reusable Supabase Client
 * Can be used across the entire AI-SDLC application
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Create default Supabase client from environment variables
 */
export function createDefaultSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient({ url, serviceRoleKey });
}

// Export singleton instance for convenience
export const supabase = createDefaultSupabaseClient();
