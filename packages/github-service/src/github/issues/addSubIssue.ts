/**
 * Add sub-issue relationship
 * Single responsibility: Create parent-child relationship between issues
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export async function addSubIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  parentIssueNumber: number,
  childIssueNumber: number
): Promise<Result<void>> {
  try {
    // Get the child issue to get its internal ID
    const childIssue = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: childIssueNumber,
    });

    try {
      // Use the real GitHub sub-issue API
      await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues', {
        owner,
        repo,
        issue_number: parentIssueNumber,
        sub_issue_id: childIssue.data.id,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      return { success: true };
    } catch (apiError: any) {
      // If the real API fails, fall back to comment-based linking
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parentIssueNumber,
        body: `🔗 **Sub-issue:** #${childIssueNumber}`,
      });

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: childIssueNumber,
        body: `🔗 **Parent issue:** #${parentIssueNumber}`,
      });

      return { success: true };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
