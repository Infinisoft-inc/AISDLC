#!/usr/bin/env node

import express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest, CallToolResult, GetPromptResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

// Chat room storage
const chatMessages: Array<{id: string, message: string, timestamp: string, sender: string}> = [];

// Create an MCP server with chat functionality
const getServer = () => {
  const server = new McpServer({
    name: 'experimental-teammate-chat',
    version: '1.0.0',
  });

  // Register send-chat-message tool
  server.tool('send-chat-message', 'Send a message to the chat room', {
    message: z.string().describe('The message to send'),
    sender: z.string().describe('Who is sending the message (e.g., "human", "architect", "developer")'),
  }, async ({ message, sender }): Promise<CallToolResult> => {
    const chatMessage = {
      id: Date.now().toString(),
      message,
      sender,
      timestamp: new Date().toISOString(),
    };
    
    chatMessages.push(chatMessage);
    
    console.log(`💬 New chat message from ${sender}: ${message}`);
    
    return {
      content: [
        {
          type: "text",
          text: `💬 Message sent to chat room!\n\nSender: ${sender}\nMessage: ${message}\nTotal messages: ${chatMessages.length}`,
        },
      ],
    };
  });

  // Register @gino prompt
  server.prompt('@gino', 'Gino is mentioned in the message.', {}, async (): Promise<GetPromptResult> => {
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

  // Register chat messages resource
  server.resource('chat-messages', 'chat://messages', { mimeType: 'application/json' }, async (): Promise<ReadResourceResult> => {
    return {
      contents: [
        {
          uri: 'chat://messages',
          text: JSON.stringify(chatMessages, null, 2),
        },
      ],
    };
  });

  return server;
};

const MCP_PORT = 3002;
const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  console.log('Received MCP request:', req.body);
  
  try {
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
          // Store the transport by session ID when session is initialized
          console.log(`Session initialized with ID: ${sessionId}. Total clients: ${Object.keys(transports).length + 1}`);
          transports[sessionId] = transport;
        }
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}. Total clients: ${Object.keys(transports).length - 1}`);
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server BEFORE handling the request
      const server = getServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return; // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
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

    // Handle the request with existing transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Handle GET requests for SSE streams
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Establishing SSE stream for session ${sessionId}`);
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Handle DELETE requests for session termination
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Received session termination request for session ${sessionId}`);
  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    server: "experimental-teammate-multi-client-chat",
    connectedClients: Object.keys(transports).length,
    totalMessages: chatMessages.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(MCP_PORT, () => {
  console.log(`🚀 Multi-Client Chat MCP Server running on http://127.0.0.1:${MCP_PORT}`);
  console.log(`📡 MCP endpoint: http://127.0.0.1:${MCP_PORT}/mcp`);
  console.log(`❤️ Health check: http://127.0.0.1:${MCP_PORT}/health`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  // Close all active transports
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.log('Server shutdown complete');
  process.exit(0);
});
