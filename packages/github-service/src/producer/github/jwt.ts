/**
 * GitHub JWT token generation
 * Single responsibility: JWT creation only
 */
import jwt from 'jsonwebtoken';
import { getGitHubAppId, getGitHubPrivateKey } from '../../common/doppler/github-secrets.js';

/**
 * Generate JWT token for GitHub App authentication
 */
export async function generateGitHubJWT(): Promise<string> {
  const appId = await getGitHubAppId();
  const privateKey = await getGitHubPrivateKey();

  if (!appId || !privateKey) {
    throw new Error('Missing GitHub App credentials: GITHUB_APP_ID and GITHUB_PRIVATE_KEY required');
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now - 60, // Issued 60 seconds ago
    exp: now + (5 * 60), // Expires in 5 minutes
    iss: appId
  };

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}
