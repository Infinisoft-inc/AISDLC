// GitHub App authentication functions
import jwt from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import type { GitHubAppConfig, InstallationData } from './types.js';
import { getInstallation, saveInstallation } from './storage.js';

// Load GitHub App config from environment with validation
export function getGitHubAppConfig(): GitHubAppConfig {
  const requiredEnvVars = {
    appId: process.env.GITHUB_APP_ID,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  };

  // Validate all required environment variables are present
  const missingVars: string[] = [];

  if (!requiredEnvVars.appId) missingVars.push('GITHUB_APP_ID');
  if (!requiredEnvVars.clientId) missingVars.push('GITHUB_CLIENT_ID');
  if (!requiredEnvVars.clientSecret) missingVars.push('GITHUB_CLIENT_SECRET');
  if (!requiredEnvVars.privateKey) missingVars.push('GITHUB_PRIVATE_KEY');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure all GitHub App credentials are set in your .env file or environment.'
    );
  }

  return {
    appId: requiredEnvVars.appId!,
    clientId: requiredEnvVars.clientId!,
    clientSecret: requiredEnvVars.clientSecret!,
    privateKey: requiredEnvVars.privateKey!,
  };
}

// Generate JWT token for GitHub App authentication
export function generateJWT(): string {
  const config = getGitHubAppConfig();
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now - 60, // Issued 60 seconds ago
    exp: now + (5 * 60), // Expires in 5 minutes (more conservative)
    iss: config.appId
  };

  return jwt.sign(payload, config.privateKey, { algorithm: 'RS256' });
}

// Get installation access token
export async function getInstallationToken(installationId?: number): Promise<string> {
  const installation = await getInstallation(installationId);
  
  if (!installation) {
    throw new Error('No installation found. Please install the GitHub App first.');
  }
  
  // Check if token is still valid (with 5 minute buffer)
  if (installation.accessToken && installation.expiresAt) {
    const expiresAt = new Date(installation.expiresAt);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (expiresAt.getTime() - now.getTime() > bufferTime) {
      console.log('🔑 Using cached installation token');
      return installation.accessToken;
    }
  }
  
  // Generate new token
  console.log('🔄 Refreshing installation token...');
  const jwtToken = generateJWT();
  
  const octokit = new Octokit({
    auth: jwtToken,
  });
  
  try {
    const response = await octokit.rest.apps.createInstallationAccessToken({
      installation_id: installation.installationId,
    });
    
    // Update installation with new token
    const updatedInstallation: InstallationData = {
      ...installation,
      accessToken: response.data.token,
      expiresAt: response.data.expires_at,
    };
    
    await saveInstallation(updatedInstallation);
    
    console.log('✅ Installation token refreshed');
    return response.data.token;
  } catch (error) {
    console.error('❌ Failed to get installation token:', error);
    throw error;
  }
}

// Create authenticated Octokit instance
export async function createAuthenticatedOctokit(installationId?: number): Promise<Octokit> {
  const token = await getInstallationToken(installationId);
  
  return new Octokit({
    auth: token,
  });
}
