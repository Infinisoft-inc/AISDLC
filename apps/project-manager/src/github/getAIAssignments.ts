import { Octokit } from '@octokit/rest';
import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';
import {
  getAIAssignments,
  getAllAIAssignments,
  type AITeammate,
  type ProjectItemAssignment
} from '@brainstack/github-service';

export interface AIAssignmentQuery {
  projectId: string;
  aiTeammate?: AITeammate;
  organization?: string;
}

export interface AIAssignmentResult {
  success: boolean;
  data?: {
    assignments: ProjectItemAssignment[];
    summary: string;
  };
  error?: string;
}

/**
 * Get AI teammate assignments from a GitHub project
 */
export async function getAITeammateAssignments(
  data: AIAssignmentQuery,
  memory: JordanMemoryManager
): Promise<AIAssignmentResult> {
  const { projectId, aiTeammate, organization = "Infinisoft-inc" } = data;

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
    
    // Debug: Check if octokit is properly initialized
    if (!octokit || !octokit.rest) {
      throw new Error('GitHub client not properly initialized');
    }

    let assignmentsResult;
    let summary: string;

    if (aiTeammate) {
      // Get assignments for specific AI teammate
      assignmentsResult = await getAIAssignments(octokit, projectId, aiTeammate);
      if (!assignmentsResult.success || !assignmentsResult.data) {
        throw new Error(`Failed to get assignments for ${aiTeammate}: ${assignmentsResult.error}`);
      }

      const assignments = assignmentsResult.data;
      summary = `## 🎯 ${aiTeammate}'s AI-SDLC Assignments

**Project:** ${projectId}
**Total Tasks:** ${assignments.length}

### 📋 Your Current Tasks:
${assignments.map((assignment, index) => `
${index + 1}. **Issue #${assignment.issueNumber}:** ${assignment.title}
   - **URL:** ${assignment.url}
   - **Status:** Ready for work
`).join('')}

### 🚀 Next Steps:
${assignments.length > 0 ? 
  `Start with Issue #${assignments[0].issueNumber}: ${assignments[0].title}` : 
  'No tasks currently assigned to you.'
}

**AI-SDLC Workflow:** Follow the task descriptions for detailed requirements and deliverables.`;

    } else {
      // Get all assignments
      assignmentsResult = await getAllAIAssignments(octokit, projectId);
      if (!assignmentsResult.success || !assignmentsResult.data) {
        throw new Error(`Failed to get all assignments: ${assignmentsResult.error}`);
      }

      const assignments = assignmentsResult.data;
      
      // Group by AI teammate
      const groupedAssignments = assignments.reduce((groups, assignment) => {
        const teammate = assignment.aiTeammate || 'Unassigned';
        if (!groups[teammate]) {
          groups[teammate] = [];
        }
        groups[teammate].push(assignment);
        return groups;
      }, {} as Record<string, ProjectItemAssignment[]>);

      summary = `## 📊 AI-SDLC Project Assignment Overview

**Project:** ${projectId}
**Total Tasks:** ${assignments.length}

### 👥 Assignments by AI Teammate:
${Object.entries(groupedAssignments).map(([teammate, tasks]) => `
**${teammate}:** ${tasks.length} task${tasks.length !== 1 ? 's' : ''}
${tasks.map(task => `  - Issue #${task.issueNumber}: ${task.title}`).join('\n')}
`).join('')}

### 🎯 Project Status:
- **Sarah (Business Analyst):** ${groupedAssignments['Sarah']?.length || 0} tasks
- **Alex (Architect):** ${groupedAssignments['Alex']?.length || 0} tasks  
- **Jordan (Project Manager):** ${groupedAssignments['Jordan']?.length || 0} tasks
- **Human Review:** ${groupedAssignments['Human Review']?.length || 0} tasks
- **Unassigned:** ${groupedAssignments['Unassigned']?.length || 0} tasks`;
    }

    // Update memory with assignment query
    memory.updateProject({
      name: `Project ${projectId}`,
      phase: "Assignment Query",
      status: "Active",
      currentFocus: aiTeammate ? `${aiTeammate} assignments` : "All assignments",
      projectUrl: `Project ID: ${projectId}`
    });

    return {
      success: true,
      data: {
        assignments: assignmentsResult.data,
        summary
      }
    };

  } catch (error) {
    console.error('AI assignment query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
