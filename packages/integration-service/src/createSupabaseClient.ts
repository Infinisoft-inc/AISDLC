/**
 * Create Supabase client
 * Single responsibility: Supabase client creation and tenant queries
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseCredentials, TenantData, IntegrationResult } from './types';

/**
 * Create Supabase client
 */
export function createSupabaseClient(credentials: SupabaseCredentials): SupabaseClient {
  return createClient(credentials.url, credentials.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Get installation ID by organization name
 */
export async function getInstallationIdByOrg(
  client: SupabaseClient,
  organizationName: string
): Promise<IntegrationResult<TenantData>> {
  try {
    const { data, error } = await client
      .from('github_installations')
      .select('*')
      .eq('account_login', organizationName);

    if (error) {
      return {
        success: false,
        error: `Supabase query failed: ${error.message}`
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: `No GitHub App installation found for organization: ${organizationName}`
      };
    }

    // Use the first result if multiple found
    const installation = data[0];

    return {
      success: true,
      data: {
        organizationName,
        installationId: installation.installation_id,
        accountLogin: installation.account_login,
        accountType: installation.account_type || 'Organization'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to query tenant data: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * List all organizations
 */
export async function listOrganizations(client: SupabaseClient): Promise<IntegrationResult<TenantData[]>> {
  try {
    const { data, error } = await client
      .from('github_installations')
      .select('*')
      .order('account_login');

    if (error) {
      return {
        success: false,
        error: `Failed to list organizations: ${error.message}`
      };
    }

    const organizations = data?.map(item => ({
      organizationName: item.account_login,
      installationId: item.installation_id,
      accountLogin: item.account_login,
      accountType: item.account_type || 'Organization'
    })) || [];

    return {
      success: true,
      data: organizations
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list organizations: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
