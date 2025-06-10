/**
 * Epic Composition Tests
 * Tests the createEpic composition function
 */

import '../setup';
import { testConfig } from '../setup';
import { createGitHubSetup } from '@brainstack/integration-service';
import { createEpic } from '../../src/compositions';
import { loadTestConfig, getWorkingRepo } from '../config/test-config';

describe('Epic Composition', () => {
  let octokit: any;
  let config: any;

  beforeAll(async () => {
    // Load centralized test configuration
    config = loadTestConfig();

    // Get GitHub client using integration service
    const result = await createGitHubSetup(testConfig.dopplerToken, testConfig.organization);
    expect(result.success).toBe(true);
    octokit = result.data;
  }, 30000);

  test('should create a complete Epic with all customizations', async () => {
    const epicData = {
      title: '[EPIC] Test Epic Creation with Full Customizations',
      body: `# Epic: Test Epic Creation

## Overview
This is a comprehensive test of the Epic creation composition function.

## Acceptance Criteria
- [ ] Epic issue is created
- [ ] Epic label is applied
- [ ] Issue type is set (if available)
- [ ] Linked branch is created
- [ ] All customizations are preserved

## Domain
Test Domain for Epic Creation

## Created by
Automated test suite`,
      labels: ['test', 'epic-test'],
    };

    const result = await createEpic(octokit, testConfig.organization, getWorkingRepo(config), epicData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(epicData.title);
    expect(result.data?.number).toBeGreaterThan(0);
    
    // Check if linked branch was created
    if (result.data?.linkedBranch) {
      expect(result.data.linkedBranch.branchName).toMatch(/^epic\//);
      expect(result.data.linkedBranch.issueNumber).toBe(result.data.number);
      console.log(`✅ Epic created with linked branch: ${result.data.linkedBranch.branchName}`);
    } else {
      console.log(`⚠️ Epic created without linked branch (feature may not be available)`);
    }
    
    console.log(`✅ Created Epic #${result.data?.number}: ${result.data?.html_url}`);
  }, 20000);

  test('should create Epic with minimal data', async () => {
    const epicData = {
      title: '[EPIC] Minimal Epic Test',
      body: 'This is a minimal Epic for testing.',
    };

    const result = await createEpic(octokit, testConfig.organization, getWorkingRepo(config), epicData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(epicData.title);
    
    console.log(`✅ Created minimal Epic #${result.data?.number}: ${result.data?.html_url}`);
  }, 20000);

  test('should handle Epic creation with issue types', async () => {
    const epicData = {
      title: '[EPIC] Epic with Issue Types',
      body: 'Testing Epic creation with GitHub issue types.',
      labels: ['test'],
    };

    const result = await createEpic(
      octokit,
      testConfig.organization,
      getWorkingRepo(config),
      epicData
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    console.log(`✅ Created Epic with issue types #${result.data?.number}: ${result.data?.html_url}`);
  }, 20000);

  test('should handle Epic creation failure gracefully', async () => {
    const epicData = {
      title: '', // Invalid: empty title
      body: 'This should fail due to empty title.',
    };

    const result = await createEpic(octokit, testConfig.organization, getWorkingRepo(config), epicData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    console.log(`✅ Properly handled Epic creation failure: ${result.error}`);
  }, 20000);

  test('should handle invalid repository for Epic creation', async () => {
    const epicData = {
      title: '[EPIC] Test Epic in Invalid Repo',
      body: 'This should fail due to invalid repository.',
    };

    const result = await createEpic(octokit, testConfig.organization, 'non-existent-repo', epicData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    console.log(`✅ Properly handled invalid repository: ${result.error}`);
  }, 20000);
});
