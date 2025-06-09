/**
 * Create GitHub issue
 * Single responsibility: Create a basic GitHub issue
 */

import type { Octokit } from '@octokit/rest';
import type { GitHubIssueData, GitHubIssueResponse, Result } from '../types';

export async function createIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueData: GitHubIssueData
): Promise<Result<GitHubIssueResponse>> {
  try {
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: issueData.title,
      body: issueData.body || '',
      labels: issueData.labels || [],
      assignees: issueData.assignees || [],
      milestone: issueData.milestone,
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
