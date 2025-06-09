/**
 * Create GitHub branch
 * Single responsibility: Create a new branch from a commit SHA
 */

import type { Octokit } from '@octokit/rest';
import type { BranchData, BranchResponse, Result } from '../types';

export async function createBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  branchData: BranchData
): Promise<Result<BranchResponse>> {
  try {
    const response = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchData.name}`,
      sha: branchData.sha,
    });

    return {
      success: true,
      data: {
        name: branchData.name,
        sha: response.data.object.sha,
        url: response.data.url,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
