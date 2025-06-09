/**
 * Get GitHub issue
 * Single responsibility: Retrieve issue information
 */

import type { Octokit } from '@octokit/rest';
import type { GitHubIssueResponse, Result } from '../types';

export async function getIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<GitHubIssueResponse>> {
  try {
    const response = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        html_url: response.data.html_url,
        state: response.data.state,
        node_id: response.data.node_id,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
