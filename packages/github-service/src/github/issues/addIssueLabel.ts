/**
 * Add label to GitHub issue
 * Single responsibility: Add a single label to an issue
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export async function addIssueLabel(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string
): Promise<Result<void>> {
  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [label],
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
