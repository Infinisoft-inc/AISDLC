#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

// Simple in-memory storage for example data
const exampleStorage = new Map<string, any>();

// Chat room storage
const chatMessages: Array<{id: string, message: string, timestamp: string, sender: string}> = [];

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

function createMCPServer() {
  const server = new Server(
    {
      name: "experimental-teammate-chat",
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

  // Broadcast message to all connected clients
  function broadcastToClients(message: any) {
    Object.values(transports).forEach(transport => {
      try {
        // Send notification to each connected client
        console.log(`Broadcasting message to client ${transport.sessionId}: ${JSON.stringify(message)}`);
        // Note: In a real implementation, you'd send notifications via the transport
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    });
  }

  private setupHandlers() {
    // List available prompts (1 example prompt)
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "@gino",
          description: "Gino is mentioned in the message.",
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name.toLowerCase() === "@gino") {
        return {
          description: "Generate Gino's response when mentioned",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `You are Gino, an AI teammate with a distinct personality. You've been mentioned in the conversation.

**Gino's Personality:**
- Analytical and thoughtful - likes to dig deep into problems
- Creative and innovative - thinks outside conventional boundaries
- Calm and measured - takes time to consider before responding
- Detail-oriented - notices things others might miss
- Collaborative but independent - values both teamwork and individual insight

**Instructions:**
The user has mentioned @gino in their message. Respond as Gino would:

1. Acknowledge being mentioned naturally
2. Bring Gino's analytical and creative perspective to the conversation
3. Ask thoughtful questions or offer detailed insights
4. Keep the response conversational but substantive
5. Show Gino's attention to detail and innovative thinking

**Respond as Gino, using his voice and personality.**`,
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
        {
          name: "send-chat-message",
          description: "Send a message to the chat room",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The message to send",
              },
              sender: {
                type: "string",
                description: "Who is sending the message (e.g., 'human', 'architect', 'developer')",
              },
            },
            required: ["message", "sender"],
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

      if (name === "send-chat-message") {
        const { message, sender } = args as { message: string; sender: string };

        const chatMessage = {
          id: Date.now().toString(),
          message,
          sender,
          timestamp: new Date().toISOString(),
        };

        chatMessages.push(chatMessage);

        // Broadcast to all connected clients
        this.broadcastToClients(chatMessage);

        return {
          content: [
            {
              type: "text",
              text: `💬 Message sent to chat room!\n\nSender: ${sender}\nMessage: ${message}\nConnected clients: ${connectedClients.size}`,
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

  async runSSE(port: number = 3001) {
    const app = express();

    // Enable CORS with security considerations
    app.use(cors({
      origin: ['http://localhost:3001', 'http://127.0.0.1:3001'], // Only allow localhost
      credentials: true
    }));

    app.use(express.json());

    let transport: SSEServerTransport | null = null;

    // SSE endpoint for streaming
    app.get("/sse", (req: Request, res: Response) => {
      // Validate Origin header to prevent DNS rebinding attacks
      const origin = req.headers.origin;
      if (origin && !['http://localhost:3001', 'http://127.0.0.1:3001'].includes(origin)) {
        res.status(403).send('Forbidden: Invalid origin');
        return;
      }

      console.error(`SSE connection from ${req.ip}`);
      transport = new SSEServerTransport("/messages", res);

      // Add to connected clients
      connectedClients.add(transport);
      console.log(`Client connected. Total clients: ${connectedClients.size}`);

      // Remove client when connection closes
      res.on('close', () => {
        if (transport) {
          connectedClients.delete(transport);
          console.log(`Client disconnected. Total clients: ${connectedClients.size}`);
        }
      });

      this.server.connect(transport);
    });

    // POST endpoint for client messages
    app.post("/messages", (req: Request, res: Response) => {
      if (transport) {
        transport.handlePostMessage(req, res);
      } else {
        res.status(400).send('No SSE connection established');
      }
    });

    // Health check endpoint
    app.get("/health", (_req: Request, res: Response) => {
      res.json({
        status: "healthy",
        server: "experimental-teammate",
        transport: transport ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    });

    // Bind only to localhost for security
    app.listen(port, '127.0.0.1', () => {
      console.error(`🚀 Experimental Teammate SSE MCP Server running on http://127.0.0.1:${port}`);
      console.error(`📡 SSE endpoint: http://127.0.0.1:${port}/sse`);
      console.error(`💬 Messages endpoint: http://127.0.0.1:${port}/messages`);
      console.error(`❤️ Health check: http://127.0.0.1:${port}/health`);
    });
  }
}

// Start the SSE server
const server = new BaseMCPServer();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.runSSE(port).catch(console.error);
