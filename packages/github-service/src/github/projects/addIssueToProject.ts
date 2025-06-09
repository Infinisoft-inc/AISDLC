/**
 * Add issue to GitHub Project v2
 * Single responsibility: Add an issue to a project
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export async function addIssueToProject(
  octokit: Octokit,
  projectId: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<{ itemId: string }>> {
  try {
    // First get the issue to get its node_id
    const issueResponse = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const issueNodeId = issueResponse.data.node_id;

    // Add item to project
    const addItemMutation = `
      mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    const addResponse = await octokit.graphql(addItemMutation, {
      projectId,
      contentId: issueNodeId,
    });

    const itemId = (addResponse as any).addProjectV2ItemById.item.id;

    return {
      success: true,
      data: { itemId }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
