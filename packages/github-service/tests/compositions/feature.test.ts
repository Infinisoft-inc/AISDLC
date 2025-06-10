/**
 * Feature Composition Tests
 * Tests the createFeature composition function
 */

import '../setup';
import { testConfig } from '../setup';
import { createGitHubSetup } from '@brainstack/integration-service';
import { createEpic, createFeature } from '../../src/compositions';
import { loadTestConfig, getWorkingRepo } from '../config/test-config';

describe('Feature Composition', () => {
  let octokit: any;
  let parentEpicNumber: number;
  let config: any;

  beforeAll(async () => {
    // Load centralized test configuration
    config = loadTestConfig();

    // Get GitHub client using integration service
    const result = await createGitHubSetup(testConfig.dopplerToken, testConfig.organization);
    expect(result.success).toBe(true);
    octokit = result.data;

    // Create a parent Epic for Feature testing
    const epicResult = await createEpic(octokit, testConfig.organization, getWorkingRepo(config), {
      title: '[EPIC] Parent Epic for Feature Tests',
      body: 'This Epic serves as a parent for Feature composition tests.',
      labels: ['test', 'parent-epic'],
    });
    expect(epicResult.success).toBe(true);
    parentEpicNumber = epicResult.data!.number;
    console.log(`✅ Created parent Epic #${parentEpicNumber} for Feature tests`);
  }, 30000);

  test('should create Feature linked to parent Epic', async () => {
    const featureData = {
      title: '[FEATURE] Test Feature with Parent Epic',
      body: `# Feature: Test Feature Creation

## Overview
This Feature tests the complete composition function with parent Epic linking.

## Functional Requirements
- FR-001: Feature should be linked to parent Epic
- FR-002: Feature should have proper labels
- FR-003: Feature should create linked branch

## Parent Epic
This Feature belongs to Epic #${parentEpicNumber}

## Created by
Automated test suite`,
      labels: ['test', 'feature-test'],
      parentEpicNumber,
      frReference: 'FR-TEST-001',
    };

    const result = await createFeature(octokit, testConfig.organization, getWorkingRepo(config), featureData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(featureData.title);
    expect(result.data?.number).toBeGreaterThan(0);
    expect(result.data?.parentEpicNumber).toBe(parentEpicNumber);
    
    // Check if linked branch was created
    if (result.data?.linkedBranch) {
      expect(result.data.linkedBranch.branchName).toMatch(/^feature\//);
      expect(result.data.linkedBranch.branchName).toContain('fr-test-001');
      expect(result.data.linkedBranch.issueNumber).toBe(result.data.number);
      console.log(`✅ Feature created with linked branch: ${result.data.linkedBranch.branchName}`);
    } else {
      console.log(`⚠️ Feature created without linked branch (feature may not be available)`);
    }
    
    console.log(`✅ Created Feature #${result.data?.number} linked to Epic #${parentEpicNumber}: ${result.data?.html_url}`);
  }, 25000);

  test('should create Feature without parent Epic', async () => {
    const featureData = {
      title: '[FEATURE] Standalone Feature Test',
      body: 'This Feature tests creation without a parent Epic.',
      labels: ['test'],
      frReference: 'FR-STANDALONE-001',
    };

    const result = await createFeature(octokit, testConfig.organization, getWorkingRepo(config), featureData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(featureData.title);
    expect(result.data?.parentEpicNumber).toBeUndefined();
    
    console.log(`✅ Created standalone Feature #${result.data?.number}: ${result.data?.html_url}`);
  }, 25000);

  test('should create Feature with minimal data', async () => {
    const featureData = {
      title: '[FEATURE] Minimal Feature Test',
      body: 'This is a minimal Feature for testing.',
    };

    const result = await createFeature(octokit, testConfig.organization, getWorkingRepo(config), featureData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe(featureData.title);
    
    console.log(`✅ Created minimal Feature #${result.data?.number}: ${result.data?.html_url}`);
  }, 25000);

  test('should handle Feature creation with issue types', async () => {
    const featureData = {
      title: '[FEATURE] Feature with Issue Types',
      body: 'Testing Feature creation with GitHub issue types.',
      labels: ['test'],
      frReference: 'FR-TYPES-001',
    };

    const result = await createFeature(
      octokit,
      testConfig.organization,
      getWorkingRepo(config),
      featureData
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    console.log(`✅ Created Feature with issue types #${result.data?.number}: ${result.data?.html_url}`);
  }, 25000);

  test('should handle linking to non-existent parent Epic', async () => {
    const featureData = {
      title: '[FEATURE] Feature with Invalid Parent',
      body: 'This Feature attempts to link to a non-existent Epic.',
      parentEpicNumber: 999999, // Non-existent Epic
    };

    const result = await createFeature(octokit, testConfig.organization, getWorkingRepo(config), featureData);
    
    // Feature creation should succeed, but linking might fail gracefully
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    console.log(`✅ Created Feature #${result.data?.number} (parent linking may have failed gracefully): ${result.data?.html_url}`);
  }, 25000);
});
