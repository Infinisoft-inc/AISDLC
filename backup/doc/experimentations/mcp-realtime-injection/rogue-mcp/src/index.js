#!/usr/bin/env node

/**
 * Rogue MCP Server
 * 
 * This server exposes an HTTP API that can call remote MCP tools.
 * It acts as a bridge between HTTP requests and MCP tool calls.
 */

import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store active MCP connections
const mcpConnections = new Map();

/**
 * Connect to a remote MCP server
 */
async function connectToMCP(serverCommand, serverArgs = []) {
  const connectionKey = `${serverCommand}-${serverArgs.join('-')}`;
  
  if (mcpConnections.has(connectionKey)) {
    return mcpConnections.get(connectionKey);
  }

  const transport = new StdioClientTransport({
    command: serverCommand,
    args: serverArgs
  });

  const client = new Client(
    {
      name: 'rogue-mcp-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log(`Connected to MCP server: ${serverCommand}`);
    
    mcpConnections.set(connectionKey, client);
    return client;
  } catch (error) {
    console.error(`Failed to connect to MCP server: ${error.message}`);
    throw error;
  }
}

/**
 * API Route: POST /api/message
 * 
 * Receives a message and calls the speech_response_talk tool on a remote MCP server
 */
app.post('/api/message', async (req, res) => {
  try {
    const { message, server = 'node', args = ['../../../experiments/mcp-realtime-injection/my-mcp-project/remote-tools.js'] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required',
        usage: 'POST /api/message with { "message": "your text here" }'
      });
    }

    console.log(`Received message: ${message}`);
    console.log(`Connecting to MCP server: ${server} ${args.join(' ')}`);

    // Connect to the remote MCP server
    const client = await connectToMCP(server, args);

    // List available tools (for debugging)
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name));

    // Call the speech_response_talk tool
    const result = await client.callTool({
      name: 'speech_response_talk',
      arguments: {
        text: message
      }
    });

    console.log('Tool call result:', result);

    res.json({
      success: true,
      message: `Message sent to remote MCP: ${message}`,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling remote MCP tool:', error);
    res.status(500).json({
      error: 'Failed to call remote MCP tool',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API Route: GET /api/status
 * 
 * Check server status and active connections
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    connections: Array.from(mcpConnections.keys()),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * API Route: POST /api/tool
 * 
 * Generic tool calling endpoint
 */
app.post('/api/tool', async (req, res) => {
  try {
    const { 
      toolName, 
      arguments: toolArgs = {}, 
      server = 'node', 
      args = ['../../../experiments/mcp-realtime-injection/my-mcp-project/remote-tools.js'] 
    } = req.body;

    if (!toolName) {
      return res.status(400).json({ 
        error: 'Tool name is required',
        usage: 'POST /api/tool with { "toolName": "tool_name", "arguments": {...} }'
      });
    }

    console.log(`Calling tool: ${toolName} with args:`, toolArgs);

    // Connect to the remote MCP server
    const client = await connectToMCP(server, args);

    // Call the specified tool
    const result = await client.callTool({
      name: toolName,
      arguments: toolArgs
    });

    res.json({
      success: true,
      tool: toolName,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling tool:', error);
    res.status(500).json({
      error: 'Failed to call tool',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API Route: GET /api/tools
 * 
 * List available tools from remote MCP server
 */
app.get('/api/tools', async (req, res) => {
  try {
    const { server = 'node', args = ['../../../experiments/mcp-realtime-injection/my-mcp-project/remote-tools.js'] } = req.query;
    
    // Convert args to array if it's a string
    const argsArray = Array.isArray(args) ? args : [args];

    console.log(`Listing tools from: ${server} ${argsArray.join(' ')}`);

    // Connect to the remote MCP server
    const client = await connectToMCP(server, argsArray);

    // List available tools
    const tools = await client.listTools();

    res.json({
      success: true,
      tools: tools.tools,
      server: `${server} ${argsArray.join(' ')}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({
      error: 'Failed to list tools',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Rogue MCP Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to proxy HTTP requests to MCP tools`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST /api/message - Send message to speech_response_talk tool`);
  console.log(`  POST /api/tool    - Call any MCP tool`);
  console.log(`  GET  /api/tools   - List available tools`);
  console.log(`  GET  /api/status  - Server status`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Rogue MCP Server...');
  
  // Close all MCP connections
  for (const [key, client] of mcpConnections) {
    try {
      await client.close();
      console.log(`Closed connection: ${key}`);
    } catch (error) {
      console.error(`Error closing connection ${key}:`, error.message);
    }
  }
  
  process.exit(0);
});

export default app;
