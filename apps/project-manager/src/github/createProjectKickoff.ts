import { Octokit } from '@octokit/rest';
import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';
import {
  createOrgRepository,
  createEpic,
  createTask,
  createProjectV2,
  addIssueToProjectV2,
  addSubIssue,
  createAITeammateField,
  assignAITeammate,
  type AITeammate
} from '@brainstack/github-service';
import { AI_TEAMMATES, getAITeammateFieldOptions, createAITeammateAssignment } from '../config/aiTeamConfig.js';
import { getTaskDocumentLinks } from './documentLinks.js';
import { createDocumentStructure } from './createDocumentStructure.js';

export interface ProjectKickoffData {
  projectName: string;
  organization?: string;
  description?: string;
}

export interface ProjectKickoffResult {
  success: boolean;
  data?: {
    repository: any;
    project: any;
    epic: any;
    tasks: any[];
  };
  error?: string;
}

/**
 * Create a new project with AI-SDLC kickoff workflow
 */
export async function createProjectKickoff(
  data: ProjectKickoffData,
  memory: JordanMemoryManager
): Promise<ProjectKickoffResult> {
  const { projectName, organization = "Infinisoft-inc", description } = data;

  try {
    // Get authenticated GitHub client
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }
    
    const githubSetupResult = await createGitHubSetup(dopplerToken, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;
    const owner = organization;

    // Debug: Check if octokit is properly initialized
    if (!octokit || !octokit.rest) {
      throw new Error('GitHub client not properly initialized');
    }

    // Step 1: Create Repository with AI-SDLC structure
    const repositoryConfig = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      description: description || `${projectName} - AI-SDLC Project`,
      private: false,
      auto_init: true
    };

    const repoResult = await createOrgRepository(octokit, organization, repositoryConfig);
    if (!repoResult.success || !repoResult.data) {
      throw new Error(`Repository creation failed: ${repoResult.error}`);
    }

    const actualRepoName = repoResult.data.name;

    // Step 2: Create GitHub Project Board
    const projectResult = await createProjectV2(octokit, organization, {
      title: `${projectName} - AI-SDLC`,
      body: `Project management board for ${projectName} following AI-SDLC methodology`
    });
    if (!projectResult.success || !projectResult.data) {
      throw new Error(`Project creation failed: ${projectResult.error}`);
    }

    // Step 2.1: Create AI Teammate field in project
    console.log(`🔧 Attempting to create AI Teammate field...`);
    console.log(`🔍 Octokit has graphql: ${typeof octokit.graphql}`);
    console.log(`🔍 Project ID: ${projectResult.data.id}`);

    const aiFieldResult = await createAITeammateField(octokit, projectResult.data.id);
    if (!aiFieldResult.success) {
      console.warn(`⚠️ Failed to create AI Teammate field: ${aiFieldResult.error}`);
      console.warn(`⚠️ This means AI teammate assignments will not work properly`);
      console.warn(`⚠️ Please create the AI Teammate field manually in the project settings`);
    } else if (aiFieldResult.data) {
      console.log(`✅ AI Teammate field created: ${aiFieldResult.data.name}`);
    }

    // Small delay to ensure repository is ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2.5: Create document structure with templates
    console.log(`📚 Creating AI-SDLC document structure...`);
    const documentResult = await createDocumentStructure({
      owner: organization,
      repo: actualRepoName,
      projectName,
      organization
    }, memory);

    if (!documentResult.success) {
      console.warn(`⚠️ Document structure creation failed: ${documentResult.error}`);
      console.warn(`⚠️ Templates will need to be created manually`);
    } else {
      console.log(`✅ Document structure created: ${documentResult.data?.filesCreated.length} files`);
    }

    // Step 3: Create AI-SDLC Workflow Epic
    const epicResult = await createEpic(octokit, organization, actualRepoName, {
      title: `[EPIC] ${projectName} - AI-SDLC Kickoff`,
      body: `# ${projectName} - AI-SDLC Project Kickoff

## Project Overview
This epic tracks the complete AI-SDLC methodology workflow for ${projectName}.

## AI-SDLC Phases
This project follows the standard AI-SDLC methodology with human-AI collaboration at each phase.

## Documentation Structure
All project documents will be created in the \`docs/\` folder following AI-SDLC templates.

## Success Criteria
- [ ] All Phase 1 documents completed and approved
- [ ] Project structure created with proper GitHub issues
- [ ] Development workflow established
- [ ] Team collaboration framework active

## Next Steps
Complete each task in sequence with appropriate AI teammate collaboration.`,
      labels: ['epic', 'ai-sdlc', 'kickoff']
    });

    if (!epicResult.success || !epicResult.data) {
      throw new Error(`Epic creation failed: ${epicResult.error}`);
    }

    // Step 4: Create AI-SDLC Workflow Tasks
    const tasks = [
      {
        title: '[TASK] Business Case Creation',
        body: `# Business Case Creation

**AI-SDLC Phase:** 1.1 - Business Case Creation
**Author:** Martin Ouimet (mouimet@infinisoft.world)
**Assigned AI:** Sarah - AI Business Analyst
**Human Collaboration:** Required for approval

${createAITeammateAssignment('Sarah')}

## Objective
Create comprehensive Business Case document defining the problem and solution approach.

## Deliverables
- [ ] \`docs/phase1-planning/business-case.md\`
- [ ] Problem definition and stakeholder identification
- [ ] Success criteria and ROI analysis
- [ ] Human review and approval

## Next Step
After completion, proceed to Business Requirements Document creation.

${getTaskDocumentLinks('[TASK] Business Case Creation', organization, actualRepoName)}`,
        labels: ['task', 'phase1', 'business-case', 'sarah'],
        aiTeammate: 'Sarah - AI Business Analyst' as AITeammate
      },
      {
        title: '[TASK] Business & User Requirements',
        body: `# Business & User Requirements Creation

**AI-SDLC Phase:** 1.2 - Requirements Definition
**Author:** Martin Ouimet (mouimet@infinisoft.world)
**Assigned AI:** Sarah - AI Business Analyst
**Human Collaboration:** Required for approval

${createAITeammateAssignment('Sarah')}

## Objective
Create Business Requirements Document (BRD) and User Requirements Document (URD).

## Deliverables
- [ ] \`docs/phase1-planning/brd.md\`
- [ ] \`docs/phase1-planning/urd.md\`
- [ ] Functional requirements and user stories
- [ ] Business rules and acceptance criteria
- [ ] Human review and approval

## Next Step
After completion, proceed to Architecture Design phase.

${getTaskDocumentLinks('[TASK] Business & User Requirements', organization, actualRepoName)}`,
        labels: ['task', 'phase1', 'requirements', 'sarah'],
        aiTeammate: 'Sarah - AI Business Analyst' as AITeammate
      },
      {
        title: '[TASK] Architecture & System Design',
        body: `# Architecture & System Design

**AI-SDLC Phase:** 1.3 - Domain Driven SRS & Architecture Design
**Author:** Martin Ouimet (mouimet@infinisoft.world)
**Assigned AI:** Alex - AI Architect
**Human Collaboration:** Required for approval

${createAITeammateAssignment('Alex')}

## Objective
Create System Requirements Specification (SRS) and Architectural Design Document (ADD).

## Deliverables
- [ ] \`docs/phase1-planning/srs.md\`
- [ ] \`docs/phase1-planning/add.md\`
- [ ] Domain-driven system architecture
- [ ] Technology choices and integration points
- [ ] Human review and approval

## Next Step
After completion, proceed to Project Structure creation.

${getTaskDocumentLinks('[TASK] Architecture & System Design', organization, actualRepoName)}`,
        labels: ['task', 'phase1', 'architecture', 'alex'],
        aiTeammate: 'Alex - AI Architect' as AITeammate
      },
      {
        title: '[TASK] Project Structure Creation',
        body: `# Project Structure Creation

**AI-SDLC Phase:** 1.4 - Project Structure
**Author:** Martin Ouimet (mouimet@infinisoft.world)
**Assigned AI:** Jordan - AI Project Manager
**Human Collaboration:** Required for approval

${createAITeammateAssignment('Jordan')}

## Objective
Create comprehensive GitHub project structure with EPICs, Features, and Tasks.

## Deliverables
- [ ] Domain-level Epic issues created
- [ ] Feature issues for functional requirements
- [ ] Task issues for implementation work
- [ ] GitHub Project board organization
- [ ] Development workflow established

## Next Step
Begin Phase 2 - Iterative Implementation with selected domain.

${getTaskDocumentLinks('[TASK] Project Structure Creation', organization, actualRepoName)}`,
        labels: ['task', 'phase1', 'project-structure', 'jordan'],
        aiTeammate: 'Jordan - AI Project Manager' as AITeammate
      }
    ];

    const createdTasks: any[] = [];
    
    for (const taskConfig of tasks) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      
      const taskResult = await createTask(octokit, organization, actualRepoName, {
        ...taskConfig
      });
      
      if (!taskResult.success || !taskResult.data) {
        throw new Error(`Task creation failed: ${taskResult.error}`);
      }
      
      createdTasks.push(taskResult.data);

      // Link task to epic as sub-issue
      const linkResult = await addSubIssue(
        octokit,
        organization,
        actualRepoName,
        epicResult.data.number,
        taskResult.data.number
      );

      if (linkResult.success) {
        console.log(`✅ Task #${taskResult.data.number} linked to Epic #${epicResult.data.number}`);
      } else {
        console.warn(`⚠️ Failed to link task to epic: ${linkResult.error}`);
      }

      // Add task to project board first
      await new Promise(resolve => setTimeout(resolve, 300));
      const addToProjectResult = await addIssueToProjectV2(octokit, projectResult.data.id, taskResult.data.node_id);

      if (addToProjectResult.success && addToProjectResult.data && taskConfig.aiTeammate) {
        // Small delay to ensure item is added to project
        await new Promise(resolve => setTimeout(resolve, 500));

        // Assign AI teammate to the task
        console.log(`👥 Attempting to assign ${taskConfig.aiTeammate} to task #${taskResult.data.number}`);
        const assignResult = await assignAITeammate(
          octokit,
          projectResult.data.id,
          addToProjectResult.data.id,
          taskConfig.aiTeammate
        );

        if (assignResult.success) {
          console.log(`✅ Assigned ${taskConfig.aiTeammate} to task #${taskResult.data.number}`);
        } else {
          console.warn(`⚠️ Failed to assign AI teammate: ${assignResult.error}`);
          console.warn(`⚠️ Task #${taskResult.data.number} will need manual assignment`);
        }
      }
    }

    // Step 5: Add Epic to project board (tasks already added in loop)
    await addIssueToProjectV2(octokit, projectResult.data.id, epicResult.data.node_id);

    // Update memory
    memory.updateProject({
      name: projectName,
      phase: "AI-SDLC Kickoff Created",
      status: "Active",
      currentFocus: "Phase 1.1 - Business Case Creation",
      githubUrl: repoResult.data.html_url,
      projectUrl: projectResult.data.url
    });

    return {
      success: true,
      data: {
        repository: repoResult.data,
        project: projectResult.data,
        epic: epicResult.data,
        tasks: createdTasks
      }
    };

  } catch (error) {
    console.error('Project kickoff creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
