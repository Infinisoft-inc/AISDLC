/**
 * Octokit instance creation
 * Single responsibility: Authenticated GitHub client creation
 */
import { Octokit } from '@octokit/rest';
import { getInstallationToken } from './auth';
import { getInstallationIdByOrg } from '../../common/supabase/github-queries';
import { createLogger, consoleIntegration, LogLevel } from '@brainstack/log';

const log = createLogger(LogLevel.VERBOSE, [consoleIntegration]);

/**
 * Create authenticated Octokit instance for a specific installation ID
 */
export async function createOctokitForInstallation(installationId: number): Promise<Octokit> {
  const token = await getInstallationToken(installationId);

  return new Octokit({
    auth: token,
  });
}

/**
 * Create authenticated Octokit instance for a specific organization
 * This is the main function Jordan's tools should use
 */
export async function createOctokitForOrg(orgName: string): Promise<Octokit> {
  log.verbose('Creating Octokit for organization', { orgName });

  try {
    // 1. Get installation ID from Supabase
    const installationId = await getInstallationIdByOrg(orgName);
    
    // 2. Create authenticated Octokit instance
    const octokit = await createOctokitForInstallation(installationId);
    
    log.info('Octokit created successfully', { orgName, installationId });
    return octokit;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('Failed to create Octokit for organization', {
      orgName,
      error: errorMessage
    });
    throw new Error(`Failed to create GitHub client for ${orgName}: ${errorMessage}`);
  }
}
