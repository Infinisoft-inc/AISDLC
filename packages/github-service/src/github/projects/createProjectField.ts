/**
 * Create custom field in GitHub Project V2
 * Single responsibility: Create project fields with options
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface ProjectFieldOption {
  name: string;
  color?: 'GRAY' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'PINK' | 'PURPLE';
  description?: string;
}

export interface ProjectFieldData {
  projectId: string;
  name: string;
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION';
  options?: ProjectFieldOption[];
}

export interface ProjectFieldResponse {
  id: string;
  name: string;
  dataType: string;
  options?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

/**
 * Create AI Teammate field with predefined options
 */
export async function createAITeammateField(
  octokit: Octokit,
  projectId: string
): Promise<Result<ProjectFieldResponse>> {
  try {
    console.log(`🔧 Creating AI Teammate field with options...`);

    // Create the field with single select options in one step
    const mutation = `
      mutation {
        createProjectV2Field(input: {
          projectId: "${projectId}"
          dataType: SINGLE_SELECT
          name: "AI Teammate"
          singleSelectOptions: [
            {name: "Sarah - AI Business Analyst", color: BLUE, description: "AI Business Analyst"}
            {name: "Alex - AI Architect", color: GREEN, description: "AI Architect"}
            {name: "Jordan - AI Project Manager", color: PURPLE, description: "AI Project Manager"}
            {name: "Unassigned", color: GRAY, description: "Not yet assigned"}
          ]
        }) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                color
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(mutation);
    const field = (response as any).createProjectV2Field.projectV2Field;

    console.log(`✅ AI Teammate field created with options: ${field.name} (${field.id})`);

    return {
      success: true,
      data: {
        id: field.id,
        name: field.name,
        dataType: field.dataType,
        options: field.options || []
      }
    };

  } catch (error: any) {
    console.error('❌ Failed to create AI Teammate field:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create custom field in GitHub Project V2
 */
export async function createProjectField(
  octokit: Octokit,
  fieldData: ProjectFieldData
): Promise<Result<ProjectFieldResponse>> {
  try {
    console.log(`🔧 Creating project field: ${fieldData.name}`);

    // Create field without options (options must be added separately for single select fields)
    const mutation = `
      mutation {
        createProjectV2Field(input: {
          projectId: "${fieldData.projectId}"
          dataType: ${fieldData.dataType}
          name: "${fieldData.name}"
        }) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                color
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(mutation);
    const field = (response as any).createProjectV2Field.projectV2Field;

    console.log(`✅ Project field created: ${field.name} (${field.id})`);

    return {
      success: true,
      data: {
        id: field.id,
        name: field.name,
        dataType: field.dataType,
        options: field.options || []
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create project field:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all fields for a project
 */
export async function getProjectFields(
  octokit: Octokit,
  projectId: string
): Promise<Result<ProjectFieldResponse[]>> {
  try {
    console.log(`📋 Getting project fields for: ${projectId}`);

    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(query);
    const fields = (response as any).node.fields.nodes;

    console.log(`✅ Found ${fields.length} project fields`);

    return {
      success: true,
      data: fields.map((field: any) => ({
        id: field.id,
        name: field.name,
        dataType: field.dataType,
        options: field.options || []
      }))
    };
  } catch (error: any) {
    console.error('❌ Failed to get project fields:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Find AI Teammate field in project
 */
export async function findAITeammateField(
  octokit: Octokit,
  projectId: string
): Promise<Result<ProjectFieldResponse | null>> {
  try {
    const fieldsResult = await getProjectFields(octokit, projectId);
    if (!fieldsResult.success || !fieldsResult.data) {
      return {
        success: false,
        error: fieldsResult.error || 'Failed to get project fields'
      };
    }

    const aiTeammateField = fieldsResult.data.find(field => field.name === 'AI Teammate');
    
    return {
      success: true,
      data: aiTeammateField || null
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
