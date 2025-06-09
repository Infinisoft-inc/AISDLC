/**
 * Create GitHub Project v2
 * Single responsibility: Create a new GitHub project
 */

import type { Octokit } from '@octokit/rest';
import type { ProjectData, ProjectResponse, Result } from '../types';

export async function createProject(
  octokit: Octokit,
  owner: string,
  projectData: ProjectData
): Promise<Result<ProjectResponse>> {
  try {
    // Create project using GraphQL API (Projects v2)
    const mutation = `
      mutation CreateProject($ownerId: ID!, $title: String!) {
        createProjectV2(input: {
          ownerId: $ownerId
          title: $title
        }) {
          projectV2 {
            id
            number
            title
            url
            shortDescription
          }
        }
      }
    `;

    // First get the organization ID
    const orgResponse = await octokit.rest.orgs.get({ org: owner });
    const ownerId = orgResponse.data.node_id;

    const response = await octokit.graphql(mutation, {
      ownerId,
      title: projectData.title,
    });

    const project = (response as any).createProjectV2.projectV2;

    return {
      success: true,
      data: {
        id: project.id,
        number: project.number,
        title: project.title,
        url: project.url,
        description: project.shortDescription,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
