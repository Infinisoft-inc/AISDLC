// Simple webhook server for GitHub App events
import express from 'express';
import { config } from 'dotenv';
import { saveInstallation } from './storage.js';
import { startTunnel } from './tunnel.js';
import type { WebhookPayload, InstallationData } from './types.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'github-webhook-service',
    timestamp: new Date().toISOString()
  });
});

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
  try {
    const payload: WebhookPayload = req.body;
    const event = req.headers['x-github-event'] as string;
    
    console.log(`📨 Received GitHub webhook: ${event} - ${payload.action}`);
    
    // Handle installation events
    if (event === 'installation' && payload.installation) {
      await handleInstallationEvent(payload);
    }
    
    // Handle installation_repositories events
    if (event === 'installation_repositories' && payload.installation) {
      await handleInstallationRepositoriesEvent(payload);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle installation events (created, deleted, etc.)
async function handleInstallationEvent(payload: WebhookPayload): Promise<void> {
  const { action, installation } = payload;
  
  if (!installation) return;
  
  console.log(`🔧 Installation ${action}: ${installation.account.login}`);
  
  if (action === 'created') {
    // Save new installation
    const installationData: InstallationData = {
      installationId: installation.id,
      accountId: installation.account.id,
      accountLogin: installation.account.login,
      accountType: installation.account.type as 'User' | 'Organization',
      permissions: installation.permissions,
      createdAt: new Date().toISOString(),
    };
    
    await saveInstallation(installationData);
    console.log(`✅ Installation saved: ${installation.account.login}`);
  }
  
  if (action === 'deleted') {
    console.log(`🗑️ Installation deleted: ${installation.account.login}`);
    // Note: In a full implementation, we'd remove the installation from storage
  }
}

// Handle installation_repositories events (added, removed)
async function handleInstallationRepositoriesEvent(payload: WebhookPayload): Promise<void> {
  const { action, installation, repositories } = payload;
  
  if (!installation || !repositories) return;
  
  console.log(`📁 Repositories ${action} for ${installation.account.login}:`);
  repositories.forEach(repo => {
    console.log(`  - ${repo.full_name}`);
  });
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 GitHub webhook server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');

  // Auto-start tunnel in development
  if (process.env.NODE_ENV !== 'production' && process.env.AUTO_TUNNEL !== 'false') {
    try {
      await startTunnel(Number(PORT));
    } catch (error) {
      console.log('💡 Manual tunnel setup:');
      console.log(`   ngrok http ${PORT}`);
      console.log('   Then update your GitHub App webhook URL');
    }
  } else {
    console.log(`📡 Local webhook URL: http://localhost:${PORT}/webhook/github`);
    console.log('💡 To expose this locally, use:');
    console.log(`   npm run tunnel`);
    console.log('   Then update your GitHub App webhook URL');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
