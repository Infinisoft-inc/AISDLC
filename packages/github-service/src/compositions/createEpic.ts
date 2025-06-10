/**
 * Create Epic composition
 * Composes: createIssue + setIssueType + createLinkedBranch
 * Preserves all Epic customizations
 */

import type { Octokit } from '@octokit/rest';
import { createIssue } from '../github/issues/createIssue.js';

import { setIssueTypeByName } from '../github/issues/setIssueType.js';
import { ensureIssueTypes } from '../github/issues/createIssueType.js';
import { createLinkedBranch } from '../github/branches/createLinkedBranch.js';
import { generateBranchName } from '../github/utils/generateBranchName.js';
import type { GitHubIssueData, Result } from '../github/types';

export interface EpicData extends GitHubIssueData {
  // Epic-specific fields can be added here
}

export interface EpicResponse {
  id: number;
  number: number;
  node_id: string;
  title: string;
  html_url: string;
  state: string;
  linkedBranch?: {
    branchName: string;
    branchId: string;
    commitOid: string;
    issueNumber: number;
  };
}

export async function createEpic(
  octokit: Octokit,
  owner: string,
  repo: string,
  epicData: EpicData
): Promise<Result<EpicResponse>> {
  try {
    console.log(`📋 Creating EPIC: ${epicData.title}`);

    // 0. Ensure issue types exist for the organization
    console.log(`🔧 Ensuring issue types exist for organization: ${owner}`);
    const issueTypesResult = await ensureIssueTypes(octokit, owner);
    if (!issueTypesResult.success) {
      console.log(`⚠️ Could not ensure issue types: ${issueTypesResult.error}`);
    } else {
      console.log(`✅ Issue types ready: ${Object.keys(issueTypesResult.data!).join(', ')}`);
    }

    // Ensure EPIC has proper labels
    const labels = [...(epicData.labels || [])];
    if (!labels.includes('epic')) {
      labels.push('epic');
    }

    // 1. Create the issue
    const issueResult = await createIssue(octokit, owner, repo, {
      ...epicData,
      labels,
    });

    if (!issueResult.success || !issueResult.data) {
      return issueResult;
    }

    const issue = issueResult.data;

    // 2. Set issue type to Epic (using real issue types from repository)
    const typeResult = await setIssueTypeByName(octokit, owner, repo, issue.number, 'Epic');
    if (typeResult.success) {
      console.log(`✅ EPIC issue type set: Epic`);
    } else {
      // This is not an error - issue types might not be configured
      console.log(`ℹ️ Issue type 'Epic' not available for ${owner}/${repo}`);
    }

    // 3. Create linked branch for the epic
    const branchName = generateBranchName('epic', { title: issue.title });
    const branchResult = await createLinkedBranch(octokit, owner, repo, issue.number, branchName);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data?.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ EPIC created: ${issue.html_url}`);

    return {
      success: true,
      data: {
        id: issue.id,
        number: issue.number,
        node_id: issue.node_id,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create EPIC:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
