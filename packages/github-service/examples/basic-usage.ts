/**
 * Basic Usage Example
 * Demonstrates how to use the new pure SRP GitHub service
 */

import { createGitHubSetup } from '@brainstack/integration-service';
import { createEpic, createFeature, createTask } from '../src/compositions';
import { createIssue, addIssueLabel, createComment } from '../src/github';

async function basicUsageExample() {
  console.log('🚀 GitHub Service - Basic Usage Example\n');

  // Step 1: Get authenticated GitHub client using integration service
  console.log('📡 Step 1: Getting authenticated GitHub client...');
  const dopplerToken = process.env.DOPPLER_TOKEN!;
  const organization = 'Infinisoft-inc';
  
  const clientResult = await createGitHubSetup(dopplerToken, organization);
  if (!clientResult.success) {
    console.error('❌ Failed to get GitHub client:', clientResult.error);
    return;
  }
  
  const octokit = clientResult.data;
  console.log('✅ GitHub client authenticated successfully\n');

  // Step 2: Create an Epic using composition function
  console.log('📋 Step 2: Creating Epic...');
  const epicResult = await createEpic(octokit, organization, 'AISDLC', {
    title: '[EPIC] Example Epic - E-commerce Platform',
    body: `# Epic: E-commerce Platform

## Overview
Build a comprehensive e-commerce platform with modern architecture.

## Business Value
- Enable online sales for the business
- Provide seamless customer experience
- Support scalable growth

## Acceptance Criteria
- [ ] User authentication system
- [ ] Product catalog management
- [ ] Shopping cart functionality
- [ ] Payment processing
- [ ] Order management
- [ ] Admin dashboard`,
    labels: ['epic', 'e-commerce', 'example'],
  });

  if (epicResult.success) {
    console.log(`✅ Epic created: #${epicResult.data?.number} - ${epicResult.data?.html_url}`);
    if (epicResult.data?.linkedBranch) {
      console.log(`   📁 Linked branch: ${epicResult.data.linkedBranch.branchName}`);
    }
  } else {
    console.error('❌ Epic creation failed:', epicResult.error);
    return;
  }

  // Step 3: Create a Feature linked to the Epic
  console.log('\n🔧 Step 3: Creating Feature...');
  const featureResult = await createFeature(octokit, organization, 'AISDLC', {
    title: '[FEATURE] User Authentication System',
    body: `# Feature: User Authentication System

## Functional Requirements
- FR-AUTH-001: User registration
- FR-AUTH-002: User login/logout
- FR-AUTH-003: Password reset
- FR-AUTH-004: Profile management

## Parent Epic
This feature belongs to Epic #${epicResult.data?.number}`,
    labels: ['feature', 'authentication'],
    parentEpicNumber: epicResult.data?.number,
    frReference: 'FR-AUTH-001',
  });

  if (featureResult.success) {
    console.log(`✅ Feature created: #${featureResult.data?.number} - ${featureResult.data?.html_url}`);
    console.log(`   🔗 Linked to Epic: #${epicResult.data?.number}`);
  } else {
    console.error('❌ Feature creation failed:', featureResult.error);
    return;
  }

  // Step 4: Create a Task linked to the Feature
  console.log('\n⚙️ Step 4: Creating Task...');
  const taskResult = await createTask(octokit, organization, 'AISDLC', {
    title: '[TASK] Implement user registration API endpoint',
    body: `# Task: Implement User Registration API Endpoint

## Parent Feature
This task belongs to Feature #${featureResult.data?.number}

## Implementation Details
- Create POST /api/auth/register endpoint
- Validate email format and uniqueness
- Hash password using bcrypt
- Send welcome email
- Return JWT token

## Acceptance Criteria
- [ ] Endpoint accepts email and password
- [ ] Email validation works correctly
- [ ] Password is hashed before storage
- [ ] Welcome email is sent
- [ ] JWT token is returned`,
    labels: ['task', 'api', 'backend'],
    parentFeatureNumber: featureResult.data?.number,
  });

  if (taskResult.success) {
    console.log(`✅ Task created: #${taskResult.data?.number} - ${taskResult.data?.html_url}`);
    console.log(`   🔗 Linked to Feature: #${featureResult.data?.number}`);
  } else {
    console.error('❌ Task creation failed:', taskResult.error);
    return;
  }

  // Step 5: Demonstrate atomic functions for custom workflow
  console.log('\n🔧 Step 5: Using atomic functions for custom workflow...');
  
  // Create a custom issue using atomic function
  const customIssueResult = await createIssue(octokit, organization, 'AISDLC', {
    title: '[CUSTOM] Custom workflow example',
    body: 'This issue demonstrates using atomic functions for custom workflows.',
    labels: ['custom'],
  });

  if (customIssueResult.success) {
    const issueNumber = customIssueResult.data!.number;
    
    // Add additional labels using atomic function
    await addIssueLabel(octokit, organization, 'AISDLC', issueNumber, 'example');
    await addIssueLabel(octokit, organization, 'AISDLC', issueNumber, 'atomic');
    
    // Add a comment using atomic function
    await createComment(octokit, organization, 'AISDLC', issueNumber, {
      body: '🎉 This comment was added using the atomic createComment function!'
    });
    
    console.log(`✅ Custom issue created: #${issueNumber} - ${customIssueResult.data?.html_url}`);
    console.log(`   🏷️ Added labels: example, atomic`);
    console.log(`   💬 Added comment`);
  }

  console.log('\n🎯 Summary:');
  console.log(`   Epic: #${epicResult.data?.number}`);
  console.log(`   Feature: #${featureResult.data?.number}`);
  console.log(`   Task: #${taskResult.data?.number}`);
  console.log('\n✅ Basic usage example completed successfully!');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExample().catch(console.error);
}

export { basicUsageExample };
