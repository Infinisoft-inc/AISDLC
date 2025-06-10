/**
 * Remember Tool - Single Responsibility
 * Only handles remembering project information
 */

import { ProjectMemory } from '../project-memory.js';

export class RememberTool {
  constructor(private projectMemory: ProjectMemory) {}

  async execute(args: { information: string }) {
    const { information } = args;
    
    try {
      this.projectMemory.add(information);
      
      return {
        content: [{
          type: "text",
          text: `✅ **Information Remembered**\n\nSaved: "${information}"`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text", 
          text: `❌ Failed to remember: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  getSchema() {
    return {
      name: "remember",
      description: "Save important project information",
      inputSchema: {
        type: "object",
        properties: {
          information: { type: "string", description: "Information to remember" }
        },
        required: ["information"]
      }
    };
  }
}
