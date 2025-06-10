/**
 * Create GitHub issue type for organization
 * Single responsibility: Create a new issue type at the organization level
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface IssueTypeData {
  name: string;
  description?: string;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple' | null;
  is_enabled?: boolean;
}

export interface IssueTypeResponse {
  id: number;
  node_id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create issue type for organization
 */
export async function createIssueType(
  octokit: Octokit,
  org: string,
  issueTypeData: IssueTypeData
): Promise<Result<IssueTypeResponse>> {
  try {
    const response = await octokit.request('POST /orgs/{org}/issue-types', {
      org,
      name: issueTypeData.name,
      description: issueTypeData.description || null,
      color: issueTypeData.color || null,
      is_enabled: issueTypeData.is_enabled ?? true,
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      data: response.data as IssueTypeResponse
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all issue types for organization
 */
export async function getOrganizationIssueTypes(
  octokit: Octokit,
  org: string
): Promise<Result<IssueTypeResponse[]>> {
  try {
    const response = await octokit.request('GET /orgs/{org}/issue-types', {
      org,
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      data: response.data as IssueTypeResponse[]
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ensure issue types exist for organization
 */
export async function ensureIssueTypes(
  octokit: Octokit,
  org: string
): Promise<Result<Record<string, string>>> {
  try {
    // First, try to get existing issue types
    const existingResult = await getOrganizationIssueTypes(octokit, org);
    
    const issueTypeMap: Record<string, string> = {};
    
    if (existingResult.success) {
      // Map existing issue types
      existingResult.data!.forEach(type => {
        issueTypeMap[type.name] = type.node_id;
      });
    }

    // Define required issue types
    const requiredTypes: IssueTypeData[] = [
      {
        name: 'Epic',
        description: 'Large feature or initiative spanning multiple features',
        color: 'purple',
        is_enabled: true
      },
      {
        name: 'Feature',
        description: 'New feature or enhancement',
        color: 'green',
        is_enabled: true
      },
      {
        name: 'Task',
        description: 'Specific task or work item',
        color: 'blue',
        is_enabled: true
      },
      {
        name: 'Bug',
        description: 'Bug or issue to fix',
        color: 'red',
        is_enabled: true
      },
      {
        name: 'Enhancement',
        description: 'Improvement to existing functionality',
        color: 'yellow',
        is_enabled: true
      }
    ];

    // Create missing issue types
    for (const typeData of requiredTypes) {
      if (!issueTypeMap[typeData.name]) {
        const createResult = await createIssueType(octokit, org, typeData);
        if (createResult.success) {
          issueTypeMap[typeData.name] = createResult.data!.node_id;
          console.log(`✅ Created issue type: ${typeData.name}`);
        } else {
          console.log(`⚠️ Could not create issue type ${typeData.name}: ${createResult.error}`);
        }
      }
    }

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
