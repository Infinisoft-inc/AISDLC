/**
 * GitHub authentication functions
 * Single responsibility: Installation token management
 */
import { Octokit } from '@octokit/rest';
import { generateGitHubJWT } from './jwt.js';
import { createLogger, consoleIntegration, LogLevel } from '@brainstack/log';

const log = createLogger(LogLevel.VERBOSE, [consoleIntegration]);

/**
 * Get installation access token for a specific installation ID
 */
export async function getInstallationToken(installationId: number): Promise<string> {
  if (!installationId) {
    throw new Error('Installation ID is required');
  }

  log.verbose('Getting installation token', { installationId });

  // Generate JWT token for GitHub App authentication
  const jwtToken = await generateGitHubJWT();

  const octokit = new Octokit({
    auth: jwtToken,
  });

  try {
    const response = await octokit.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
    });

    log.info('Installation token retrieved successfully', { installationId });
    return response.data.token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('Failed to get installation token', {
      installationId,
      error: errorMessage
    });
    throw error;
  }
}
