/**
 * Generate Document Tool - Single Responsibility
 * Only handles document generation
 */

import { ProjectMemory } from '../project-memory.js';
import { PromptRegistry } from '../services/prompts/prompt-registry.js';

export class GenerateDocumentTool {
  constructor(
    private projectMemory: ProjectMemory,
    private promptRegistry: PromptRegistry
  ) {}

  async execute(args: { templateName: string; projectName?: string }) {
    const { templateName } = args;

    try {
      // Check if we have project information
      if (!this.projectMemory.hasInfo()) {
        throw new Error('No project information gathered yet. Please use the remember tool first.');
      }

      // Use MCP Prompt Registry instead of hardcoded prompts
      const promptResponse = this.promptRegistry.getPrompt('business-case-generation', {
        projectInfo: this.projectMemory.getAll(),
        templateType: templateName
      });

      return {
        content: [{
          type: "text",
          text: promptResponse.messages[0].content.text
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Failed to Generate Document**\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure you have provided project information using the remember tool.`
        }]
      };
    }
  }

  getSchema() {
    return {
      name: "generate-document",
      description: "Generate LLM prompt for document creation",
      inputSchema: {
        type: "object",
        properties: {
          templateName: {
            type: "string",
            description: "Document template name",
            enum: ["business-case", "requirements", "architecture"]
          },
          projectName: { type: "string", description: "Name of the project (optional)" }
        },
        required: ["templateName"]
      }
    };
  }
}
