/**
 * MCP Server
 * Single responsibility: Pure MCP server setup and configuration
 */

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

import { JordanMemoryManager } from '../memory.js';
import { JordanTrainingSystem } from '../training.js';
import { toolSchemas, handleToolCall } from '../tools/index.js';
import { promptSchemas, handlePromptRequest } from '../prompts/index.js';

export class JordanMCPServer {
  private server: Server;
  private memory: JordanMemoryManager;
  private training: JordanTrainingSystem;

  constructor() {
    this.server = new Server(
      {
        name: "jordan-project-manager",
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

    // Initialize Jordan's systems
    this.memory = new JordanMemoryManager();
    this.training = new JordanTrainingSystem(this.memory);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: promptSchemas,
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      return handlePromptRequest(request.params.name, {
        memory: this.memory,
        training: this.training
      });
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolSchemas,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return handleToolCall(name, args, {
        memory: this.memory,
        training: this.training
      });
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
