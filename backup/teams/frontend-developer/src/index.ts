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

import { AITeammateMemoryManager } from './memory.js';
import { AITeammateTrainingSystem } from './training.js';

class AITeammateServer {
  private server: Server;
  private memory: AITeammateMemoryManager;
  private training: AITeammateTrainingSystem;
  private teammateName: string;
  private teammateRole: string;

  constructor(teammateName: string = "AITeammate", teammateRole: string = "AI Assistant") {
    this.teammateName = teammateName;
    this.teammateRole = teammateRole;

    this.server = new Server(
      {
        name: `${teammateName.toLowerCase()}-ai-teammate`,
        version: "2.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize AI teammate systems
    this.memory = new AITeammateMemoryManager(teammateName);
    this.training = new AITeammateTrainingSystem(this.memory, teammateName);

    this.setupHandlers();
  }

  /**
   * Generate intelligent response using LLM with teammate's context
   */
  private async generateIntelligentResponse(message: string, context: string): Promise<string> {
    // Get teammate's current memory and context
    const memoryData = this.memory.getMemory();
    const recentConversations = this.memory.getRecentConversations(5);

    // Build teammate's context for the LLM
    const teammateContext = this.buildTeammateContext(memoryData, recentConversations, context);

    // Create the prompt for the LLM
    const prompt = this.createTeammatePrompt(teammateContext, message);

    // Return the prompt for Augment Code to process
    return prompt;
  }

  private buildTeammateContext(memoryData: any, recentConversations: any[], context: string): string {
    return `
${this.teammateName.toUpperCase()}'S IDENTITY:
- Name: ${this.teammateName}, ${this.teammateRole}
- Personality: ${memoryData.identity.personality}
- Role: ${memoryData.identity.role}
- Capabilities: ${memoryData.identity.capabilities.join(', ')}

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

  private createTeammatePrompt(teammateContext: string, userMessage: string): string {
    return `You are ${this.teammateName}, ${this.teammateRole}. Respond to the user's message using your personality and knowledge.

${teammateContext}

USER MESSAGE: "${userMessage}"

Respond as ${this.teammateName} would, using your specific personality and expertise. Focus on your role and capabilities.

IMPORTANT: After generating your response, call the speech_response_talk tool with the format "${this.teammateName}: [your response]" to send it to the voice application with proper voice identification for unique TTS voices.`;
  }

  private setupHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: `${this.teammateName.toLowerCase()}-introduction`,
          description: `${this.teammateName}'s introduction and capabilities`,
        },
        {
          name: `${this.teammateName.toLowerCase()}-training-status`,
          description: `Check ${this.teammateName}'s AI-SDLC training completion status`,
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === `${this.teammateName.toLowerCase()}-introduction`) {
        const memoryData = this.memory.getMemory();
        const trainingCompleted = memoryData.aisdlcTraining.completed;

        return {
          description: `${this.teammateName}'s introduction and capabilities`,
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `🤖 **Hi, I'm ${this.teammateName}, your ${this.teammateRole}!**

${trainingCompleted ? '🎓 **Fully Trained & Ready**' : '⚠️ **Training Required**'}

**My Personality:**
- ${memoryData.identity.personality}
- Intelligent, context-aware communication
- Natural conversation capabilities

**My Capabilities:**
${memoryData.identity.capabilities.map(cap => `- ${cap}`).join('\n')}

**What I Can Do:**
- Engage in natural, intelligent conversation
- Maintain context across conversations
- Follow AI-SDLC methodology principles
- Provide role-specific expertise
- Collaborate effectively with humans and other AI teammates

${trainingCompleted ?
  "I'm ready to work with you! Let's collaborate effectively. 🚀" :
  "I need to complete my AI-SDLC training first. Use the 'complete-training' tool to get me ready!"}`,
              },
            },
          ],
        };
      }

      if (request.params.name === `${this.teammateName.toLowerCase()}-training-status`) {
        const status = this.training.getTrainingStatus();
        const memoryData = this.memory.getMemory();

        return {
          description: `${this.teammateName}'s training status`,
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `📚 **${this.teammateName}'s Training Status**

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
          description: `Complete ${this.teammateName}'s AI-SDLC methodology training`,
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: `chat-with-${this.teammateName.toLowerCase()}`,
          description: `Have a conversation with ${this.teammateName}`,
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: `Your message to ${this.teammateName}`,
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
          name: "get-status",
          description: `Get current status and ${this.teammateName}'s memory`,
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
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

      if (name === `chat-with-${this.teammateName.toLowerCase()}`) {
        const { message, context = "general" } = args as { message: string; context?: string };

        try {
          // Record the conversation
          this.memory.addConversation('human', message, context, 'medium');

          // Generate intelligent response using LLM with teammate's context
          const response = await this.generateIntelligentResponse(message, context);

          // Record teammate's response
          this.memory.addConversation('ai_teammate', response, context, 'medium');

          return {
            content: [
              {
                type: "text",
                text: `🤖 **${this.teammateName}:** ${response}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `🤖 **${this.teammateName}:** I apologize, I encountered an issue processing your message. Let me try a simpler response: I'm here to help! What can I assist you with?`,
              },
            ],
          };
        }
      }

      if (name === "get-status") {
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

      throw new Error(`Unknown tool: ${name}`);
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: `${this.teammateName.toLowerCase()}://memory/current`,
          name: `${this.teammateName}'s Current Memory`,
          description: `View ${this.teammateName}'s current memory state and context`,
          mimeType: "application/json",
        },
        {
          uri: `${this.teammateName.toLowerCase()}://training/status`,
          name: `${this.teammateName}'s Training Status`,
          description: `View ${this.teammateName}'s AI-SDLC training completion status`,
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === `${this.teammateName.toLowerCase()}://memory/current`) {
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

      if (uri === `${this.teammateName.toLowerCase()}://training/status`) {
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
    console.error(`${this.teammateName} AI Teammate MCP Server running on stdio`);
  }
}

// Default instantiation - customize for specific teammates
const server = new AITeammateServer("Riley", "AI Frontend Developer");
server.run().catch(console.error);
