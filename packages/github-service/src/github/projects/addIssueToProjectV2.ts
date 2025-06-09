/**
 * Add issue to GitHub Project v2
 * Single responsibility: Add an issue to a GitHub Project v2 via GraphQL API
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface ProjectItemResult {
  id: string;
  projectId: string;
  issueId: string;
}

export async function addIssueToProjectV2(
  octokit: Octokit,
  projectId: string,
  issueNodeId: string
): Promise<Result<ProjectItemResult>> {
  try {
    const mutation = `
      mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
            project {
              id
            }
            content {
              ... on Issue {
                id
                number
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql({
      query: mutation,
      projectId,
      contentId: issueNodeId
    });

    const item = (response as any).addProjectV2ItemById.item;

    return {
      success: true,
      data: {
        id: item.id,
        projectId: item.project.id,
        issueId: item.content.id
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
