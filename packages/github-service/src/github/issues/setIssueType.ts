/**
 * Set GitHub issue type using GraphQL
 * Single responsibility: Set issue type via GitHub's GraphQL API
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export async function setIssueType(
  octokit: Octokit,
  issueNodeId: string,
  issueTypeId: string
): Promise<Result<void>> {
  try {
    const mutation = `
      mutation UpdateIssue($issueId: ID!, $issueTypeId: ID!) {
        updateIssue(input: {
          id: $issueId
          issueTypeId: $issueTypeId
        }) {
          issue {
            id
            number
            issueType {
              name
            }
          }
        }
      }
    `;

    await octokit.graphql({
      query: mutation,
      issueId: issueNodeId,
      issueTypeId: issueTypeId,
      headers: {
        'GraphQL-Features': 'issue_types'
      }
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
