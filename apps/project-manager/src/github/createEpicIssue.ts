/**
 * Create Epic Issue
 * Single responsibility: Create a single Epic issue in GitHub repository
 */

import { createEpic } from '@brainstack/github-service';
import { createGitHubSetup } from '@brainstack/integration-service';
import type { JordanMemoryManager } from '../memory.js';

export interface EpicIssueData {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
  organization?: string;
}

export interface EpicIssueResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function createEpicIssue(
  data: EpicIssueData,
  memory: JordanMemoryManager
): Promise<EpicIssueResult> {
  const { owner, repo, title, body, labels = ["epic"], organization = "Infinisoft-inc" } = data;

  try {
    // Get authenticated GitHub client
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }

    const githubSetupResult = await createGitHubSetup(dopplerToken, organization);

    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    const epicData = {
      title: title.startsWith('[EPIC]') ? title : `[EPIC] ${title}`,
      body,
      labels
    };

    const result = await createEpic(octokit, owner, repo, epicData);

    if (result.success && result.data) {
      // Record in memory
      memory.addConversation('jordan', `Epic created: ${result.data.title} (#${result.data.number})`, 'epic_creation', 'high');

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
