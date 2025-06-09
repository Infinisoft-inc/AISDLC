/**
 * GitHub-specific Supabase queries
 * Reusable across the entire AI-SDLC application
 */
import { supabase } from './client';

// Type definitions for GitHub installations table
export interface GitHubInstallation {
  id?: number;
  installation_id: number;
  account_id: number;
  account_login: string;
  account_type: 'User' | 'Organization';
  permissions: Record<string, any>;
  repository_selection: 'all' | 'selected';
  access_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  inserted_at?: string;
}

/**
 * Get installation ID by organization name
 */
export async function getInstallationIdByOrg(orgName: string): Promise<number> {
  const { data, error } = await supabase
    .from('github_installations')
    .select('installation_id')
    .eq('account_login', orgName)
    .single();

  if (error || !data) {
    throw new Error(`No GitHub App installation found for organization: ${orgName}`);
  }

  return data.installation_id;
}

/**
 * Insert new GitHub installation
 */
export async function insertInstallation(installation: GitHubInstallation): Promise<GitHubInstallation> {
  const { data, error } = await supabase
    .from('github_installations')
    .insert(installation)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insertion failed: ${error.message}`);
  }

  return data;
}

/**
 * Delete GitHub installation by installation ID
 */
export async function deleteInstallation(installationId: number): Promise<void> {
  const { error } = await supabase
    .from('github_installations')
    .delete()
    .eq('installation_id', installationId);

  if (error) {
    throw new Error(`Supabase deletion failed: ${error.message}`);
  }
}

/**
 * Get all installations for an organization
 */
export async function getInstallationsByOrg(orgName: string): Promise<GitHubInstallation[]> {
  const { data, error } = await supabase
    .from('github_installations')
    .select('*')
    .eq('account_login', orgName);

  if (error) {
    throw new Error(`Failed to fetch installations: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if installation exists
 */
export async function installationExists(installationId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('github_installations')
    .select('id')
    .eq('installation_id', installationId)
    .single();

  return !error && !!data;
}
