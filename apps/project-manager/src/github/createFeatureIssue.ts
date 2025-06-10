/**
 * Create Feature Issue
 * Single responsibility: Create a single Feature issue linked to an Epic
 */

import { createFeature } from '@brainstack/github-service';
import { createGitHubSetup } from '@brainstack/integration-service';
import type { JordanMemoryManager } from '../memory.js';

export interface FeatureIssueData {
  owner: string;
  repo: string;
  title: string;
  body: string;
  parentEpicNumber: number;
  labels?: string[];
  organization?: string;
}

export interface FeatureIssueResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function createFeatureIssue(
  data: FeatureIssueData,
  memory: JordanMemoryManager
): Promise<FeatureIssueResult> {
  const { owner, repo, title, body, parentEpicNumber, labels = ["feature"], organization = "Infinisoft-inc" } = data;

  try {
    // Get authenticated GitHub client
    const githubSetupResult = await createGitHubSetup(process.env.DOPPLER_TOKEN!, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    const featureData = {
      title: title.startsWith('[FEATURE]') ? title : `[FEATURE] ${title}`,
      body,
      labels,
      parentEpicNumber
    };

    const result = await createFeature(octokit, owner, repo, featureData);

    if (result.success && result.data) {
      // Record in memory
      memory.addConversation('jordan', `Feature created: ${result.data.title} (#${result.data.number}) linked to Epic #${parentEpicNumber}`, 'feature_creation', 'high');

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
