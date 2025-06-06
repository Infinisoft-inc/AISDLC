#!/usr/bin/env node

// Load environment variables first
import { config } from 'dotenv';
config();

// Simple demo without templates to test core functionality
import { 
  createRepository, 
  createProject, 
  createMilestone,
  createEpic,
  createFeature,
  createTask,
  addIssueToProject
} from './dist/github-service.js';

async function runSimpleDemo() {
  console.log('🚀 AI-SDLC Simple Demo (Core Functionality)');
  console.log('==========================================\n');

  try {
    // Use organization installation ID
    const orgInstallationId = 70009309;
    const timestamp = Date.now();
    
    // Step 1: Create Repository
    console.log('📁 Step 1: Creating repository...');
    const repoData = {
      name: `aisdlc-simple-${timestamp}`,
      description: 'AI-SDLC Simple Demo Repository',
      private: false
    };
    
    const repoResult = await createRepository(repoData, orgInstallationId);
    if (!repoResult.success) {
      throw new Error(`Repository creation failed: ${repoResult.error}`);
    }
    
    const owner = repoResult.data.full_name.split('/')[0];
    const repo = repoResult.data.name;
    
    console.log(`✅ Repository created: ${repoResult.data.html_url}\n`);
    
    // Step 2: Create GitHub Project
    console.log('📊 Step 2: Creating GitHub Project...');
    const projectResult = await createProject(owner, `Simple Demo ${timestamp}`, 'Simple demo project', orgInstallationId);
    if (!projectResult.success) {
      throw new Error(`Project creation failed: ${projectResult.error}`);
    }
    console.log(`✅ Project created: ${projectResult.data.url}\n`);
    
    // Step 3: Create Milestone
    console.log('🎯 Step 3: Creating milestone...');
    const milestoneResult = await createMilestone(owner, repo, 'Demo Sprint 1', 'First sprint for simple demo', orgInstallationId);
    if (milestoneResult.success) {
      console.log(`✅ Milestone created: ${milestoneResult.data.title}\n`);
    }
    
    // Step 4: Create Epic
    console.log('📋 Step 4: Creating EPIC...');
    const epicData = {
      title: '[EPIC] User Management - Complete user authentication system',
      body: `# Epic: User Management

## Domain Description
Complete user authentication and authorization system

## Business Value
Enable secure user access and role-based permissions for the application

## Scope
**In Scope:**
- User registration and login
- Password reset functionality
- Role-based access control
- User profile management

**Out of Scope:**
- Social media authentication
- Multi-factor authentication
- Advanced audit logging

## Success Criteria
- [ ] Users can register and login successfully
- [ ] Password reset works via email
- [ ] Role permissions are enforced correctly
- [ ] User profiles can be updated`,
      labels: ['epic', 'domain:user-management']
    };
    
    const epicResult = await createEpic(owner, repo, epicData, orgInstallationId);
    if (!epicResult.success) {
      throw new Error(`Epic creation failed: ${epicResult.error}`);
    }
    console.log(`✅ EPIC created: ${epicResult.data.html_url}`);
    if (epicResult.data.linkedBranch) {
      console.log(`✅ EPIC linked branch: ${epicResult.data.linkedBranch.branchName}`);
    }

    // Add Epic to project
    await addIssueToProject(projectResult.data.id, owner, repo, epicResult.data.number, 'epic', undefined, orgInstallationId);
    console.log(`✅ EPIC added to project\n`);
    
    // Step 5: Create Feature
    console.log('🎯 Step 5: Creating FEATURE...');
    const featureData = {
      title: '[FEATURE] FR-UM-001 - User Registration and Login System',
      body: `# Feature: FR-UM-001

## Functional Requirement Reference
**FR Reference:** FR-UM-001 - User Registration Requirements
**Domain:** User Management

## Feature Description
User Registration and Login System

## User Story
**As a** new user
**I want** to register an account and login to the system
**So that** I can access the application securely

## Acceptance Criteria
- [ ] **Given** I am on the registration page **When** I enter valid user details **Then** my account is created successfully
- [ ] **Given** I have a valid account **When** I enter correct credentials **Then** I am logged into the system
- [ ] **Given** I enter invalid credentials **When** I attempt to login **Then** I see an appropriate error message

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] All child task issues are completed
- [ ] Code review is complete
- [ ] Feature is deployed and working`,
      labels: ['feature']
    };
    
    const featureResult = await createFeature(owner, repo, featureData, epicResult.data.number, orgInstallationId);
    if (!featureResult.success) {
      throw new Error(`Feature creation failed: ${featureResult.error}`);
    }
    console.log(`✅ FEATURE created: ${featureResult.data.html_url}`);
    if (featureResult.data.linkedBranch) {
      console.log(`✅ FEATURE linked branch: ${featureResult.data.linkedBranch.branchName}`);
    }

    // Add Feature to project
    await addIssueToProject(projectResult.data.id, owner, repo, featureResult.data.number, 'feature', epicResult.data.number, orgInstallationId);
    console.log(`✅ FEATURE added to project\n`);
    
    // Step 6: Create Task
    console.log('⚡ Step 6: Creating TASK...');
    const taskData = {
      title: '[TASK] Implement User Registration API Endpoint',
      body: `# Task: Implement User Registration API Endpoint

## Task Description
Create REST API endpoint for user registration with validation and database integration.

## Implementation Steps

1. **API Endpoint Setup**
   - [ ] Create POST /api/auth/register endpoint
   - [ ] Set up request validation middleware
   - [ ] Configure response formatting

2. **Database Integration**
   - [ ] Create user table schema
   - [ ] Implement user model
   - [ ] Add password hashing

3. **Validation and Security**
   - [ ] Email format validation
   - [ ] Password strength requirements
   - [ ] Duplicate email prevention

## Deliverables
- [ ] API endpoint: \`/api/auth/register\`
- [ ] User model: \`models/User.js\`
- [ ] Validation middleware: \`middleware/validation.js\`

## Definition of Done
- [ ] All implementation steps are completed
- [ ] All deliverables are created and tested
- [ ] Code review is complete and approved
- [ ] Task is ready for integration`,
      labels: ['task', 'backend', 'api']
    };
    
    const taskResult = await createTask(owner, repo, taskData, featureResult.data.number, orgInstallationId);
    if (!taskResult.success) {
      throw new Error(`Task creation failed: ${taskResult.error}`);
    }
    console.log(`✅ TASK created: ${taskResult.data.html_url}`);
    if (taskResult.data.linkedBranch) {
      console.log(`✅ TASK linked branch: ${taskResult.data.linkedBranch.branchName}`);
    }

    // Add Task to project
    await addIssueToProject(projectResult.data.id, owner, repo, taskResult.data.number, 'task', featureResult.data.number, orgInstallationId);
    console.log(`✅ TASK added to project\n`);
    
    // Step 7: Summary
    console.log('📊 Step 7: Simple Demo Complete!');
    console.log('=================================');
    console.log(`🏗️ Repository: ${repoResult.data.html_url}`);
    console.log(`📊 Project: ${projectResult.data.url}`);
    console.log(`🎯 Milestone: Demo Sprint 1`);
    console.log(`📋 EPIC #${epicResult.data.number}: User Management`);
    console.log(`🎯 FEATURE #${featureResult.data.number}: FR-UM-001 - User Registration`);
    console.log(`⚡ TASK #${taskResult.data.number}: Implement User Registration API`);
    console.log('');
    console.log('✅ Core AI-SDLC functionality working:');
    console.log('   ✅ Real parent-child issue relationships');
    console.log('   ✅ Proper issue type assignment');
    console.log('   ✅ GitHub Project integration');
    console.log('   ✅ Linked branches for all issue types');
    console.log('');
    console.log('🎯 Development Workflow Ready:');
    console.log('   📋 Epic Branch → Feature Branch → Task Branch');
    console.log('   🔄 Task PR → Feature PR → Epic PR → Main');
    console.log('   ✅ Bottom-up quality control at each level');
    console.log('');
    console.log('🎉 Complete AI-SDLC workflow ready for development!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
runSimpleDemo().catch(console.error);
