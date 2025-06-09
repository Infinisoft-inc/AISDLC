/**
 * Create GitHub Project v2
 * Single responsibility: Create a new GitHub Project v2 via GraphQL API
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface ProjectData {
  title: string;
  body?: string;
  public?: boolean;
}

export interface ProjectResult {
  id: string;
  number: number;
  title: string;
  url: string;
}

export async function createProjectV2(
  octokit: Octokit,
  owner: string,
  projectData: ProjectData
): Promise<Result<ProjectResult>> {
  try {
    // First get the organization/user ID
    const ownerQuery = `
      query GetOwner($login: String!) {
        repositoryOwner(login: $login) {
          id
          __typename
        }
      }
    `;

    const ownerResponse = await octokit.graphql({
      query: ownerQuery,
      login: owner
    });

    const ownerId = (ownerResponse as any).repositoryOwner.id;

    // Create the project
    const mutation = `
      mutation CreateProjectV2($ownerId: ID!, $title: String!) {
        createProjectV2(input: {
          ownerId: $ownerId
          title: $title
        }) {
          projectV2 {
            id
            number
            title
            url
          }
        }
      }
    `;

    const response = await octokit.graphql({
      query: mutation,
      ownerId,
      title: projectData.title
    });

    const project = (response as any).createProjectV2.projectV2;

    return {
      success: true,
      data: {
        id: project.id,
        number: project.number,
        title: project.title,
        url: project.url
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
