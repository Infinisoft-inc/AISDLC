/**
 * Get GitHub branch information
 * Single responsibility: Retrieve branch details
 */

import type { Octokit } from '@octokit/rest';
import type { BranchResponse, Result } from '../types';

export async function getBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string
): Promise<Result<BranchResponse>> {
  try {
    const response = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: branchName,
    });

    return {
      success: true,
      data: {
        name: response.data.name,
        sha: response.data.commit.sha,
        url: response.data._links.html,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
