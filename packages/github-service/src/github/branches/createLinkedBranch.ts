/**
 * Create linked branch for GitHub issue
 * Single responsibility: Create a branch linked to an issue using GraphQL
 */

import type { Octokit } from '@octokit/rest';
import type { LinkedBranchData, Result } from '../types';

export async function createLinkedBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  branchName: string
): Promise<Result<LinkedBranchData>> {
  let commitSha: string;

  try {
    // Get the issue to get its node_id
    const issueResponse = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const issueNodeId = issueResponse.data.node_id;

    // Get the repository to get its node_id and default branch
    const repoResponse = await octokit.rest.repos.get({
      owner,
      repo,
    });

    const repoNodeId = repoResponse.data.node_id;
    const defaultBranch = repoResponse.data.default_branch;

    // Get the default branch commit SHA
    const branchResponse = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch,
    });

    commitSha = branchResponse.data.commit.sha;

    // Use GraphQL mutation to create linked branch
    const mutation = `
      mutation CreateLinkedBranch($repositoryId: ID!, $issueId: ID!, $name: String!, $oid: GitObjectID!) {
        createLinkedBranch(input: {
          repositoryId: $repositoryId
          issueId: $issueId
          name: $name
          oid: $oid
        }) {
          linkedBranch {
            id
            ref {
              name
              target {
                oid
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(mutation, {
      repositoryId: repoNodeId,
      issueId: issueNodeId,
      name: branchName,
      oid: commitSha,
    });

    const linkedBranch = (response as any).createLinkedBranch?.linkedBranch;

    if (!linkedBranch || !linkedBranch.ref) {
      // Fallback: Create a regular branch if linked branch feature isn't available
      console.log('🔄 Attempting fallback to regular branch creation...');
      try {
        const { createBranch } = await import('./createBranch');
        const fallbackResult = await createBranch(octokit, owner, repo, {
          name: branchName,
          sha: commitSha
        });

        if (fallbackResult.success) {
          console.log(`✅ Fallback branch created: ${fallbackResult.data!.name}`);
          return {
            success: true,
            data: {
              branchName: fallbackResult.data!.name,
              branchId: 'fallback-branch',
              commitOid: fallbackResult.data!.sha,
              issueNumber,
            }
          };
        } else {
          console.warn(`⚠️ Fallback branch creation failed: ${fallbackResult.error}`);
        }
      } catch (fallbackError: any) {
        console.warn(`⚠️ Fallback branch creation error: ${fallbackError.message}`);
      }

      return {
        success: false,
        error: 'Linked branch creation failed - feature may not be available in this repository'
      };
    }

    return {
      success: true,
      data: {
        branchName: linkedBranch.ref.name,
        branchId: linkedBranch.id,
        commitOid: linkedBranch.ref.target.oid,
        issueNumber,
      }
    };
  } catch (error: any) {
    // If GraphQL linked branch fails, try fallback to regular branch
    try {
      // Get default branch SHA for fallback
      const repoResponse = await octokit.rest.repos.get({ owner, repo });
      const defaultBranch = repoResponse.data.default_branch;
      const branchResponse = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: defaultBranch,
      });
      const fallbackCommitSha = branchResponse.data.commit.sha;

      const { createBranch } = await import('./createBranch');
      const fallbackResult = await createBranch(octokit, owner, repo, {
        name: branchName,
        sha: fallbackCommitSha
      });

      if (fallbackResult.success) {
        return {
          success: true,
          data: {
            branchName: fallbackResult.data!.name,
            branchId: 'fallback-branch',
            commitOid: fallbackResult.data!.sha,
            issueNumber,
          }
        };
      }
    } catch (fallbackError) {
      // If fallback also fails, return original error
    }

    return {
      success: false,
      error: error.message
    };
  }
}
