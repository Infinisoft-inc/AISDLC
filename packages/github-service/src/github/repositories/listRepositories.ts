/**
 * List accessible repositories
 * Single responsibility: List repositories accessible to the installation
 */

import type { Octokit } from '@octokit/rest';
import type { GitHubRepositoryResponse, Result } from '../types';

export async function listRepositories(
  octokit: Octokit
): Promise<Result<GitHubRepositoryResponse[]>> {
  try {
    const response = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });

    const repos = response.data.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      private: repo.private,
      default_branch: repo.default_branch,
    }));

    return {
      success: true,
      data: repos
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
