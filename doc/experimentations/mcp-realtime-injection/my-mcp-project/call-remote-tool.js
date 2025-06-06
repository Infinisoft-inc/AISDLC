// call-remote-tool.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function main() {
  console.log('Starting remote tool call test...');

  // Create client to connect to the remote server
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['remote-tools.js']
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log('Connected to remote MCP server');

    // List available tools
    const tools = await client.listTools();
    console.log('Available tools:', tools);

    // Call the speech_response_talk tool
    const result = await client.callTool({
      name: 'speech_response_talk',
      arguments: {
        text: 'Hello from local MCP client!'
      }
    });

    console.log('Remote tool result:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
