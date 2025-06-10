/**
 * Set Project Tool - Single Responsibility
 * Only handles setting project context
 */

import { ProjectMemory } from '../project-memory.js';

export interface ProjectContext {
  name: string;
  githubRepo: string;
  organization: string;
  docsPath: string;
}

export class SetProjectTool {
  constructor(private projectMemory: ProjectMemory) {}

  async execute(args: { projectName: string; githubRepo: string; organization?: string }) {
    const { projectName, githubRepo, organization = "Infinisoft-inc" } = args;
    
    try {
      // Set project name in memory
      this.projectMemory.setName(projectName);
      
      // Create project context
      const context: ProjectContext = {
        name: projectName,
        githubRepo,
        organization,
        docsPath: `projects/${projectName.toLowerCase().replace(/\s+/g, '-')}/docs`
      };
      
      return {
        content: [{
          type: "text",
          text: `✅ **Project Context Set**\n\n**Project:** ${projectName}\n**Repository:** ${organization}/${githubRepo}\n**Docs Path:** ${context.docsPath}`
        }],
        context
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ Failed to set project: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  getSchema() {
    return {
      name: "set-project",
      description: "Set project context for document generation",
      inputSchema: {
        type: "object",
        properties: {
          projectName: { type: "string", description: "Name of the project" },
          githubRepo: { type: "string", description: "GitHub repository name" },
          organization: { type: "string", description: "GitHub organization", default: "Infinisoft-inc" }
        },
        required: ["projectName", "githubRepo"]
      }
    };
  }
}
