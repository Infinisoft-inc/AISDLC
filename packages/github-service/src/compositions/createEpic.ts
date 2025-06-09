/**
 * Create Epic composition
 * Composes: createIssue + setIssueType + createLinkedBranch
 * Preserves all Epic customizations
 */

import type { Octokit } from '@octokit/rest';
import { createIssue } from '../github/issues/createIssue';
import { addIssueLabel } from '../github/issues/addIssueLabel';
import { setIssueType } from '../github/issues/setIssueType';
import { createLinkedBranch } from '../github/branches/createLinkedBranch';
import { generateBranchName } from '../github/utils/generateBranchName';
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
  epicData: EpicData,
  issueTypes?: { Epic?: string }
): Promise<Result<EpicResponse>> {
  try {
    console.log(`📋 Creating EPIC: ${epicData.title}`);

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

    // 2. Set issue type to Epic if available
    if (issueTypes?.Epic) {
      const typeResult = await setIssueType(octokit, issue.node_id, issueTypes.Epic);
      if (typeResult.success) {
        console.log(`✅ EPIC issue type set: Epic`);
      } else {
        console.warn(`⚠️ Could not set issue type: ${typeResult.error}`);
      }
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
