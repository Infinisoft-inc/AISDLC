/**
 * Get available GitHub issue types for a repository
 * Single responsibility: Retrieve issue types via GitHub's GraphQL API
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface IssueType {
  id: string;
  name: string;
  description?: string;
}

export async function getIssueTypes(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Result<Record<string, string>>> {
  try {
    const query = `
      query GetRepositoryIssueTypes($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          issueTypes(first: 10) {
            nodes {
              id
              name
              description
            }
          }
        }
      }
    `;

    const response = await octokit.graphql({
      query,
      owner,
      repo,
      headers: {
        'GraphQL-Features': 'issue_types'
      }
    });

    const issueTypes = (response as any).repository?.issueTypes?.nodes || [];
    
    // Convert to a map of name -> id for easy lookup
    const issueTypeMap: Record<string, string> = {};
    issueTypes.forEach((type: IssueType) => {
      issueTypeMap[type.name] = type.id;
    });

    return {
      success: true,
      data: issueTypeMap
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
