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
import { loadPersona, type Persona } from "@brainstack/awareness";
import { createDiscoveryPrompt } from "@brainstack/conversation";
import {
  storeBusinessCase,
  recallBusinessCase,
  listBusinessCases,
} from "./memory";
import {
  businessCaseTools,
  toolsToMCPSchemas,
  parseBusinessCase,
  BusinessCase
} from "@brainstack/ai-sdlc";

class AIBusinessAnalystServer {
  private server: Server;
  private persona: Persona;

  constructor() {
    // Load persona configuration
    this.persona = this.loadPersona();

    this.server = new Server(
      {
        name: this.persona?.memory_scope || "ai-business-analyst",
        version: "0.1.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private loadPersona(): Persona {
    const path = require('path');
    const personaPath = path.join(__dirname, '../config/persona.json');

    const defaultPersona: Persona = {
      name: "Alex",
      title: "AI Business Analyst",
      description: "Conducts business case discovery and requirements gathering",
      tone: "structured and inquisitive",
      avatar: "📊",
      memory_scope: "business-analysis"
    };

    return loadPersona(personaPath, defaultPersona);
  }

  private setupHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "start-business-case",
          description: "Start a structured business case discovery conversation",
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === "start-business-case") {
        return {
          description: "Start business case discovery",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: createDiscoveryPrompt(this.persona),
              },
            },
          ],
        };
      }
      throw new Error(`Unknown prompt: ${request.params.name}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolsToMCPSchemas(businessCaseTools as any)
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "store-business-case") {
        // Parse and validate the arguments
        const parsed = parseBusinessCase(args);

        // Use the external tool for validation but integrate with memory
        const tool = businessCaseTools.find(t => t.name === name);
        if (!tool) {
          throw new Error(`Tool not found: ${name}`);
        }

        // Execute the tool to get the result
        const result = await tool.execute(parsed);

        // Also store in memory for persistence
        await storeBusinessCase(parsed);

        return {
          content: [
            {
              type: "text",
              text: `✅ Business case stored successfully:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      if (name === "summarize-business-case") {
        const { projectId } = args as { projectId: string };

        // Get data from memory
        const memoryResult = await recallBusinessCase(projectId);

        if (!memoryResult.success || !memoryResult.data) {
          return {
            content: [
              {
                type: "text",
                text: `❌ No business case data found for project: ${projectId}`,
              },
            ],
          };
        }

        // Generate summary using local method
        const summary = this.generateBusinessCaseSummary(memoryResult.data as BusinessCase);

        return {
          content: [
            {
              type: "text",
              text: summary,
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
          uri: "memory://business-case/context",
          name: "Business Case Context",
          description: "Current business case discovery context and stored answers",
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "memory://business-case/context") {
        const result = await listBusinessCases();
        const allData = result.success ? result.data : [];
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(allData, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private generateBusinessCaseSummary(data: BusinessCase): string {
    const { problem, stakeholders, outcomes, timeline, budget, constraints } = data;

    return `# Business Case Summary

## Problem Statement
${problem || "Not yet defined"}

## Stakeholders
${stakeholders || "Not yet identified"}

## Expected Outcomes
${outcomes || "Not yet defined"}

## Timeline
${timeline || "Not yet specified"}

## Budget Considerations
${budget || "Not yet discussed"}

## Constraints
${constraints || "Not yet identified"}

---

**Status**: ${this.getCompletionStatus(data)}

*This is a preliminary business case summary. Continue the discovery process to refine and complete all sections.*`;
  }

  private getCompletionStatus(data: BusinessCase): string {
    const fields = ['problem', 'stakeholders', 'outcomes', 'timeline', 'budget', 'constraints'];
    const completed = fields.filter(field => data[field as keyof BusinessCase]).length;
    return `${completed}/${fields.length} sections completed`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AI Business Analyst MCP server running on stdio");
  }
}

const server = new AIBusinessAnalystServer();
server.run().catch(console.error);
