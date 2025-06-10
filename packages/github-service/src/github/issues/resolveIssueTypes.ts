/**
 * Resolve real issue types from repository using labels
 * Single responsibility: Get actual issue type labels from GitHub repository
 */

import type { Octokit } from '@octokit/rest';
import type { Result } from '../types';

export interface IssueTypeMap {
  [typeName: string]: string;
}

export interface ResolvedIssueTypes {
  Epic?: string;
  Feature?: string;
  Task?: string;
  Bug?: string;
  Enhancement?: string;
}

/**
 * Cache for issue types to avoid repeated API calls
 */
const issueTypeCache = new Map<string, ResolvedIssueTypes>();

/**
 * Get real issue types from repository labels
 */
export async function resolveIssueTypes(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Result<ResolvedIssueTypes>> {
  try {
    const cacheKey = `${owner}/${repo}`;

    // Return cached result if available
    if (issueTypeCache.has(cacheKey)) {
      return {
        success: true,
        data: issueTypeCache.get(cacheKey)!
      };
    }

    // Get repository labels to find issue type labels
    const labelsResponse = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100
    });

    const resolvedTypes: ResolvedIssueTypes = {};

    // Map labels to issue types
    labelsResponse.data.forEach(label => {
      const labelName = label.name.toLowerCase();
      if (labelName === 'epic') {
        resolvedTypes.Epic = label.name;
      } else if (labelName === 'feature') {
        resolvedTypes.Feature = label.name;
      } else if (labelName === 'task') {
        resolvedTypes.Task = label.name;
      } else if (labelName === 'bug') {
        resolvedTypes.Bug = label.name;
      } else if (labelName === 'enhancement') {
        resolvedTypes.Enhancement = label.name;
      }
    });

    // Cache the result
    issueTypeCache.set(cacheKey, resolvedTypes);

    console.log(`✅ Found issue type labels: ${Object.keys(resolvedTypes).join(', ')}`);

    return {
      success: true,
      data: resolvedTypes
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if issue types are available for repository
 */
export async function hasIssueTypes(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<boolean> {
  const result = await resolveIssueTypes(octokit, owner, repo);
  if (!result.success) return false;
  
  return Object.keys(result.data!).length > 0;
}

/**
 * Get specific issue type ID
 */
export async function getIssueTypeId(
  octokit: Octokit,
  owner: string,
  repo: string,
  typeName: keyof ResolvedIssueTypes
): Promise<string | undefined> {
  const result = await resolveIssueTypes(octokit, owner, repo);
  if (!result.success) return undefined;
  
  return result.data![typeName];
}

/**
 * Clear issue type cache (useful for testing)
 */
export function clearIssueTypeCache(): void {
  issueTypeCache.clear();
}
