#!/usr/bin/env node

/**
 * MCP Protocol Injector for Real-time Experiment
 * 
 * This script injects valid MCP JSON-RPC protocol messages into a running MCP server
 * to test if Augment Code processes injected protocol messages.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPProtocolInjector {
  constructor() {
    this.mcpProcess = null;
    this.injectionLog = [];
    this.requestId = 1000; // Start with high ID to avoid collisions
  }

  /**
   * Start the MCP server as a child process
   */
  async startMCPServer() {
    console.log('🚀 Starting MCP server for protocol injection test...');
    
    const mcpServerPath = join(__dirname, 'mcp-server');
    const nodePath = process.execPath;
    
    this.mcpProcess = spawn(nodePath, ['dist/index.js'], {
      cwd: mcpServerPath,
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
      env: {
        ...process.env,
        ENABLE_REALTIME: 'false',
        ENABLE_POLLING: 'false' // Disable all other injection methods
      }
    });

    // Log MCP server output
    this.mcpProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`MCP-STDOUT: ${output}`);
      
      // Check if this looks like a JSON-RPC response
      if (output.startsWith('{') && output.includes('"jsonrpc"')) {
        console.log('🎯 POTENTIAL MCP RESPONSE DETECTED!');
        this.logResponse(output);
      }
    });

    this.mcpProcess.stderr.on('data', (data) => {
      console.error(`MCP-STDERR: ${data.toString().trim()}`);
    });

    this.mcpProcess.on('close', (code) => {
      console.log(`MCP server exited with code ${code}`);
    });

    // Wait for server to start
    await this.delay(2000);
    console.log('✅ MCP server started');
  }

  /**
   * Inject a valid MCP JSON-RPC message
   */
  async injectMCPMessage(method, params = null, id = null) {
    if (!this.mcpProcess) {
      throw new Error('MCP server not started');
    }

    const requestId = id || this.requestId++;
    const message = {
      jsonrpc: '2.0',
      id: requestId,
      method: method
    };

    if (params !== null) {
      message.params = params;
    }

    const jsonMessage = JSON.stringify(message);
    const timestamp = new Date().toISOString();

    try {
      // Inject the message into STDIN
      this.mcpProcess.stdin.write(`${jsonMessage}\n`);
      
      this.logInjection(method, requestId, true, message, timestamp);
      console.log(`✅ Injected MCP message: ${method} (ID: ${requestId})`);
      console.log(`📤 Message: ${jsonMessage}`);
      
      return requestId;
    } catch (error) {
      this.logInjection(method, requestId, false, message, timestamp, error.message);
      console.error(`❌ MCP injection failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Test sequence: List tools first
   */
  async testListTools() {
    console.log('\n🧪 Testing: tools/list injection');
    console.log('=' .repeat(50));
    
    const requestId = await this.injectMCPMessage('tools/list');
    
    if (requestId) {
      console.log(`⏳ Waiting for response to tools/list (ID: ${requestId})...`);
      
      // Wait for potential response
      await this.delay(3000);
      
      // Check if we got a response
      const response = this.findResponseById(requestId);
      if (response) {
        console.log('🎉 SUCCESS: Received response to injected tools/list!');
        console.log(`📥 Response: ${JSON.stringify(response, null, 2)}`);
        return response;
      } else {
        console.log('❌ No response received to injected tools/list');
        return null;
      }
    }
    
    return null;
  }

  /**
   * Run the protocol injection test
   */
  async runProtocolTest() {
    console.log('\n🧪 Starting MCP Protocol Injection Test');
    console.log('=' .repeat(60));
    
    // Test 1: List tools
    const toolsResponse = await this.testListTools();
    
    if (toolsResponse) {
      console.log('\n✅ Protocol injection SUCCESSFUL!');
      console.log('🔍 Augment Code processed the injected MCP message!');
    } else {
      console.log('\n❌ Protocol injection failed or no response');
      console.log('🔍 Injected message may not have reached Augment Code');
    }
    
    this.printInjectionSummary();
  }

  /**
   * Log injection attempt
   */
  logInjection(method, requestId, success, message, timestamp, error = null) {
    this.injectionLog.push({
      timestamp: timestamp,
      method: method,
      requestId: requestId,
      success: success,
      message: message,
      error: error,
      type: 'injection'
    });
  }

  /**
   * Log received response
   */
  logResponse(responseText) {
    try {
      const response = JSON.parse(responseText);
      this.injectionLog.push({
        timestamp: new Date().toISOString(),
        responseId: response.id,
        response: response,
        type: 'response'
      });
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
    }
  }

  /**
   * Find response by request ID
   */
  findResponseById(requestId) {
    const responses = this.injectionLog.filter(log => 
      log.type === 'response' && log.responseId === requestId
    );
    return responses.length > 0 ? responses[0].response : null;
  }

  /**
   * Print injection summary
   */
  printInjectionSummary() {
    console.log('\n📊 MCP PROTOCOL INJECTION SUMMARY');
    console.log('=' .repeat(60));
    
    const injections = this.injectionLog.filter(log => log.type === 'injection');
    const responses = this.injectionLog.filter(log => log.type === 'response');
    
    const successful = injections.filter(log => log.success).length;
    const failed = injections.filter(log => !log.success).length;
    
    console.log(`✅ Successful injections: ${successful}`);
    console.log(`❌ Failed injections: ${failed}`);
    console.log(`📥 Responses received: ${responses.length}`);
    console.log(`📈 Total attempts: ${injections.length}`);
    
    console.log('\n📋 Detailed Log:');
    this.injectionLog.forEach((log, index) => {
      if (log.type === 'injection') {
        const status = log.success ? '✅' : '❌';
        console.log(`${status} ${index + 1}. ${log.method} (ID: ${log.requestId}) at ${log.timestamp}`);
        if (!log.success && log.error) {
          console.log(`   Error: ${log.error}`);
        }
      } else if (log.type === 'response') {
        console.log(`📥 ${index + 1}. Response (ID: ${log.responseId}) at ${log.timestamp}`);
      }
    });
  }

  /**
   * Cleanup and stop MCP server
   */
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

  /**
   * Utility delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const injector = new MCPProtocolInjector();
  
  try {
    await injector.startMCPServer();
    await injector.runProtocolTest();
  } catch (error) {
    console.error('❌ Protocol injection test failed:', error);
  } finally {
    await injector.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPProtocolInjector };
