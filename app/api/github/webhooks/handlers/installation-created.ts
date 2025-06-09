/**
 * GitHub App Installation Created Event Handler
 * Clean and simple - no external dependencies
 */
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Type definition
interface GitHubInstallation {
  installation_id: number;
  account_id: number;
  account_login: string;
  account_type: 'User' | 'Organization';
  permissions: Record<string, any>;
  repository_selection: 'all' | 'selected';
  created_at: string;
  updated_at: string;
}

/**
 * Handle GitHub App installation created event
 */
export async function handleInstallationCreated(event: any) {
  const { installation } = event.payload;
  const account = installation.account;

  console.log('🔧 New installation created', {
    account: account.login,
    type: account.type,
    installationId: installation.id,
    permissions: installation.permissions
  });

  try {
    // Store installation data in Supabase (no Doppler for installation IDs)
    const installationData: GitHubInstallation = {
      installation_id: installation.id,
      account_id: installation.account.id,
      account_login: installation.account.login,
      account_type: installation.account.type,
      permissions: installation.permissions || {},
      repository_selection: installation.repository_selection || 'all',
      created_at: installation.created_at,
      updated_at: new Date().toISOString()
    };

    console.log('📊 Storing installation in Supabase', {
      installationId: installation.id,
      accountLogin: account.login,
      accountType: account.type
    });

    const { data, error } = await supabase
      .from('github_installations')
      .insert(installationData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insertion failed: ${error.message}`);
    }

    console.log('✅ Installation stored successfully', {
      installationId: installation.id,
      account: account.login,
      supabaseId: data.id
    });

    console.log('🎯 Installation setup complete', {
      account: account.login,
      installationId: installation.id
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Failed to process installation', {
      account: account.login,
      installationId: installation.id,
      error: errorMessage,
      stack: errorStack
    });
    throw error;
  }
}
