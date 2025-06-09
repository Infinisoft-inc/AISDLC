/**
 * Reusable Supabase Client for AI-SDLC App
 * Can be used across the entire application
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient({ url, serviceRoleKey });
}

/**
 * Create Supabase client with Doppler fallback
 */
export async function createSupabaseClientWithDoppler(): Promise<SupabaseClient> {
  try {
    // Try environment variables first
    return createDefaultSupabaseClient();
  } catch (error) {
    // Fallback to Doppler
    const { getSupabaseUrl, getSupabaseServiceKey } = await import('@/common/doppler/github-secrets');
    
    const url = await getSupabaseUrl();
    const serviceRoleKey = await getSupabaseServiceKey();

    if (!url || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration in both environment variables and Doppler');
    }

    return createSupabaseClient({ url, serviceRoleKey });
  }
}

// Export singleton instance for convenience
export const supabase = createDefaultSupabaseClient();
