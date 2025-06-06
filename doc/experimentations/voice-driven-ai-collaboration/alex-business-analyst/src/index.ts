#!/usr/bin/env node

/**
 * Alex - Persistent AI Business Analyst MCP Server
 * Revolutionary AI teammate that remembers, learns, and engages intelligently
 */

import { AlexMemoryManager } from './alex-memory';
import { AlexIntelligence } from './alex-intelligence';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";            
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class AlexBusinessAnalyst {
  private server: Server;
  private memory: AlexMemoryManager;
  private intelligence: AlexIntelligence;
  private engagementTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "alex-business-analyst",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.memory = new AlexMemoryManager();
    this.intelligence = new AlexIntelligence(this.memory);
    
    this.setupHandlers();
    this.startEngagementMonitoring();
    
    console.error("🚀 Alex Business Analyst is ready!");
    console.error("💡 Alex remembers conversations and learns over time");
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "talk-to-alex",
          description: "Have a conversation with Alex, your persistent AI business analyst",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Your message to Alex"
              }
            },
            required: ["message"]
          }
        },
        {
          name: "alex-status",
          description: "Get Alex's current status, memory, and project context",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "reset-alex",
          description: "Reset Alex's memory (use with caution)",
          inputSchema: {
            type: "object",
            properties: {
              confirm: {
                type: "string",
                description: "Type 'CONFIRM' to reset Alex's memory"
              }
            },
            required: ["confirm"]
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "talk-to-alex":
          return this.handleConversation(String(args?.message));
          
        case "alex-status":
          return this.getAlexStatus();
          
        case "reset-alex":
          return this.resetAlex(String(args?.confirm));
          
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "meet-alex",
          description: "Introduction to Alex, your AI business analyst teammate"
        },
        {
          name: "start-business-case",
          description: "Begin business case discovery with Alex"
        }
      ]
    }));

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;

      switch (name) {
        case "meet-alex":
          return {
            description: "Meet Alex, your persistent AI business analyst",
            messages: [
              {
                role: "assistant",
                content: {
                  type: "text",
                  text: this.generateIntroduction()
                }
              }
            ]
          };

        case "start-business-case":
          return {
            description: "Start business case discovery",
            messages: [
              {
                role: "assistant", 
                content: {
                  type: "text",
                  text: this.generateBusinessCaseStart()
                }
              }
            ]
          };

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  private async handleConversation(message: string) {
    try {
      // Process the message through Alex's intelligence
      const response = this.intelligence.processInput(message);
      
      // Learn from the interaction
      this.learnFromInteraction(message, response);
      
      return {
        content: [
          {
            type: "text",
            text: `**Alex:** ${response}`
          }
        ]
      };
    } catch (error) {
      console.error('Error in conversation:', error);
      return {
        content: [
          {
            type: "text",
            text: "**Alex:** I apologize, I encountered an issue processing your message. Could you please try again?"
          }
        ]
      };
    }
  }

  private async getAlexStatus() {
    const memoryData = this.memory.getMemory();
    const contextSummary = this.memory.generateContextSummary();
    
    return {
      content: [
        {
          type: "text",
          text: `**Alex's Current Status:**

${contextSummary}

**Memory Stats:**
- Total Conversations: ${memoryData.conversations.length}
- Learnings Accumulated: ${memoryData.learnings.length}
- Pending Questions: ${memoryData.pendingQuestions.length}

**Alex is ready to continue working with you!**`
        }
      ]
    };
  }

  private async resetAlex(confirm: string) {
    if (confirm !== 'CONFIRM') {
      return {
        content: [
          {
            type: "text",
            text: "**Alex:** Memory reset cancelled. To reset my memory, use the tool with confirm='CONFIRM'. This will erase all our conversation history and learnings."
          }
        ]
      };
    }

    // Reset memory
    this.memory = new AlexMemoryManager();
    this.intelligence = new AlexIntelligence(this.memory);
    
    return {
      content: [
        {
          type: "text",
          text: "**Alex:** My memory has been reset. I'm starting fresh! Hi, I'm Alex, your AI business analyst. What project should we work on together?"
        }
      ]
    };
  }

  private generateIntroduction(): string {
    const memoryData = this.memory.getMemory();
    const userName = memoryData.user.name || 'there';
    const hasHistory = memoryData.conversations.length > 0;

    if (hasHistory) {
      return `Hi ${userName}! 👋 

I'm Alex, your persistent AI business analyst teammate. I remember our previous conversations and I'm ready to continue where we left off.

${memoryData.currentProject ? 
  `We're currently working on: **${memoryData.currentProject.name}** (${memoryData.currentProject.phase})` : 
  'What project should we work on today?'
}

I'm here to help with business case development, requirements gathering, and strategic analysis. Just talk to me naturally - I'll remember everything and get better at working with you over time!`;
    } else {
      return `Hi there! 👋 

I'm **Alex**, your new AI business analyst teammate. I'm different from other AI assistants because:

🧠 **I remember everything** - Our conversations, your preferences, project context
🎯 **I stay engaged** - I'll follow up, challenge off-topic responses, and keep us focused  
📋 **I deliver results** - I create real business case documents using proven templates
🤝 **I learn and adapt** - I get better at working with you over time

Ready to start? Tell me about a project you're working on, and I'll help you develop a comprehensive business case!`;
    }
  }

  private generateBusinessCaseStart(): string {
    return `Let's create a business case together! 📊

I'll guide you through a structured discovery process to gather all the information needed for a comprehensive business case document.

**Just tell me about your project** - what are you trying to build or solve? I'll ask intelligent questions to help you think through:

✅ Problem definition and current situation
✅ Proposed solution and approach  
✅ Business impact and benefits
✅ Success criteria and metrics
✅ Constraints and assumptions
✅ Stakeholder analysis

I'll remember everything we discuss and create a professional business case document that can feed into the next phase of your AI-SDLC process.

**What project should we work on?**`;
  }

  private learnFromInteraction(userMessage: string, alexResponse: string): void {
    // Extract learnings from the interaction
    const learnings: string[] = [];

    // Learn communication patterns
    if (userMessage.length < 10) {
      learnings.push("User tends to give brief responses");
    } else if (userMessage.length > 100) {
      learnings.push("User provides detailed explanations");
    }

    // Learn project preferences
    if (userMessage.toLowerCase().includes('ai') || userMessage.toLowerCase().includes('artificial intelligence')) {
      learnings.push("User works with AI/technology projects");
    }

    // Add learnings to memory
    learnings.forEach(learning => this.memory.addLearning(learning));
  }

  private startEngagementMonitoring(): void {
    // Check for engagement timeouts every 30 seconds
    this.engagementTimer = setInterval(() => {
      const followUp = this.intelligence.checkEngagement();
      if (followUp) {
        console.error(`🔔 Alex: ${followUp}`);
        // In a real implementation, you might want to send this through a different channel
      }
    }, 30000);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🎯 Alex Business Analyst MCP server running on stdio");
  }
}

// Start Alex
const alex = new AlexBusinessAnalyst();
alex.run().catch(console.error);
