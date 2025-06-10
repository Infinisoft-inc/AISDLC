/**
 * Create Task composition
 * Composes: createIssue + setIssueType + addSubIssue + createLinkedBranch
 * Preserves all Task customizations
 */

import type { Octokit } from '@octokit/rest';
import { createIssue } from '../github/issues/createIssue.js';
import { setIssueTypeByName } from '../github/issues/setIssueType.js';
import { ensureIssueTypes } from '../github/issues/createIssueType.js';
import { addSubIssue } from '../github/issues/addSubIssue.js';
import { createLinkedBranch } from '../github/branches/createLinkedBranch.js';
import { generateBranchName } from '../github/utils/generateBranchName.js';
import type { GitHubIssueData, Result } from '../github/types';

export interface TaskData extends GitHubIssueData {
  parentFeatureNumber?: number;
}

export interface TaskResponse {
  id: number;
  number: number;
  node_id: string;
  title: string;
  html_url: string;
  state: string;
  parentFeatureNumber?: number;
  linkedBranch?: {
    branchName: string;
    branchId: string;
    commitOid: string;
    issueNumber: number;
  };
}

export async function createTask(
  octokit: Octokit,
  owner: string,
  repo: string,
  taskData: TaskData
): Promise<Result<TaskResponse>> {
  try {
    console.log(`📋 Creating TASK: ${taskData.title}`);

    // 0. Ensure issue types exist for the organization
    console.log(`🔧 Ensuring issue types exist for organization: ${owner}`);
    const issueTypesResult = await ensureIssueTypes(octokit, owner);
    if (!issueTypesResult.success) {
      console.log(`⚠️ Could not ensure issue types: ${issueTypesResult.error}`);
    } else {
      console.log(`✅ Issue types ready: ${Object.keys(issueTypesResult.data!).join(', ')}`);
    }

    // Ensure Task has proper labels
    const labels = [...(taskData.labels || [])];
    if (!labels.includes('task')) {
      labels.push('task');
    }

    // 1. Create the issue
    const issueResult = await createIssue(octokit, owner, repo, {
      ...taskData,
      labels,
    });

    if (!issueResult.success || !issueResult.data) {
      return issueResult;
    }

    const issue = issueResult.data;

    // 2. Set issue type to Task (using real issue types from repository)
    const typeResult = await setIssueTypeByName(octokit, owner, repo, issue.number, 'Task');
    if (typeResult.success) {
      console.log(`✅ TASK issue type set: Task`);
    } else {
      // This is not an error - issue types might not be configured
      console.log(`ℹ️ Issue type 'Task' not available for ${owner}/${repo}`);
    }

    // 3. Link to parent Feature if provided
    if (taskData.parentFeatureNumber) {
      const subIssueResult = await addSubIssue(
        octokit,
        owner,
        repo,
        taskData.parentFeatureNumber,
        issue.number
      );

      if (subIssueResult.success) {
        console.log(`✅ TASK linked to Feature #${taskData.parentFeatureNumber}`);
      } else {
        console.warn(`⚠️ Failed to link to Feature: ${subIssueResult.error}`);
      }
    }

    // 4. Create linked branch for the task
    const branchName = generateBranchName('task', { title: issue.title });
    const branchResult = await createLinkedBranch(octokit, owner, repo, issue.number, branchName);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data?.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ TASK created: ${issue.html_url}`);

    return {
      success: true,
      data: {
        id: issue.id,
        number: issue.number,
        node_id: issue.node_id,
        title: issue.title,
        html_url: issue.html_url,
        state: issue.state,
        parentFeatureNumber: taskData.parentFeatureNumber,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create TASK:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
