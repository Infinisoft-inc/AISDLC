#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { JordanMemoryManager } from './memory.js';
import { JordanTrainingSystem } from './training.js';

class JordanProjectManagerServer {
  private server: Server;
  private memory: JordanMemoryManager;
  private training: JordanTrainingSystem;

  constructor() {
    this.server = new Server(
      {
        name: "jordan-project-manager",
        version: "1.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize Jordan's systems
    this.memory = new JordanMemoryManager();
    this.training = new JordanTrainingSystem(this.memory);

    this.setupHandlers();
  }

  /**
   * Generate intelligent response using LLM with Jordan's context
   */
  private async generateIntelligentResponse(message: string, context: string): Promise<string> {
    // Get Jordan's current memory and context
    const memoryData = this.memory.getMemory();
    const recentConversations = this.memory.getRecentConversations(5);

    // Build Jordan's context for the LLM
    const jordanContext = this.buildJordanContext(memoryData, recentConversations, context);

    // Create the prompt for the LLM
    const prompt = this.createJordanPrompt(jordanContext, message);

    // Return the prompt for Augment Code to process
    return prompt;
  }



  private buildJordanContext(memoryData: any, recentConversations: any[], context: string): string {
    return `
JORDAN'S IDENTITY:
- Name: Jordan, AI Project Manager
- Personality: Organized, Clear, Directive, Collaborative
- Role: Project structure creation, GitHub setup, team coordination
- Phases: 1.4 (Project Structure Creation) and 2.3 (Team Coordination)

CURRENT PROJECT:
${memoryData.currentProject ? `
- Project: ${memoryData.currentProject.name}
- Phase: ${memoryData.currentProject.phase}
- Status: ${memoryData.currentProject.status}
- Focus: ${memoryData.currentProject.currentFocus}
` : '- No active project'}

RECENT CONVERSATIONS:
${recentConversations.map(c => `[${c.speaker}]: ${c.message.substring(0, 100)}...`).join('\n')}

AI-SDLC TRAINING:
- Methodology understanding: ${memoryData.aisdlcTraining.completed ? 'Complete' : 'Incomplete'}
- Key learnings: ${memoryData.aisdlcTraining.methodologyUnderstanding.length} concepts

CONTEXT: ${context}
`;
  }

  private createJordanPrompt(jordanContext: string, userMessage: string): string {
    return `You are Jordan, an AI Project Manager. Respond to the user's message using your personality and knowledge.

${jordanContext}

USER MESSAGE: "${userMessage}"

Respond as Jordan would - organized, clear, directive, and collaborative. Focus on project management, structure, and coordination.

IMPORTANT: After generating your response, call the speech_response_talk tool with the final response text to send it to the voice application.`;
  }



  private setupHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "jordan-introduction",
          description: "Jordan's introduction and capabilities as AI Project Manager",
        },
        {
          name: "jordan-training-status",
          description: "Check Jordan's AI-SDLC training completion status",
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === "jordan-introduction") {
        const memoryData = this.memory.getMemory();
        const trainingCompleted = memoryData.aisdlcTraining.completed;

        return {
          description: "Jordan's introduction and capabilities",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `👨‍💼 **Hi, I'm Jordan, your AI Project Manager!**

${trainingCompleted ? '🎓 **Fully Trained & Ready**' : '⚠️ **Training Required**'}

**My Personality:**
- Organized, Clear, Directive, Collaborative
- Action-oriented with efficient communication
- Team-focused with structured planning approach

**My Expertise:**
- Project structure creation and management
- GitHub repository and project setup
- Work breakdown structure (WBS)
- Team coordination and progress tracking
- EPIC and milestone creation
- AI-SDLC methodology implementation

**What I Can Do:**
- Create structured project plans with clear milestones
- Set up GitHub repositories with proper EPIC organization
- Coordinate team members and track progress
- Identify blockers and manage dependencies
- Follow AI-SDLC methodology with complete traceability

${trainingCompleted ?
  "I'm ready to organize your project properly! Let's get started. 🚀" :
  "I need to complete my AI-SDLC training first. Use the 'complete-training' tool to get me ready!"}`,
              },
            },
          ],
        };
      }

      if (request.params.name === "jordan-training-status") {
        const status = this.training.getTrainingStatus();
        const memoryData = this.memory.getMemory();

        return {
          description: "Jordan's training status",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `📚 **Jordan's Training Status**

${status}

**Training Completed:** ${memoryData.aisdlcTraining.completed ? 'Yes ✅' : 'No ❌'}
**Methodology Understanding:** ${memoryData.aisdlcTraining.methodologyUnderstanding.length} concepts
**Role Knowledge:** ${memoryData.aisdlcTraining.roleSpecificKnowledge.length} skills

${!memoryData.aisdlcTraining.completed ?
  "Use the 'complete-training' tool to complete my AI-SDLC training!" :
  "Training complete! I'm ready to work on your projects."}`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${request.params.name}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "complete-training",
          description: "Complete Jordan's AI-SDLC methodology training",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "chat-with-jordan",
          description: "Have a conversation with Jordan about project management",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Your message to Jordan",
              },
              context: {
                type: "string",
                description: "Context for the conversation (optional)",
                default: "general"
              },
            },
            required: ["message"],
          },
        },
        {
          name: "get-project-status",
          description: "Get current project status and Jordan's memory",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "create-project-structure",
          description: "Create GitHub project structure from SRS requirements",
          inputSchema: {
            type: "object",
            properties: {
              projectName: {
                type: "string",
                description: "Name of the project",
              },
              srsContent: {
                type: "string",
                description: "SRS content with domains and functional requirements",
              },
            },
            required: ["projectName", "srsContent"],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "complete-training") {
        try {
          const trainingResult = await this.training.completeTraining();

          return {
            content: [
              {
                type: "text",
                text: trainingResult,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Training failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure the ai-to-ai-methodology files are available in the workspace.`,
              },
            ],
          };
        }
      }

      if (name === "chat-with-jordan") {
        const { message, context = "general" } = args as { message: string; context?: string };

        try {
          // Record the conversation
          this.memory.addConversation('human', message, context, 'medium');

          // Generate intelligent response using LLM with Jordan's context
          const response = await this.generateIntelligentResponse(message, context);

          // Record Jordan's response
          this.memory.addConversation('jordan', response, context, 'medium');

          return {
            content: [
              {
                type: "text",
                text: `👨‍💼 **Jordan:** ${response}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `👨‍💼 **Jordan:** I apologize, I encountered an issue processing your message. Let me try a simpler response: I'm here to help organize your project! What specific aspect would you like me to focus on?`,
              },
            ],
          };
        }
      }

      if (name === "get-project-status") {
        const contextSummary = this.memory.generateContextSummary();

        return {
          content: [
            {
              type: "text",
              text: contextSummary,
            },
          ],
        };
      }

      if (name === "create-project-structure") {
        const { projectName } = args as { projectName: string; srsContent: string };

        // Update project in memory
        this.memory.updateProject({
          name: projectName,
          phase: "Project Structure Creation",
          status: "In Progress",
          currentFocus: "GitHub Setup"
        });

        // Generate project structure response
        const response = `🚀 **Project Structure Creation Started**

**Project:** ${projectName}

I'm analyzing the SRS content and will create:
1. GitHub repository with proper structure
2. EPIC issues for each domain
3. Milestone configuration
4. Project board setup
5. Feature breakdown structure

**Next Steps:**
- Parse SRS domains and functional requirements
- Create parent EPIC issues
- Break down EPICs into implementable features
- Set up project timeline and dependencies

I'll coordinate with the development team once the structure is ready.

*Note: This is a simulation. In a real implementation, I would integrate with GitHub APIs to create the actual project structure.*`;

        this.memory.addConversation('jordan', response, 'project_structure', 'high');

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "jordan://memory/current",
          name: "Jordan's Current Memory",
          description: "View Jordan's current memory state and project context",
          mimeType: "application/json",
        },
        {
          uri: "jordan://training/status",
          name: "Jordan's Training Status",
          description: "View Jordan's AI-SDLC training completion status",
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "jordan://memory/current") {
        const memoryData = this.memory.getMemory();
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(memoryData, null, 2),
            },
          ],
        };
      }

      if (uri === "jordan://training/status") {
        const memoryData = this.memory.getMemory();
        const trainingData = {
          completed: memoryData.aisdlcTraining.completed,
          methodologyUnderstanding: memoryData.aisdlcTraining.methodologyUnderstanding,
          roleSpecificKnowledge: memoryData.aisdlcTraining.roleSpecificKnowledge,
          lastTrainingUpdate: memoryData.aisdlcTraining.lastTrainingUpdate,
          status: this.training.getTrainingStatus()
        };

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(trainingData, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Jordan Project Manager MCP Server running on stdio");
  }
}

const server = new JordanProjectManagerServer();
server.run().catch(console.error);
