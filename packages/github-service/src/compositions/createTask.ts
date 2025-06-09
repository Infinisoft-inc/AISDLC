/**
 * Create Task composition
 * Composes: createIssue + setIssueType + addSubIssue + createLinkedBranch
 * Preserves all Task customizations
 */

import type { Octokit } from '@octokit/rest';
import { createIssue } from '../github/issues/createIssue';
import { addIssueLabel } from '../github/issues/addIssueLabel';
import { setIssueType } from '../github/issues/setIssueType';
import { addSubIssue } from '../github/issues/addSubIssue';
import { createLinkedBranch } from '../github/branches/createLinkedBranch';
import { generateBranchName } from '../github/utils/generateBranchName';
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
  taskData: TaskData,
  issueTypes?: { Task?: string }
): Promise<Result<TaskResponse>> {
  try {
    console.log(`📋 Creating TASK: ${taskData.title}`);

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

    // 2. Set issue type to Task if available
    if (issueTypes?.Task) {
      const typeResult = await setIssueType(octokit, issue.node_id, issueTypes.Task);
      if (typeResult.success) {
        console.log(`✅ TASK issue type set: Task`);
      } else {
        console.warn(`⚠️ Could not set issue type: ${typeResult.error}`);
      }
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
