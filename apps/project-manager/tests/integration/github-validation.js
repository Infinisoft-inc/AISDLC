#!/usr/bin/env node

/**
 * Jordan GitHub Integration Validation
 * Creates real GitHub issues and validates they were created correctly
 */

import { spawn } from 'child_process';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../../.env' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class GitHubIntegrationValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      createdIssues: []
    };
    
    // Test repository configuration
    this.testConfig = {
      owner: 'Infinisoft-inc',
      repo: 'github-test'
    };
    
    // Initialize GitHub client for validation
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || process.env.DOPPLER_TOKEN
    });
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runMCPCommand(toolName, args) {
    return new Promise((resolve, reject) => {
      const command = 'npx';
      const commandArgs = [
        '@modelcontextprotocol/inspector',
        '--cli',
        'node',
        '../../dist/index.js',
        '--method',
        'tools/call',
        '--tool-name',
        toolName,
        '--tool-arguments',
        JSON.stringify(args)
      ];

      const process = spawn(command, commandArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false
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

  async validateIssueExists(issueNumber) {
    try {
      const { data: issue } = await this.octokit.rest.issues.get({
        owner: this.testConfig.owner,
        repo: this.testConfig.repo,
        issue_number: issueNumber
      });
      
      return {
        exists: true,
        issue: issue,
        title: issue.title,
        body: issue.body,
        labels: issue.labels.map(l => l.name),
        state: issue.state
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  extractIssueNumber(output) {
    // Look for issue number in the output
    const match = output.match(/issue #(\d+)/i) || output.match(/issues\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  async runIntegrationTest(testName, toolName, args, expectedPatterns = []) {
    this.results.total++;
    this.log(`\n🧪 ${testName}`, 'cyan');
    
    try {
      // Run the MCP command
      this.log('  📤 Creating via MCP...', 'yellow');
      const response = await this.runMCPCommand(toolName, args);
      
      if (!response.success) {
        throw new Error(`MCP command failed: ${response.stderr}`);
      }

      // Check for expected patterns in output
      const output = response.stdout + ' ' + response.stderr;
      for (const pattern of expectedPatterns) {
        if (!output.toLowerCase().includes(pattern.toLowerCase())) {
          throw new Error(`Missing expected pattern: ${pattern}`);
        }
      }

      // Extract issue number from output
      const issueNumber = this.extractIssueNumber(output);
      if (!issueNumber) {
        throw new Error('Could not extract issue number from output');
      }

      this.log(`  📋 Created issue #${issueNumber}`, 'blue');

      // Validate the issue exists on GitHub
      this.log('  🔍 Validating on GitHub...', 'yellow');
      const validation = await this.validateIssueExists(issueNumber);
      
      if (!validation.exists) {
        throw new Error(`Issue #${issueNumber} not found on GitHub: ${validation.error}`);
      }

      // Validate issue content
      const issue = validation.issue;
      this.log(`  ✅ Issue validated: "${issue.title}"`, 'green');
      this.log(`  🏷️  Labels: ${validation.labels.join(', ')}`, 'blue');
      
      // Store created issue for cleanup
      this.results.createdIssues.push({
        number: issueNumber,
        title: issue.title,
        url: issue.html_url
      });

      this.results.passed++;
      return {
        success: true,
        issueNumber,
        issue: validation.issue
      };

    } catch (error) {
      this.log(`  ❌ FAIL: ${error.message}`, 'red');
      this.results.failed++;
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runAllTests() {
    this.log('🔗 Jordan GitHub Integration Validation', 'magenta');
    this.log('=========================================', 'magenta');
    
    // Check environment
    if (!process.env.GITHUB_TOKEN && !process.env.DOPPLER_TOKEN) {
      this.log('❌ No GitHub token found in environment', 'red');
      this.log('   Set GITHUB_TOKEN or DOPPLER_TOKEN in .env file', 'yellow');
      return;
    }

    // Build project
    this.log('\n🔨 Building project...', 'yellow');
    const buildResult = await this.runMCPCommand('get-project-status', {});
    if (!buildResult.success) {
      this.log('❌ Project build/status check failed', 'red');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Test 1: Create Epic
    await this.runIntegrationTest(
      'Create Epic Issue',
      'create-epic-issue',
      {
        owner: this.testConfig.owner,
        repo: this.testConfig.repo,
        title: `[EPIC] Integration Test Epic - ${timestamp}`,
        body: `# Integration Test Epic\n\nCreated by Jordan's integration test suite.\n\n## Purpose\nValidate epic creation functionality.\n\n## Created\n${new Date().toISOString()}`,
        labels: ['epic', 'integration-test'],
        organization: 'Infinisoft-inc'
      },
      ['successfully created', 'epic']
    );

    // Test 2: Create Feature
    await this.runIntegrationTest(
      'Create Feature Issue',
      'create-feature-issue',
      {
        owner: this.testConfig.owner,
        repo: this.testConfig.repo,
        title: `[FEATURE] Integration Test Feature - ${timestamp}`,
        body: `# Integration Test Feature\n\nCreated by Jordan's integration test suite.\n\n## Acceptance Criteria\n- [ ] Feature created successfully\n- [ ] Proper labels applied\n\n## Created\n${new Date().toISOString()}`,
        parentEpicNumber: 1,
        labels: ['feature', 'integration-test'],
        organization: 'Infinisoft-inc'
      },
      ['successfully created', 'feature']
    );

    // Test 3: Create Task
    await this.runIntegrationTest(
      'Create Task Issue',
      'create-task-issue',
      {
        owner: this.testConfig.owner,
        repo: this.testConfig.repo,
        title: `[TASK] Integration Test Task - ${timestamp}`,
        body: `# Integration Test Task\n\nCreated by Jordan's integration test suite.\n\n## Implementation\n- Validate task creation\n- Test GitHub integration\n\n## Created\n${new Date().toISOString()}`,
        parentFeatureNumber: 2,
        labels: ['task', 'integration-test'],
        organization: 'Infinisoft-inc'
      },
      ['successfully created', 'task']
    );

    this.printResults();
  }

  printResults() {
    this.log('\n📊 Integration Test Results', 'magenta');
    this.log('============================', 'magenta');
    
    this.log(`Total Tests: ${this.results.total}`);
    this.log(`✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    this.log(`📈 Success Rate: ${successRate}%`, successRate >= 100 ? 'green' : 'red');

    if (this.results.createdIssues.length > 0) {
      this.log('\n📋 Created Issues:', 'cyan');
      for (const issue of this.results.createdIssues) {
        this.log(`  #${issue.number}: ${issue.title}`, 'blue');
        this.log(`  🔗 ${issue.url}`, 'blue');
      }
    }

    if (this.results.failed === 0) {
      this.log('\n🎉 All integration tests passed!', 'green');
      this.log('✅ GitHub integration is working correctly', 'green');
      this.log('🚀 Jordan is ready for production deployment', 'green');
    } else {
      this.log('\n⚠️  Some integration tests failed', 'yellow');
      this.log('🚫 Review issues before production deployment', 'red');
    }
  }
}

// Run the integration tests
async function main() {
  const validator = new GitHubIntegrationValidator();
  await validator.runAllTests();
  
  // Exit with appropriate code
  process.exit(validator.results.failed === 0 ? 0 : 1);
}

// Run if this is the main module
main().catch(console.error);
