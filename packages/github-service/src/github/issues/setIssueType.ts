/**
 * Set GitHub issue type using GraphQL
 * Single responsibility: Set issue type via GitHub's GraphQL API
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';
import { ensureIssueTypes } from './createIssueType.js';

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

/**
 * Set issue type by name (ensures issue types exist and uses real IDs)
 */
export async function setIssueTypeByName(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  typeName: string
): Promise<Result<void>> {
  try {
    // Extract organization from owner
    const org = owner;

    // Ensure issue types exist for the organization
    const typesResult = await ensureIssueTypes(octokit, org);
    if (!typesResult.success) {
      return {
        success: false,
        error: `Failed to ensure issue types: ${typesResult.error}`
      };
    }

    const issueTypeId = typesResult.data![typeName];
    if (!issueTypeId) {
      console.log(`⚠️ Issue type '${typeName}' not found in organization ${org}`);
      return { success: true }; // Graceful degradation
    }

    // Get the issue node ID
    const issueResponse = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const issueNodeId = issueResponse.data.node_id;

    // Set the issue type using the real ID
    const result = await setIssueType(octokit, issueNodeId, issueTypeId);

    if (result.success) {
      console.log(`✅ Set issue type '${typeName}' for issue #${issueNumber}`);
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
