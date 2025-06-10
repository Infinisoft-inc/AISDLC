/**
 * Storage Configuration with Strongly Typed Options
 * Uses discriminative unions for type safety and integration service
 */

import { StorageService, MockStorage, FileStorage, GitHubStorage } from '../services/storage/index.js';

/**
 * Strongly typed storage options using discriminative unions
 */
export type StorageOptions =
  | { type: 'mock' }
  | { type: 'file'; basePath: string }
  | {
    type: 'github';
    token: string;
    owner: string;
    repo: string;
    branch?: string
  };

/**
 * Doppler configuration structure (single secret pattern)
 */
export interface DopplerConfig {
  storage?: {
    type: 'mock' | 'file' | 'github';
    basePath?: string;
  };
  github?: {
    token: string;
    owner?: string;
    repo: string;
    branch?: string;
  };
}

export class StorageConfig {
  /**
   * Create storage with strongly typed options
   */
  static createStorage(options: StorageOptions): StorageService {
    switch (options.type) {
      case 'mock':
        return new MockStorage();

      case 'file':
        return new FileStorage(options.basePath);

      case 'github':
        return new GitHubStorage(
          options.token,
          options.owner,
          options.repo,
          options.branch || 'main'
        );

      default:
        // TypeScript ensures this is never reached
        const _exhaustive: never = options;
        throw new Error(`Unknown storage type: ${JSON.stringify(_exhaustive)}`);
    }
  }

  /**
   * Create storage from Doppler configuration (single secret pattern)
   */
  static createFromDoppler(): StorageService {
    const dopplerConfig = this.parseDopplerConfig();

    const storageType = dopplerConfig.storage?.type || 'mock';

    switch (storageType) {
      case 'mock':
        return this.createStorage({ type: 'mock' });

      case 'file':
        const basePath = dopplerConfig.storage?.basePath || './output';
        return this.createStorage({ type: 'file', basePath });

      case 'github':
        const github = dopplerConfig.github;
        if (!github?.token || !github?.repo) {
          throw new Error('Doppler config missing required github.token or github.repo');
        }

        return this.createStorage({
          type: 'github',
          token: github.token,
          owner: github.owner || 'Infinisoft-inc',
          repo: github.repo,
          branch: github.branch || 'main'
        });

      default:
        throw new Error(`Unknown storage type in Doppler config: ${storageType}`);
    }
  }

  /**
   * Create storage with Doppler integration service and clear user feedback
   */
  static async createWithDopplerIntegration(): Promise<{ storage: StorageService; message: string; success: boolean }> {
    const dopplerToken = process.env.DOPPLER_TOKEN;

    if (!dopplerToken) {
      return {
        storage: new MockStorage(),
        message: '⚠️ No DOPPLER_TOKEN found. Documents will be saved to mock storage only. Set DOPPLER_TOKEN environment variable for GitHub integration.',
        success: false
      };
    }

    try {
      // Use dynamic import to avoid Jest issues
      const { getGitHubCredentials } = await import('@brainstack/integration-service');
      const githubResult = await getGitHubCredentials({ token: dopplerToken });

      if (githubResult.success && githubResult.data) {
        // Use the simple createGitHubSetup approach
        const { createGitHubSetup } = await import('@brainstack/integration-service');
        const githubSetupResult = await createGitHubSetup(dopplerToken, 'Infinisoft-inc');

        if (githubSetupResult.success && githubSetupResult.data) {
          // Use the authenticated Octokit client directly
          return {
            storage: new GitHubStorage(
              githubSetupResult.data, // Pass the authenticated Octokit client
              'Infinisoft-inc',
              'github-test',
              'main'
            ),
            message: '✅ GitHub storage configured via Doppler setup. Documents will be saved to Infinisoft-inc/github-test repository.',
            success: true
          };
        } else {
          return {
            storage: new MockStorage(),
            message: `❌ Failed to setup GitHub client: ${githubSetupResult.error}. Documents will be saved to mock storage only.`,
            success: false
          };
        }
      } else {
        return {
          storage: new MockStorage(),
          message: `❌ Failed to get GitHub credentials from Doppler: ${githubResult.error}. Documents will be saved to mock storage only.`,
          success: false
        };
      }
    } catch (error) {
      return {
        storage: new MockStorage(),
        message: `❌ Doppler integration service error: ${error instanceof Error ? error.message : String(error)}. Documents will be saved to mock storage only.`,
        success: false
      };
    }
  }

  /**
   * Create storage with environment-based GitHub configuration
   */
  static createWithEnvironment(): { storage: StorageService; message: string; success: boolean } {
    // Check for GitHub environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER || 'Infinisoft-inc';
    const githubRepo = process.env.GITHUB_REPO || 'github-test';
    const githubBranch = process.env.GITHUB_BRANCH || 'main';

    if (githubToken && githubRepo) {
      return {
        storage: new GitHubStorage(githubToken, githubOwner, githubRepo, githubBranch),
        message: `✅ GitHub storage configured via environment variables. Documents will be saved to ${githubOwner}/${githubRepo} repository.`,
        success: true
      };
    } else {
      return {
        storage: new MockStorage(),
        message: '⚠️ GitHub environment variables not found (GITHUB_TOKEN, GITHUB_REPO). Documents will be saved to mock storage only.',
        success: false
      };
    }
  }

  /**
   * Parse Doppler configuration from single environment variable
   */
  private static parseDopplerConfig(): DopplerConfig {
    const configString = process.env.DOPPLER_CONFIG;

    if (!configString) {
      // Default configuration for development
      return {
        storage: { type: 'mock' }
      };
    }

    try {
      return JSON.parse(configString);
    } catch (error) {
      throw new Error(`Invalid DOPPLER_CONFIG JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
