// Ngrok tunnel management for local development
import ngrok from 'ngrok';

export async function startTunnel(port: number = 3000): Promise<string> {
  try {
    console.log(`🚇 Starting ngrok tunnel for port ${port}...`);
    
    const url = await ngrok.connect({
      port,
      authtoken: process.env.NGROK_AUTH_TOKEN, // Optional: set if you have ngrok account
    });
    
    console.log(`✅ Tunnel started: ${url}`);
    console.log(`📡 Webhook URL: ${url}/webhook/github`);
    console.log('');
    console.log('🔧 Update your GitHub App webhook URL to:');
    console.log(`   ${url}/webhook/github`);
    console.log('');
    
    return url;
  } catch (error) {
    console.error('❌ Failed to start tunnel:', error);
    throw error;
  }
}

export async function stopTunnel(): Promise<void> {
  try {
    await ngrok.disconnect();
    console.log('🛑 Tunnel stopped');
  } catch (error) {
    console.error('❌ Failed to stop tunnel:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, stopping tunnel...');
  await stopTunnel();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, stopping tunnel...');
  await stopTunnel();
  process.exit(0);
});
