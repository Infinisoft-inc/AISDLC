#!/usr/bin/env node

/**
 * Advanced Jordan MCP Server Test Runner
 * Runs comprehensive tests using MCP Inspector CLI with detailed reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class JordanTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: []
    };
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          success: code === 0
        });
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runMCPCommand(method, args = {}) {
    const baseCommand = 'npx @modelcontextprotocol/inspector --cli node dist/index.js';
    let command = `${baseCommand} --method ${method}`;
    
    // Add arguments based on method type
    if (method.startsWith('tools/call')) {
      if (args.name) {
        command += ` --tool-name ${args.name}`;
      }
      if (args.arguments) {
        for (const [key, value] of Object.entries(args.arguments)) {
          command += ` --tool-arg ${key}='${value}'`;
        }
      }
    } else if (method.startsWith('prompts/get')) {
      if (args.name) {
        command += ` --prompt-name ${args.name}`;
      }
    } else if (method.startsWith('resources/read')) {
      if (args.uri) {
        command += ` --resource-uri ${args.uri}`;
      }
    }
    
    return await this.runCommand(command);
  }

  validateResponse(response, expectedContent = [], expectFailure = false) {
    const output = response.stdout + ' ' + response.stderr;
    
    if (expectFailure) {
      // For tests that should fail (like GitHub auth), check if it fails as expected
      if (response.success) {
        return { valid: false, reason: 'Expected failure but command succeeded' };
      }
      // Check if failure reason matches expected content
      for (const expected of expectedContent) {
        if (output.toLowerCase().includes(expected.toLowerCase())) {
          return { valid: true, reason: 'Failed as expected' };
        }
      }
      return { valid: false, reason: 'Failed but not for expected reason' };
    } else {
      // For tests that should succeed
      if (!response.success) {
        return { valid: false, reason: `Command failed: ${response.stderr}` };
      }
      
      // Check if response contains expected content
      for (const expected of expectedContent) {
        if (!output.toLowerCase().includes(expected.toLowerCase())) {
          return { valid: false, reason: `Missing expected content: ${expected}` };
        }
      }
      return { valid: true, reason: 'All validations passed' };
    }
  }

  async runTest(test, scenarioName) {
    this.results.total++;
    const testName = `${scenarioName} > ${test.name}`;
    
    this.log(`\n  🧪 ${test.name}`, 'cyan');
    
    try {
      const response = await this.runMCPCommand(test.method, test.args || {});
      const validation = this.validateResponse(
        response, 
        test.expectedContent || [], 
        test.expectFailure || false
      );
      
      if (validation.valid) {
        this.log(`    ✅ PASS - ${validation.reason}`, 'green');
        this.results.passed++;
        return { name: testName, status: 'PASS', reason: validation.reason };
      } else {
        this.log(`    ❌ FAIL - ${validation.reason}`, 'red');
        this.log(`    Output: ${response.stdout.substring(0, 200)}...`, 'yellow');
        this.results.failed++;
        return { name: testName, status: 'FAIL', reason: validation.reason };
      }
    } catch (error) {
      this.log(`    ❌ ERROR - ${error.message}`, 'red');
      this.results.failed++;
      return { name: testName, status: 'ERROR', reason: error.message };
    }
  }

  async runScenario(scenario) {
    this.log(`\n📋 ${scenario.name}`, 'magenta');
    if (scenario.description) {
      this.log(`   ${scenario.description}`, 'yellow');
    }
    
    const scenarioResults = {
      name: scenario.name,
      tests: []
    };
    
    for (const test of scenario.tests) {
      const result = await this.runTest(test, scenario.name);
      scenarioResults.tests.push(result);
    }
    
    this.results.scenarios.push(scenarioResults);
  }

  async runAllTests() {
    this.log('🚀 Jordan MCP Server Advanced Test Suite', 'blue');
    this.log('==========================================', 'blue');
    
    // Build the project first
    this.log('\n🔨 Building Jordan MCP Server...', 'yellow');
    const buildResult = await this.runCommand('pnpm build');
    if (!buildResult.success) {
      this.log('❌ Build failed!', 'red');
      this.log(buildResult.stderr, 'red');
      return;
    }
    this.log('✅ Build successful', 'green');
    
    // Load test scenarios
    const scenariosPath = path.join(__dirname, 'test-scenarios.json');
    if (!fs.existsSync(scenariosPath)) {
      this.log('❌ Test scenarios file not found!', 'red');
      return;
    }
    
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
    
    // Run all scenarios
    for (const scenario of scenarios.testScenarios) {
      await this.runScenario(scenario);
    }
    
    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 Test Results Summary', 'blue');
    this.log('========================', 'blue');
    
    this.log(`Total Tests: ${this.results.total}`);
    this.log(`✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    this.log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    // Detailed results by scenario
    this.log('\n📋 Results by Scenario:', 'cyan');
    for (const scenario of this.results.scenarios) {
      const passed = scenario.tests.filter(t => t.status === 'PASS').length;
      const total = scenario.tests.length;
      this.log(`  ${scenario.name}: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
      
      // Show failed tests
      const failed = scenario.tests.filter(t => t.status !== 'PASS');
      if (failed.length > 0) {
        for (const test of failed) {
          this.log(`    ❌ ${test.name}: ${test.reason}`, 'red');
        }
      }
    }
    
    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! Jordan MCP Server is working perfectly!', 'green');
    } else {
      this.log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
    }
  }
}

// Run the tests
async function main() {
  const runner = new JordanTestRunner();
  await runner.runAllTests();
  
  // Exit with appropriate code
  process.exit(runner.results.failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}
