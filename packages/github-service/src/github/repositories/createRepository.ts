/**
 * Create GitHub repository
 * Single responsibility: Create a new repository
 */

import type { Octokit } from '@octokit/rest';
import type { GitHubRepositoryData, GitHubRepositoryResponse, Result } from '../types';

export async function createRepository(
  octokit: Octokit,
  repositoryData: GitHubRepositoryData
): Promise<Result<GitHubRepositoryResponse>> {
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: repositoryData.name,
      description: repositoryData.description || '',
      private: repositoryData.private || false,
      auto_init: repositoryData.auto_init || true,
      license_template: repositoryData.license_template || 'mit',
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
        clone_url: response.data.clone_url,
        ssh_url: response.data.ssh_url,
        private: response.data.private,
        default_branch: response.data.default_branch,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
