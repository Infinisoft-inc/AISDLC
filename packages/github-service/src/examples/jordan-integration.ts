/**
 * Example integration for Jordan's PM Tools
 * Shows how to use the new clean architecture
 */
import { createOctokitForOrg } from '../producer/github/octokit';
import { Octokit } from '@octokit/rest';

/**
 * Example: Create an authenticated Octokit instance for a specific organization
 * This uses the new clean architecture with functional programming
 */
export async function createAuthenticatedOctokit(orgName: string): Promise<Octokit> {
  try {
    // Simple one-line call using our clean architecture
    return await createOctokitForOrg(orgName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create authenticated GitHub client for ${orgName}: ${errorMessage}`);
  }
}

/**
 * Example: Jordan's create issue function using new architecture
 */
export async function createIssueForOrg(
  orgName: string,
  repoName: string,
  title: string,
  body: string
) {
  const octokit = await createOctokitForOrg(orgName);

  const { data: issue } = await octokit.rest.issues.create({
    owner: orgName,
    repo: repoName,
    title,
    body
  });

  return issue;
}

/**
 * Example: Jordan's create repository function
 */
export async function createRepoForOrg(
  orgName: string,
  repoName: string,
  description: string,
  isPrivate: boolean = true
) {
  const octokit = await createOctokitForOrg(orgName);

  const { data: repo } = await octokit.rest.repos.createInOrg({
    org: orgName,
    name: repoName,
    description,
    private: isPrivate
  });

  return repo;
}
