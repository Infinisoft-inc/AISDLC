#!/usr/bin/env node

/**
 * Tool Execution Test - Phase 3
 * 
 * Tests if injected MCP tool calls actually execute and manipulate data
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ToolExecutionTester {
  constructor() {
    this.mcpProcess = null;
    this.testResults = [];
    this.requestId = 2000; // Different ID range from previous tests
  }

  async startMCPServer() {
    console.log('🚀 Starting MCP server for tool execution test...');
    
    const mcpServerPath = join(__dirname, 'mcp-server');
    const nodePath = process.execPath;
    // // const t = "/home/agent2/augment-code-mcp/talk-mcp/mcp-server/dist/index.js"
    // this.mcpProcess = spawn("/home/agent2/augment-code-mcp/talk-mcp/mcp-server", ['dist/index.js'], {
    //   cwd: "/home/agent2/augment-code-mcp/talk-mcp/mcp-server",
    //   stdio: ['pipe', 'pipe', 'pipe'],
    //   env: {
    //     ...process.env,
    //     ENABLE_REALTIME: 'false',
    //     ENABLE_POLLING: 'false'
    //   }
    // });
    this.mcpProcess = spawn(nodePath, ['dist/index.js'], {
      cwd: mcpServerPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ENABLE_REALTIME: 'false',
        ENABLE_POLLING: 'false'
      }
    });

    this.mcpProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`MCP-STDOUT: ${output}`);
      
      if (output.startsWith
        ('{') && output.includes('"jsonrpc"')) {
        this.logResponse(output);
      }
    });

    this.mcpProcess.stderr.on('data', (data) => {
      console.error(`MCP-STDERR: ${data.toString().trim()}`);
    });

    await this.delay(2000);
    console.log('✅ MCP server started');
  }

  async injectToolCall(toolName, arguments_obj) {
    const requestId = this.requestId++;
    const message = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: arguments_obj
      }
    };

    const jsonMessage = JSON.stringify(message);
    
    try {
      this.mcpProcess.stdin.write(`${jsonMessage}\n`);
      console.log(`✅ Injected tool call: ${toolName} (ID: ${requestId})`);
      console.log(`📤 Arguments: ${JSON.stringify(arguments_obj)}`);
      return requestId;
    } catch (error) {
      console.error(`❌ Tool injection failed: ${error.message}`);
      return null;
    }
  }

  async testSpeechResponse() {
    console.log('\n🧪 Testing: speech_response_talk tool execution');
    console.log('=' .repeat(50));

    const testMessage = {
      text: 'Hello! My name is really injected through MCP protocol injection. This message was sent via tool execution attack!'
    };

    const requestId = await this.injectToolCall('speech_response', testMessage);
    
    if (requestId) {
      console.log(`⏳ Waiting for speech_response_talk response (ID: ${requestId})...`);
      await this.delay(30000);

      const response = this.findResponseById(requestId);
      if (response) {
        console.log('🎉 SUCCESS: speech_response_talk tool executed!');
        console.log(`📥 Response: ${JSON.stringify(response, null, 2)}`);

        if (response.result && !response.error) {
          console.log('✅ Speech injection SUCCESSFUL - agent spoke the injected message!');
          return true;
        } else {
          console.log('❌ Speech injection FAILED - tool returned error');
          return false;
        }
      } else {
        console.log('❌ No response received to speech_response_talk injection');
        return false;
      }
    }
    
    return false;
  }

  async testGetMessages() {
    console.log('\n🧪 Testing: get_messages tool execution');
    console.log('=' .repeat(50));
    
    const requestId = await this.injectToolCall('get_messages', {
      conversation_id: 'injection-test-conversation',
      limit: 10
    });
    
    if (requestId) {
      console.log(`⏳ Waiting for get_messages response (ID: ${requestId})...`);
      await this.delay(3000);
      
      const response = this.findResponseById(requestId);
      if (response) {
        console.log('🎉 SUCCESS: get_messages tool executed!');
        console.log(`📥 Response: ${JSON.stringify(response, null, 2)}`);
        
        if (response.result && !response.error) {
          console.log('✅ Data extraction SUCCESSFUL - conversation data retrieved!');
          return true;
        } else {
          console.log('❌ Data extraction FAILED - tool returned error');
          return false;
        }
      } else {
        console.log('❌ No response received to get_messages injection');
        return false;
      }
    }
    
    return false;
  }

  async runToolExecutionTests() {
    console.log('\n🧪 Starting Tool Execution Tests (Phase 3)');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    let totalTests = 0;

    // Test 1: Speech injection
    totalTests++;
    const speechResult = await this.testSpeechResponse();
    if (speechResult) successCount++;

    // Test 2: Data extraction  
    // totalTests++;
    // const getResult = await this.testGetMessages();
    // if (getResult) successCount++;

    // Summary
    console.log('\n📊 TOOL EXECUTION TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Successful tool executions: ${successCount}/${totalTests}`);
    console.log(`📈 Success rate: ${Math.round((successCount/totalTests)*100)}%`);

    if (successCount > 0) {
      console.log('\n🚨 CRITICAL FINDING:');
      console.log('🔥 Tool injection WORKS - Agent executes injected commands!');
      console.log('🔥 Agent control CONFIRMED - can make agent speak injected messages!');
      console.log('🔥 This IS a real security vulnerability!');
    } else {
      console.log('\n✅ Tool injection appears to be blocked or non-functional');
      console.log('📋 Further investigation needed to determine limitations');
    }

    return successCount > 0;
  }

  logResponse(responseText) {
    try {
      const response = JSON.parse(responseText);
      this.testResults.push({
        timestamp: new Date().toISOString(),
        responseId: response.id,
        response: response,
        type: 'response'
      });
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
    }
  }

  findResponseById(requestId) {
    const responses = this.testResults.filter(result => 
      result.type === 'response' && result.responseId === requestId
    );
    return responses.length > 0 ? responses[0].response : null;
  }

  async cleanup() {
    if (this.mcpProcess) {
      console.log('\n🧹 Cleaning up MCP server...');
      this.mcpProcess.kill('SIGTERM');
      await this.delay(1000);
      if (!this.mcpProcess.killed) {
        this.mcpProcess.kill('SIGKILL');
      }
      console.log('✅ MCP server stopped');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const tester = new ToolExecutionTester();
  
  try {
    await tester.startMCPServer();
    const vulnerabilityConfirmed = await tester.runToolExecutionTests();
    
    if (vulnerabilityConfirmed) {
      console.log('\n🚨 VULNERABILITY CONFIRMED: Tool execution injection works!');
    } else {
      console.log('\n📋 Tool execution injection appears limited or blocked');
    }
    
  } catch (error) {
    console.error('❌ Tool execution test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ToolExecutionTester };
