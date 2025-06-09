/**
 * Create GitHub issue comment
 * Single responsibility: Add a comment to an issue
 */

import type { Octokit } from '@octokit/rest';
import type { CommentData, CommentResponse, Result } from '../types';

export async function createComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  commentData: CommentData
): Promise<Result<CommentResponse>> {
  try {
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: commentData.body,
    });

    return {
      success: true,
      data: {
        id: response.data.id,
        html_url: response.data.html_url,
        body: response.data.body || '',
        created_at: response.data.created_at,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
