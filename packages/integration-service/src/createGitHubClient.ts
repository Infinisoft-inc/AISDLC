/**
 * Create GitHub client
 * Single responsibility: GitHub client creation with App authentication
 */

import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import type { GitHubCredentials, IntegrationResult } from './types';

/**
 * Create GitHub App JWT token
 */
function createAppJWT(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iat: now - 60, // Issued 60 seconds in the past to allow for clock drift
    exp: now + 300, // Expires in 5 minutes (GitHub's maximum)
    iss: appId
  };

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Create GitHub client with App authentication
 */
export function createGitHubClient(credentials: GitHubCredentials): Octokit {
  const appJWT = createAppJWT(credentials.appId, credentials.privateKey);
  
  return new Octokit({
    auth: appJWT,
    userAgent: 'AI-SDLC-Integration-Service/1.0.0'
  });
}

/**
 * Create GitHub client with installation token
 */
export async function createGitHubInstallationClient(
  credentials: GitHubCredentials,
  installationId: number
): Promise<IntegrationResult<Octokit>> {
  try {
    const appClient = createGitHubClient(credentials);
    
    // Get installation access token
    const { data: installation } = await appClient.rest.apps.createInstallationAccessToken({
      installation_id: installationId
    });

    const installationClient = new Octokit({
      auth: installation.token,
      userAgent: 'AI-SDLC-Integration-Service/1.0.0'
    });

    return {
      success: true,
      data: installationClient
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create GitHub installation client: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
