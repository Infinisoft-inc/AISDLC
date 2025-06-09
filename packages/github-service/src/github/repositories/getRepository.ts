/**
 * Get GitHub repository information
 * Single responsibility: Retrieve repository details
 */

import type { Octokit } from '@octokit/rest';
import type { GitHubRepositoryResponse, Result } from '../types';

export async function getRepository(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Result<GitHubRepositoryResponse>> {
  try {
    const response = await octokit.rest.repos.get({
      owner,
      repo,
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
