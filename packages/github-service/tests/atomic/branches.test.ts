/**
 * Atomic Branch Functions Tests
 * Tests individual branch-related functions
 */

import '../setup';
import { testConfig } from '../setup';
import { createGitHubSetup } from '@brainstack/integration-service';
import { createBranch, getBranch, createLinkedBranch } from '../../src/github';
import { createIssue } from '../../src/github';

describe('Atomic Branch Functions', () => {
  let octokit: any;
  let defaultBranchSha: string;
  let testIssueNumber: number;

  beforeAll(async () => {
    // Get GitHub client using integration service
    const result = await createGitHubSetup(testConfig.dopplerToken, testConfig.organization);
    expect(result.success).toBe(true);
    octokit = result.data;

    // Use the working repository from issue tests
    const workingRepo = 'rqrsda-v2';

    // Get default branch SHA
    const branchResult = await getBranch(octokit, testConfig.organization, workingRepo, 'main');
    if (branchResult.success) {
      defaultBranchSha = branchResult.data!.sha;
    } else {
      // Try 'master' if 'main' doesn't exist
      const masterResult = await getBranch(octokit, testConfig.organization, workingRepo, 'master');
      expect(masterResult.success).toBe(true);
      defaultBranchSha = masterResult.data!.sha;
    }

    // Create a test issue for linked branch testing
    const issueResult = await createIssue(octokit, testConfig.organization, workingRepo, {
      title: '[TEST] Issue for Branch Linking',
      body: 'This issue is used for testing linked branch creation.',
      labels: ['test', 'branch-test'],
    });
    expect(issueResult.success).toBe(true);
    testIssueNumber = issueResult.data!.number;
  }, 30000);

  test('should create a basic branch', async () => {
    const branchName = `test/atomic-branch-${Date.now()}`;
    const branchData = {
      name: branchName,
      sha: defaultBranchSha,
    };

    const result = await createBranch(octokit, testConfig.organization, 'rqrsda-v2', branchData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(branchName);
    expect(result.data?.sha).toBe(defaultBranchSha);
    
    console.log(`✅ Created test branch: ${branchName}`);
  }, 15000);

  test('should get branch details', async () => {
    const result = await getBranch(octokit, testConfig.organization, 'rqrsda-v2', 'main');

    if (!result.success) {
      // Try 'master' if 'main' doesn't exist
      const masterResult = await getBranch(octokit, testConfig.organization, 'rqrsda-v2', 'master');
      expect(masterResult.success).toBe(true);
      expect(masterResult.data?.name).toBe('master');
    } else {
      expect(result.data?.name).toBe('main');
    }
    
    console.log(`✅ Retrieved default branch details`);
  }, 15000);

  test('should create linked branch for issue', async () => {
    const branchName = `feature/test-linked-branch-${Date.now()}`;
    
    const result = await createLinkedBranch(
      octokit,
      testConfig.organization,
      'rqrsda-v2',
      testIssueNumber,
      branchName
    );
    
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data?.branchName).toBe(branchName);
      expect(result.data?.issueNumber).toBe(testIssueNumber);
      console.log(`✅ Created linked branch: ${branchName} for issue #${testIssueNumber}`);
    } else {
      // Linked branches might not be available in all GitHub setups
      console.log(`⚠️ Linked branch creation not available: ${result.error}`);
      expect(result.error).toContain('linked');
    }
  }, 15000);

  test('should handle invalid branch creation', async () => {
    const branchData = {
      name: 'invalid/branch/name/with/too/many/slashes',
      sha: 'invalid-sha',
    };

    const result = await createBranch(octokit, testConfig.organization, 'rqrsda-v2', branchData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    console.log(`✅ Properly handled invalid branch creation: ${result.error}`);
  }, 15000);

  test('should handle non-existent branch', async () => {
    const result = await getBranch(octokit, testConfig.organization, 'rqrsda-v2', 'non-existent-branch');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    console.log(`✅ Properly handled non-existent branch: ${result.error}`);
  }, 15000);
});
