#!/usr/bin/env node

/**
 * Direct STDIO Injector for MCP Real-time Experiment
 * 
 * This script directly writes to the STDIO of a running MCP server process
 * to test how Augment Code reacts to unsolicited data injection.
 */

import { spawn } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DirectSTDIOInjector {
  constructor() {
    this.mcpProcess = null;
    this.injectionLog = [];
  }

  /**
   * Start the MCP server as a child process
   */
  async startMCPServer() {
    console.log('🚀 Starting MCP server as child process...');

    const mcpServerPath = join(__dirname, 'mcp-server');
    const nodePath = process.execPath; // Use current Node.js executable

    this.mcpProcess = spawn(nodePath, ['dist/index.js'], {
      cwd: mcpServerPath,
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
      env: {
        ...process.env,
        ENABLE_REALTIME: 'false',
        ENABLE_POLLING: 'false' // Disable polling for direct injection test
      }
    });

    // Log MCP server output
    this.mcpProcess.stdout.on('data', (data) => {
      console.log(`MCP-STDOUT: ${data.toString().trim()}`);
    });

    this.mcpProcess.stderr.on('data', (data) => {
      console.error(`MCP-STDERR: ${data.toString().trim()}`);
    });

    this.mcpProcess.on('close', (code) => {
      console.log(`MCP server exited with code ${code}`);
    });

    // Wait a moment for server to start
    await this.delay(2000);
    console.log('✅ MCP server started');
  }

  /**
   * Inject data directly into MCP server's STDIN
   */
  async injectToSTDIN(data) {
    if (!this.mcpProcess) {
      throw new Error('MCP server not started');
    }

    const timestamp = new Date().toISOString();
    const injection = {
      type: 'direct_stdio_injection',
      data: data,
      timestamp: timestamp,
      method: 'stdin_write'
    };

    const jsonData = JSON.stringify(injection);
    
    try {
      this.mcpProcess.stdin.write(`${jsonData}\n`);
      this.logInjection('stdin_write', true, injection);
      console.log(`✅ Injected to STDIN: ${jsonData.substring(0, 100)}...`);
      return true;
    } catch (error) {
      this.logInjection('stdin_write', false, injection, error.message);
      console.error(`❌ STDIN injection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Inject raw text directly to STDIN
   */
  async injectRawText(text) {
    if (!this.mcpProcess) {
      throw new Error('MCP server not started');
    }

    try {
      this.mcpProcess.stdin.write(`${text}\n`);
      this.logInjection('raw_text', true, { text });
      console.log(`✅ Injected raw text: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      this.logInjection('raw_text', false, { text }, error.message);
      console.error(`❌ Raw text injection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Inject MCP-like JSON-RPC message
   */
  async injectMCPMessage(method, params = {}) {
    const mcpMessage = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000),
      method: method,
      params: params
    };

    return await this.injectToSTDIN(mcpMessage);
  }

  /**
   * Run a series of injection tests
   */
  async runInjectionTests() {
    console.log('\n🧪 Starting Direct STDIO Injection Tests');
    console.log('=' .repeat(60));

    const tests = [
      {
        name: 'Raw Text Injection',
        action: () => this.injectRawText('DIRECT_INJECTION_TEST: Hello from external process!')
      },
      {
        name: 'JSON Data Injection',
        action: () => this.injectToSTDIN({ message: 'Test injection', type: 'experiment' })
      },
      {
        name: 'MCP-like Message Injection',
        action: () => this.injectMCPMessage('experimental/inject', { data: 'test payload' })
      },
      {
        name: 'Large Payload Injection',
        action: () => this.injectToSTDIN({ 
          type: 'large_payload',
          data: 'X'.repeat(1000),
          timestamp: new Date().toISOString()
        })
      },
      {
        name: 'Rapid Fire Injection',
        action: async () => {
          for (let i = 0; i < 5; i++) {
            await this.injectToSTDIN({ sequence: i, message: `Rapid injection ${i}` });
            await this.delay(100);
          }
        }
      }
    ];

    for (const test of tests) {
      console.log(`\n🔬 Running: ${test.name}`);
      console.log('-'.repeat(40));
      
      try {
        await test.action();
        console.log(`✅ ${test.name} completed`);
      } catch (error) {
        console.error(`❌ ${test.name} failed: ${error.message}`);
      }
      
      // Wait between tests
      await this.delay(2000);
    }

    this.printInjectionSummary();
  }

  /**
   * Log injection attempt
   */
  logInjection(method, success, data, error = null) {
    this.injectionLog.push({
      timestamp: new Date().toISOString(),
      method: method,
      success: success,
      data: data,
      error: error
    });
  }

  /**
   * Print injection summary
   */
  printInjectionSummary() {
    console.log('\n📊 DIRECT STDIO INJECTION SUMMARY');
    console.log('=' .repeat(60));
    
    const successful = this.injectionLog.filter(log => log.success).length;
    const failed = this.injectionLog.filter(log => !log.success).length;
    
    console.log(`✅ Successful injections: ${successful}`);
    console.log(`❌ Failed injections: ${failed}`);
    console.log(`📈 Total attempts: ${this.injectionLog.length}`);
    
    console.log('\n📋 Detailed Log:');
    this.injectionLog.forEach((log, index) => {
      const status = log.success ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${log.method} at ${log.timestamp}`);
      if (!log.success && log.error) {
        console.log(`   Error: ${log.error}`);
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
  const injector = new DirectSTDIOInjector();
  
  try {
    await injector.startMCPServer();
    await injector.runInjectionTests();
  } catch (error) {
    console.error('❌ Injection test failed:', error);
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

export { DirectSTDIOInjector };
