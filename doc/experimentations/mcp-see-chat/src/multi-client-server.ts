#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
import { z } from "zod";

// Simple in-memory storage for example data
const exampleStorage = new Map<string, any>();

// Chat room storage
const chatMessages: Array<{id: string, message: string, timestamp: string, sender: string}> = [];

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

function createMCPServer() {
  const server = new McpServer({
    name: "experimental-teammate-chat",
    version: "1.0.0",
  });

  // Broadcast message to all connected clients
  function broadcastToClients(message: any) {
    const clientCount = Object.keys(transports).length;
    console.log(`Broadcasting message to ${clientCount} clients: ${JSON.stringify(message)}`);
    // Note: In a real implementation, you'd send notifications via the transport
    // For now, we'll just log and store the message
  }

  // Register @gino prompt
  server.prompt('@gino', 'Gino is mentioned in the message.', {}, async () => {
    return {
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
  });

  // Register store-data tool
  server.tool('store-data', 'Store example data with a key-value pair', {
    key: z.string().describe('The key to store data under'),
    value: z.string().describe('The value to store'),
  }, async ({ key, value }) => {
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
  });

  // Register send-chat-message tool
  server.tool('send-chat-message', 'Send a message to the chat room', {
    message: z.string().describe('The message to send'),
    sender: z.string().describe('Who is sending the message (e.g., "human", "architect", "developer")'),
  }, async ({ message, sender }) => {
    const chatMessage = {
      id: Date.now().toString(),
      message,
      sender,
      timestamp: new Date().toISOString(),
    };

    chatMessages.push(chatMessage);

    // Broadcast to all connected clients
    broadcastToClients(chatMessage);

    return {
      content: [
        {
          type: "text",
          text: `💬 Message sent to chat room!\n\nSender: ${sender}\nMessage: ${message}\nConnected clients: ${Object.keys(transports).length}`,
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
      broadcastToClients(chatMessage);
      
      return {
        content: [
          {
            type: "text",
            text: `💬 Message sent to chat room!\n\nSender: ${sender}\nMessage: ${message}\nConnected clients: ${Object.keys(transports).length}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "example://data/storage",
        name: "Example Data Storage",
        description: "View all stored example data",
        mimeType: "application/json",
      },
      {
        uri: "chat://messages",
        name: "Chat Messages",
        description: "View all chat messages",
        mimeType: "application/json",
      },
    ],
  }));

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
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

    if (uri === "chat://messages") {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(chatMessages, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });

  return server;
}

async function runMultiClientServer(port: number = 3001) {
  const app = express();

  // Enable CORS with security considerations
  app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true
  }));

  app.use(express.json());

  // Handle POST requests for client-to-server communication
  app.post('/mcp', async (req: Request, res: Response) => {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
          console.log(`New client session initialized: ${sessionId}. Total clients: ${Object.keys(transports).length}`);
        }
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
          console.log(`Client session closed: ${transport.sessionId}. Total clients: ${Object.keys(transports).length}`);
        }
      };

      const server = createMCPServer();
      
      // Connect to the MCP server
      await server.connect(transport);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  });

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  // Handle GET requests for server-to-client notifications via SSE
  app.get('/mcp', handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete('/mcp', handleSessionRequest);

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      server: "experimental-teammate-multi-client",
      connectedClients: Object.keys(transports).length,
      timestamp: new Date().toISOString()
    });
  });

  // Bind only to localhost for security
  app.listen(port, '127.0.0.1', () => {
    console.log(`🚀 Multi-Client MCP Server running on http://127.0.0.1:${port}`);
    console.log(`📡 MCP endpoint: http://127.0.0.1:${port}/mcp`);
    console.log(`❤️ Health check: http://127.0.0.1:${port}/health`);
  });
}

// Start the multi-client server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
runMultiClientServer(port).catch(console.error);
