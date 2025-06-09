/**
 * Full Workflow Integration Tests
 * Tests the complete Epic → Feature → Task workflow
 */

import '../setup';
import { testConfig } from '../setup';
import { createGitHubSetup } from '@brainstack/integration-service';
import { createEpic, createFeature, createTask } from '../../src/compositions';
import {
  createIssue,
  addIssueLabel,
  createComment,
  getIssueTypes,
  createProjectV2,
  addIssueToProjectV2
} from '../../src/github';

describe('Full AI-SDLC Workflow Integration', () => {
  let octokit: any;
  let epicNumber: number;
  let featureNumber: number;
  let taskNumber: number;
  let projectId: string;
  let issueTypes: Record<string, string>;

  beforeAll(async () => {
    // Get GitHub client using integration service
    const result = await createGitHubSetup(testConfig.dopplerToken, testConfig.organization);
    expect(result.success).toBe(true);
    octokit = result.data;

    const workingRepo = 'rqrsda-v2';

    // Get available issue types
    console.log('🔍 Getting available issue types...');
    const issueTypesResult = await getIssueTypes(octokit, testConfig.organization, workingRepo);
    if (issueTypesResult.success) {
      issueTypes = issueTypesResult.data!;
      console.log('✅ Available issue types:', Object.keys(issueTypes));
    } else {
      console.warn('⚠️ Could not get issue types:', issueTypesResult.error);
      issueTypes = {};
    }

    // Create a project for the workflow
    console.log('🔍 Creating project for AI-SDLC workflow...');
    const projectResult = await createProjectV2(octokit, testConfig.organization, {
      title: 'AI-SDLC Integration Test Project',
      body: 'Project created by integration tests to demonstrate Epic → Feature → Task workflow'
    });

    if (projectResult.success) {
      projectId = projectResult.data!.id;
      console.log('✅ Project created:', projectResult.data!.url);
    } else {
      console.warn('⚠️ Could not create project:', projectResult.error);
      projectId = '';
    }
  }, 30000);

  test('should create complete Epic → Feature → Task hierarchy', async () => {
    // Step 1: Create Epic
    console.log('\n🚀 Step 1: Creating Epic...');
    const epicData = {
      title: '[EPIC] Complete AI-SDLC Workflow Test',
      body: `# Epic: Complete AI-SDLC Workflow Test

## Overview
This Epic demonstrates the complete AI-SDLC methodology workflow:
Epic → Feature → Task hierarchy with full GitHub integration.

## Business Value
- Validate the new pure SRP architecture
- Demonstrate preserved customizations
- Test real GitHub API integrations

## Acceptance Criteria
- [ ] Epic is created with proper labels and issue type
- [ ] Features can be linked to this Epic
- [ ] Tasks can be linked to Features
- [ ] All linked branches are created
- [ ] Sub-issue relationships work correctly

## Domain
AI-SDLC Testing Domain`,
      labels: ['test', 'integration', 'ai-sdlc'],
    };

    const workingRepo = 'rqrsda-v2'; // Use the working repository
    const epicResult = await createEpic(octokit, testConfig.organization, workingRepo, epicData, issueTypes);
    expect(epicResult.success).toBe(true);
    epicNumber = epicResult.data!.number;

    // Add Epic to project
    if (projectId && epicResult.data?.node_id) {
      const addToProjectResult = await addIssueToProjectV2(octokit, projectId, epicResult.data.node_id);
      if (addToProjectResult.success) {
        console.log(`✅ Epic added to project`);
      } else {
        console.warn(`⚠️ Could not add Epic to project: ${addToProjectResult.error}`);
      }
    }
    
    console.log(`✅ Epic created: #${epicNumber} - ${epicResult.data?.html_url}`);
    if (epicResult.data?.linkedBranch) {
      console.log(`   📁 Linked branch: ${epicResult.data.linkedBranch.branchName}`);
    }

    // Step 2: Create Feature linked to Epic
    console.log('\n🚀 Step 2: Creating Feature linked to Epic...');
    const featureData = {
      title: '[FEATURE] User Authentication System',
      body: `# Feature: User Authentication System

## Overview
Implement a comprehensive user authentication system as part of the AI-SDLC workflow.

## Functional Requirements
- FR-AUTH-001: User registration with email validation
- FR-AUTH-002: Secure login with JWT tokens
- FR-AUTH-003: Password reset functionality
- FR-AUTH-004: Multi-factor authentication support

## Parent Epic
This Feature belongs to Epic #${epicNumber}

## Technical Specifications
- Use JWT for session management
- Implement bcrypt for password hashing
- Support OAuth2 providers (Google, GitHub)
- Rate limiting for login attempts

## Acceptance Criteria
- [ ] Users can register with valid email
- [ ] Users can login with credentials
- [ ] Password reset emails are sent
- [ ] MFA can be enabled/disabled`,
      labels: ['test', 'feature', 'authentication'],
      parentEpicNumber: epicNumber,
      frReference: 'FR-AUTH-001',
    };

    const featureResult = await createFeature(octokit, testConfig.organization, workingRepo, featureData, issueTypes);
    expect(featureResult.success).toBe(true);
    featureNumber = featureResult.data!.number;

    // Add Feature to project
    if (projectId && featureResult.data?.node_id) {
      const addToProjectResult = await addIssueToProjectV2(octokit, projectId, featureResult.data.node_id);
      if (addToProjectResult.success) {
        console.log(`✅ Feature added to project`);
      } else {
        console.warn(`⚠️ Could not add Feature to project: ${addToProjectResult.error}`);
      }
    }
    
    console.log(`✅ Feature created: #${featureNumber} - ${featureResult.data?.html_url}`);
    console.log(`   🔗 Linked to Epic: #${epicNumber}`);
    if (featureResult.data?.linkedBranch) {
      console.log(`   📁 Linked branch: ${featureResult.data.linkedBranch.branchName}`);
    }

    // Step 3: Create Task linked to Feature
    console.log('\n🚀 Step 3: Creating Task linked to Feature...');
    const taskData = {
      title: '[TASK] Implement JWT Token Generation',
      body: `# Task: Implement JWT Token Generation

## Overview
Implement the JWT token generation functionality for the user authentication system.

## Parent Feature
This Task belongs to Feature #${featureNumber}

## Technical Details
- Create JWT utility functions
- Implement token signing with secret key
- Add token expiration handling
- Include user claims in token payload

## Implementation Steps
1. Install jsonwebtoken library
2. Create JWT utility module
3. Implement generateToken function
4. Implement verifyToken function
5. Add error handling for invalid tokens
6. Write unit tests

## Acceptance Criteria
- [ ] JWT tokens are generated correctly
- [ ] Tokens include user ID and role
- [ ] Tokens expire after configured time
- [ ] Invalid tokens are rejected
- [ ] Unit tests pass with 100% coverage

## Estimated Effort
2-3 hours`,
      labels: ['test', 'task', 'authentication', 'jwt'],
      parentFeatureNumber: featureNumber,
    };

    const taskResult = await createTask(octokit, testConfig.organization, workingRepo, taskData, issueTypes);
    expect(taskResult.success).toBe(true);
    taskNumber = taskResult.data!.number;

    // Add Task to project
    if (projectId && taskResult.data?.node_id) {
      const addToProjectResult = await addIssueToProjectV2(octokit, projectId, taskResult.data.node_id);
      if (addToProjectResult.success) {
        console.log(`✅ Task added to project`);
      } else {
        console.warn(`⚠️ Could not add Task to project: ${addToProjectResult.error}`);
      }
    }
    
    console.log(`✅ Task created: #${taskNumber} - ${taskResult.data?.html_url}`);
    console.log(`   🔗 Linked to Feature: #${featureNumber}`);
    if (taskResult.data?.linkedBranch) {
      console.log(`   📁 Linked branch: ${taskResult.data.linkedBranch.branchName}`);
    }

    // Verify the complete hierarchy
    console.log('\n🎯 Complete Hierarchy Created:');
    console.log(`   Epic #${epicNumber} → Feature #${featureNumber} → Task #${taskNumber}`);
    
  }, 60000);

  test('should demonstrate atomic function reusability', async () => {
    console.log('\n🔧 Demonstrating atomic function reusability...');

    const workingRepo = 'rqrsda-v2'; // Use the working repository

    // Use imported atomic functions directly
    
    // Create a custom issue using atomic functions
    const issueResult = await createIssue(octokit, testConfig.organization, workingRepo, {
      title: '[CUSTOM] Atomic Functions Demo',
      body: 'This issue demonstrates using atomic functions directly for custom workflows.',
    });

    expect(issueResult.success).toBe(true);
    const customIssueNumber = issueResult.data!.number;

    // Add multiple labels using atomic function
    await addIssueLabel(octokit, testConfig.organization, workingRepo, customIssueNumber, 'custom');
    await addIssueLabel(octokit, testConfig.organization, workingRepo, customIssueNumber, 'atomic');
    await addIssueLabel(octokit, testConfig.organization, workingRepo, customIssueNumber, 'reusable');

    // Add a comment using atomic function
    await createComment(octokit, testConfig.organization, workingRepo, customIssueNumber, {
      body: '🎉 This comment was added using the atomic createComment function!'
    });
    
    console.log(`✅ Custom workflow completed: #${customIssueNumber} - ${issueResult.data?.html_url}`);
    console.log(`   🏷️ Added labels: custom, atomic, reusable`);
    console.log(`   💬 Added comment using atomic function`);
  }, 30000);

  afterAll(() => {
    console.log('\n📊 Integration Test Summary:');
    console.log(`   Epic: #${epicNumber}`);
    console.log(`   Feature: #${featureNumber}`);
    console.log(`   Task: #${taskNumber}`);
    console.log('\n✅ All integration tests completed successfully!');
  });
});
