/**
 * Create Task Issue
 * Single responsibility: Create a single Task issue linked to a Feature
 */

import { createTask } from '@brainstack/github-service';
import { createGitHubSetup } from '@brainstack/integration-service';
import type { JordanMemoryManager } from '../memory.js';

export interface TaskIssueData {
  owner: string;
  repo: string;
  title: string;
  body: string;
  parentFeatureNumber: number;
  labels?: string[];
  organization?: string;
}

export interface TaskIssueResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function createTaskIssue(
  data: TaskIssueData,
  memory: JordanMemoryManager
): Promise<TaskIssueResult> {
  const { owner, repo, title, body, parentFeatureNumber, labels = ["task"], organization = "Infinisoft-inc" } = data;

  try {
    // Get authenticated GitHub client
    const githubSetupResult = await createGitHubSetup(process.env.DOPPLER_TOKEN!, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    const taskData = {
      title: title.startsWith('[TASK]') ? title : `[TASK] ${title}`,
      body,
      labels,
      parentFeatureNumber
    };

    const result = await createTask(octokit, owner, repo, taskData);

    if (result.success && result.data) {
      // Record in memory
      memory.addConversation('jordan', `Task created: ${result.data.title} (#${result.data.number}) linked to Feature #${parentFeatureNumber}`, 'task_creation', 'high');

      return {
        success: true,
        data: result.data
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
