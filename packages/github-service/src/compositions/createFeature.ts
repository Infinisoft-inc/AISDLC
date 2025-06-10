/**
 * Create Feature composition
 * Composes: createIssue + setIssueType + addSubIssue + createLinkedBranch
 * Preserves all Feature customizations
 */

import type { Octokit } from '@octokit/rest';
import { createIssue } from '../github/issues/createIssue';
import { setIssueTypeByName } from '../github/issues/setIssueType';
import { ensureIssueTypes } from '../github/issues/createIssueType';
import { addSubIssue } from '../github/issues/addSubIssue';
import { createLinkedBranch } from '../github/branches/createLinkedBranch';
import { generateBranchName } from '../github/utils/generateBranchName';
import type { GitHubIssueData, Result } from '../github/types';

export interface FeatureData extends GitHubIssueData {
  parentEpicNumber?: number;
  frReference?: string;
}

export interface FeatureResponse {
  id: number;
  number: number;
  node_id: string;
  title: string;
  html_url: string;
  state: string;
  parentEpicNumber?: number;
  linkedBranch?: {
    branchName: string;
    branchId: string;
    commitOid: string;
    issueNumber: number;
  };
}

export async function createFeature(
  octokit: Octokit,
  owner: string,
  repo: string,
  featureData: FeatureData
): Promise<Result<FeatureResponse>> {
  try {
    console.log(`📋 Creating FEATURE: ${featureData.title}`);

    // 0. Ensure issue types exist for the organization
    console.log(`🔧 Ensuring issue types exist for organization: ${owner}`);
    const issueTypesResult = await ensureIssueTypes(octokit, owner);
    if (!issueTypesResult.success) {
      console.log(`⚠️ Could not ensure issue types: ${issueTypesResult.error}`);
    } else {
      console.log(`✅ Issue types ready: ${Object.keys(issueTypesResult.data!).join(', ')}`);
    }

    // Ensure Feature has proper labels
    const labels = [...(featureData.labels || [])];
    if (!labels.includes('feature')) {
      labels.push('feature');
    }

    // 1. Create the issue
    const issueResult = await createIssue(octokit, owner, repo, {
      ...featureData,
      labels,
    });

    if (!issueResult.success || !issueResult.data) {
      return issueResult;
    }

    const issue = issueResult.data;

    // 2. Set issue type to Feature (using real issue types from repository)
    const typeResult = await setIssueTypeByName(octokit, owner, repo, issue.number, 'Feature');
    if (typeResult.success) {
      console.log(`✅ FEATURE issue type set: Feature`);
    } else {
      // This is not an error - issue types might not be configured
      console.log(`ℹ️ Issue type 'Feature' not available for ${owner}/${repo}`);
    }

    // 3. Link to parent Epic if provided
    if (featureData.parentEpicNumber) {
      const subIssueResult = await addSubIssue(
        octokit,
        owner,
        repo,
        featureData.parentEpicNumber,
        issue.number
      );

      if (subIssueResult.success) {
        console.log(`✅ FEATURE linked to Epic #${featureData.parentEpicNumber}`);
      } else {
        console.warn(`⚠️ Failed to link to Epic: ${subIssueResult.error}`);
      }
    }

    // 4. Create linked branch for the feature
    const branchName = generateBranchName('feature', { 
      frReference: featureData.frReference,
      title: issue.title 
    });
    const branchResult = await createLinkedBranch(octokit, owner, repo, issue.number, branchName);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data?.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ FEATURE created: ${issue.html_url}`);

    return {
      success: true,
      data: {
        id: issue.id,
        number: issue.number,
        node_id: issue.node_id,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        parentEpicNumber: featureData.parentEpicNumber,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create FEATURE:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
