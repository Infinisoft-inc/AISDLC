/**
 * AI Teammate assignment functions
 * Single responsibility: Assign and query AI teammates on project items
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';
import { findAITeammateField } from './createProjectField.js';

export type AITeammate = 'Sarah - AI Business Analyst' | 'Alex - AI Architect' | 'Jordan - AI Project Manager' | 'Unassigned';

export interface ProjectItemAssignment {
  itemId: string;
  issueNumber: number;
  title: string;
  url: string;
  aiTeammate?: AITeammate;
}

export interface AssignmentResult {
  itemId: string;
  fieldId: string;
  optionId: string;
  aiTeammate: AITeammate;
}

/**
 * Assign AI teammate to a project item
 */
export async function assignAITeammate(
  octokit: Octokit,
  projectId: string,
  itemId: string,
  aiTeammate: AITeammate
): Promise<Result<AssignmentResult>> {
  try {
    console.log(`👥 Assigning ${aiTeammate} to project item: ${itemId}`);

    // Find AI Teammate field
    const fieldResult = await findAITeammateField(octokit, projectId);
    if (!fieldResult.success || !fieldResult.data) {
      return {
        success: false,
        error: 'AI Teammate field not found in project'
      };
    }

    const field = fieldResult.data;
    
    // Find the option ID for the AI teammate
    const option = field.options?.find(opt => opt.name === aiTeammate);
    if (!option) {
      return {
        success: false,
        error: `AI Teammate option '${aiTeammate}' not found`
      };
    }

    // Update the project item field
    const mutation = `
      mutation {
        updateProjectV2ItemFieldValue(input: {
          projectId: "${projectId}"
          itemId: "${itemId}"
          fieldId: "${field.id}"
          value: {
            singleSelectOptionId: "${option.id}"
          }
        }) {
          projectV2Item {
            id
          }
        }
      }
    `;

    await octokit.graphql(mutation);

    console.log(`✅ Assigned ${aiTeammate} to project item`);

    return {
      success: true,
      data: {
        itemId,
        fieldId: field.id,
        optionId: option.id,
        aiTeammate
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to assign AI teammate:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all project items assigned to a specific AI teammate
 */
export async function getAIAssignments(
  octokit: Octokit,
  projectId: string,
  aiTeammate: AITeammate
): Promise<Result<ProjectItemAssignment[]>> {
  try {
    console.log(`🔍 Getting assignments for ${aiTeammate} in project: ${projectId}`);

    // Find AI Teammate field
    const fieldResult = await findAITeammateField(octokit, projectId);
    if (!fieldResult.success || !fieldResult.data) {
      return {
        success: false,
        error: 'AI Teammate field not found in project'
      };
    }

    const field = fieldResult.data;
    const option = field.options?.find(opt => opt.name === aiTeammate);
    if (!option) {
      return {
        success: false,
        error: `AI Teammate option '${aiTeammate}' not found`
      };
    }

    // Query project items
    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    number
                    title
                    url
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      optionId
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(query);
    const items = (response as any).node.items.nodes;

    // Filter items assigned to the specific AI teammate
    const assignments: ProjectItemAssignment[] = [];
    
    for (const item of items) {
      if (!item.content) continue; // Skip non-issue items
      
      // Check if this item is assigned to the AI teammate
      const aiTeammateValue = item.fieldValues.nodes.find((fieldValue: any) => 
        fieldValue.field?.id === field.id && fieldValue.optionId === option.id
      );

      if (aiTeammateValue) {
        assignments.push({
          itemId: item.id,
          issueNumber: item.content.number,
          title: item.content.title,
          url: item.content.url,
          aiTeammate
        });
      }
    }

    console.log(`✅ Found ${assignments.length} assignments for ${aiTeammate}`);

    return {
      success: true,
      data: assignments
    };
  } catch (error: any) {
    console.error('❌ Failed to get AI assignments:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all project items with their AI teammate assignments
 */
export async function getAllAIAssignments(
  octokit: Octokit,
  projectId: string
): Promise<Result<ProjectItemAssignment[]>> {
  try {
    console.log(`📋 Getting all AI assignments in project: ${projectId}`);

    // Find AI Teammate field
    const fieldResult = await findAITeammateField(octokit, projectId);
    if (!fieldResult.success || !fieldResult.data) {
      return {
        success: false,
        error: 'AI Teammate field not found in project'
      };
    }

    const field = fieldResult.data;

    // Query project items
    const query = `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    number
                    title
                    url
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      optionId
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(query);
    const items = (response as any).node.items.nodes;

    // Map items with their AI teammate assignments
    const assignments: ProjectItemAssignment[] = [];
    
    for (const item of items) {
      if (!item.content) continue; // Skip non-issue items
      
      // Find AI teammate assignment
      const aiTeammateValue = item.fieldValues.nodes.find((fieldValue: any) => 
        fieldValue.field?.id === field.id
      );

      let aiTeammate: AITeammate | undefined;
      if (aiTeammateValue) {
        const option = field.options?.find(opt => opt.id === aiTeammateValue.optionId);
        aiTeammate = option?.name as AITeammate;
      }

      assignments.push({
        itemId: item.id,
        issueNumber: item.content.number,
        title: item.content.title,
        url: item.content.url,
        aiTeammate
      });
    }

    console.log(`✅ Found ${assignments.length} total items with assignments`);

    return {
      success: true,
      data: assignments
    };
  } catch (error: any) {
    console.error('❌ Failed to get all AI assignments:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
