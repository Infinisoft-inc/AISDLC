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

// Simple in-memory storage for example data
const exampleStorage = new Map<string, any>();

class BaseMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "base-mcp-server",
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

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available prompts (1 example prompt)
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "example-prompt",
          description: "An example prompt to demonstrate MCP prompt functionality",
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === "example-prompt") {
        return {
          description: "Example prompt for demonstration",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `🤖 **Hello! This is an example MCP server.**

This is a demonstration of how prompts work in the Model Context Protocol.

**What this server provides:**
- 1 example tool (store-data)
- 1 example prompt (this one!)
- 1 example resource (example-data)

**You can customize this base server by:**
1. Adding your own tools in the tools array
2. Creating custom prompts for your use case
3. Providing resources that your AI can access

This is a clean starting template for building MCP servers!`,
              },
            },
          ],
        };
      }
      throw new Error(`Unknown prompt: ${request.params.name}`);
    });

    // List available tools (1 example tool)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "store-data",
          description: "Store example data with a key-value pair",
          inputSchema: {
            type: "object",
            properties: {
              key: {
                type: "string",
                description: "The key to store data under",
              },
              value: {
                type: "string",
                description: "The value to store",
              },
            },
            required: ["key", "value"],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "store-data") {
        const { key, value } = args as { key: string; value: string };

        // Store the data
        exampleStorage.set(key, {
          value,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Data stored successfully!\n\nKey: ${key}\nValue: ${value}\nTimestamp: ${new Date().toISOString()}`,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    // List available resources (1 example resource)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "example://data/storage",
          name: "Example Data Storage",
          description: "View all stored example data",
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "example://data/storage") {
        const allData = Object.fromEntries(exampleStorage);
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Base MCP Server running on stdio");
  }
}

const server = new BaseMCPServer();
server.run().catch(console.error);
