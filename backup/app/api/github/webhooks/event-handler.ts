/**
 * Clean GitHub Event Handler
 * Handles webhook events close to the route - no scattered code
 */
import { handleInstallationCreated } from './handlers/installation-created';
import { handleInstallationDeleted } from './handlers/installation-deleted';

/**
 * Main event handler that routes GitHub webhook events to specific handlers
 */
export async function handleGitHubEvent(
  event: string,
  payload: any,
  deliveryId?: string | null
): Promise<void> {
  console.log(`🔄 Processing ${event} event (${deliveryId})`);

  try {
    switch (event) {
      case 'ping':
        console.log('🏓 Ping event received:', payload.zen);
        if (payload.installation) {
          console.log(`🔧 Installation ID: ${payload.installation.id}`);
        }
        break;
      
      case 'installation':
        await handleInstallationEvent(payload);
        break;
      
      case 'push':
      case 'pull_request':
      case 'issues':
      case 'issue_comment':
      case 'pull_request_review':
      case 'repository':
      case 'release':
        console.log(`📋 ${event} event received - TODO: implement handler`);
        break;
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event}`);
    }
  } catch (error) {
    console.error(`❌ Error handling ${event} event:`, error);
    throw error;
  }
}

/**
 * Handle installation events using our clean handlers
 */
async function handleInstallationEvent(payload: any): Promise<void> {
  const { action, installation, sender } = payload;

  const senderLogin = sender?.login || 'unknown';
  console.log(`🔧 Installation ${action} by ${senderLogin} for ${installation.account.login}`);
  
  switch (action) {
    case 'created':
      await handleInstallationCreated({ payload });
      console.log(`✅ Installation processed: ${installation.account.login}`);
      break;
    
    case 'deleted':
      await handleInstallationDeleted({ payload });
      console.log(`🗑️ Installation processed: ${installation.account.login}`);
      break;
    
    case 'suspend':
      console.log(`⏸️ Installation suspended: ${installation.account.login}`);
      break;
    
    case 'unsuspend':
      console.log(`▶️ Installation unsuspended: ${installation.account.login}`);
      break;
    
    case 'new_permissions_accepted':
      console.log(`🔄 New permissions accepted: ${installation.account.login}`);
      break;
  }
}
