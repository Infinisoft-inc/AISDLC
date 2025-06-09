/**
 * GitHub App Installation Deleted Event Handler
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

/**
 * Handle GitHub App installation deleted event
 */
export async function handleInstallationDeleted(event: any) {
  const { installation } = event.payload;
  const account = installation.account;
  
  console.log('🗑️ Installation deleted', {
    account: account.login,
    type: account.type,
    installationId: installation.id
  });

  try {
    // Delete installation record from Supabase
    console.log('📊 Deleting installation from Supabase', {
      installationId: installation.id,
      accountLogin: account.login
    });

    const { error } = await supabase
      .from('github_installations')
      .delete()
      .eq('installation_id', installation.id);

    if (error) {
      throw new Error(`Supabase deletion failed: ${error.message}`);
    }

    console.log('✅ Installation deleted successfully', {
      installationId: installation.id,
      account: account.login
    });

    console.log('🎯 Installation cleanup complete', {
      account: account.login,
      installationId: installation.id
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Failed to process installation deletion', {
      account: account.login,
      installationId: installation.id,
      error: errorMessage,
      stack: errorStack
    });
    throw error;
  }
}
