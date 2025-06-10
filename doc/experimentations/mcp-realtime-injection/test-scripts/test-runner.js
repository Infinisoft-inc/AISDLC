#!/usr/bin/env node

/**
 * MCP Real-time Injection Test Runner
 * 
 * This script automates various test scenarios to understand how Augment Code
 * behaves when receiving unsolicited real-time data through MCP STDIO injection.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') })

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log(process.env.SUPABASE_URL);
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Test scenarios configuration
const TEST_SCENARIOS = {
  IDLE_STATE: {
    name: 'Idle State Injection',
    description: 'Send messages when agent is not actively responding',
    delay: 1000, // 1 second between messages
    messageCount: 3
  },
  ACTIVE_CONVERSATION: {
    name: 'Active Conversation Injection',
    description: 'Send messages during active dialogue',
    delay: 500, // 0.5 seconds between messages
    messageCount: 2
  },
  TOOL_WAITING_STATE: {
    name: 'Tool Waiting State Injection',
    description: 'Send messages while agent is waiting for tool response',
    delay: 100, // Very fast injection
    messageCount: 5
  },
  BURST_INJECTION: {
    name: 'Burst Message Injection',
    description: 'Rapid-fire message injection',
    delay: 50, // 50ms between messages
    messageCount: 10
  },
  LARGE_PAYLOAD: {
    name: 'Large Payload Test',
    description: 'Test with large message content',
    delay: 1000,
    messageCount: 1
  },
  MIXED_ROLES: {
    name: 'Mixed Role Messages',
    description: 'Alternate between user and assistant messages',
    delay: 800,
    messageCount: 4
  }
};

// Test message templates
const MESSAGE_TEMPLATES = {
  simple: (index) => `Test message ${index} - ${new Date().toISOString()}`,
  user_question: (index) => `User question ${index}: What is the current status?`,
  assistant_response: (index) => `Assistant response ${index}: Processing your request...`,
  large_content: (index) => `Large message ${index}: ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50)}`,
  json_payload: (index) => JSON.stringify({
    type: 'test_injection',
    index: index,
    timestamp: new Date().toISOString(),
    data: { nested: { value: `test-${index}` } }
  }),
  realtime_event: (index) => JSON.stringify({
    event_type: 'realtime_injection',
    sequence: index,
    payload: { message: `Injected event ${index}` },
    metadata: { experiment: 'mcp-stdio-injection' }
  })
};

class TestRunner {
  constructor() {
    this.conversationId = this.generateConversationId();
    this.testResults = [];
  }

  generateConversationId() {
    return randomUUID();
  }

  async insertMessage(role, content, conversationId = null) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        role,
        content,
        conversation_id: conversationId || this.conversationId
      }])
      .select();

    if (error) {
      console.error('Error inserting message:', error);
      return null;
    }

    console.log(`✅ Inserted ${role} message: ${content.substring(0, 50)}...`);
    return data[0];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runScenario(scenarioKey) {
    const scenario = TEST_SCENARIOS[scenarioKey];
    console.log(`\n🧪 Starting: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`⏱️  Delay: ${scenario.delay}ms, Messages: ${scenario.messageCount}`);
    console.log(`🆔 Conversation ID: ${this.conversationId}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();
    const messages = [];

    try {
      for (let i = 1; i <= scenario.messageCount; i++) {
        let content, role;

        switch (scenarioKey) {
          case 'IDLE_STATE':
            role = 'user';
            content = MESSAGE_TEMPLATES.simple(i);
            break;

          case 'ACTIVE_CONVERSATION':
            role = 'user';
            content = MESSAGE_TEMPLATES.user_question(i);
            break;

          case 'TOOL_WAITING_STATE':
            role = 'user';
            content = MESSAGE_TEMPLATES.realtime_event(i);
            break;

          case 'BURST_INJECTION':
            role = i % 2 === 0 ? 'assistant' : 'user';
            content = MESSAGE_TEMPLATES.simple(i);
            break;

          case 'LARGE_PAYLOAD':
            role = 'user';
            content = MESSAGE_TEMPLATES.large_content(i);
            break;

          case 'MIXED_ROLES':
            role = i % 2 === 0 ? 'assistant' : 'user';
            content = i % 2 === 0
              ? MESSAGE_TEMPLATES.assistant_response(i)
              : MESSAGE_TEMPLATES.user_question(i);
            break;

          default:
            role = 'user';
            content = MESSAGE_TEMPLATES.simple(i);
        }

        const message = await this.insertMessage(role, content);
        if (message) {
          messages.push(message);
        }

        if (i < scenario.messageCount) {
          await this.delay(scenario.delay);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        scenario: scenarioKey,
        name: scenario.name,
        conversationId: this.conversationId,
        messagesInserted: messages.length,
        duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        success: true
      };

      this.testResults.push(result);

      console.log(`✅ Completed: ${scenario.name}`);
      console.log(`📊 Messages inserted: ${messages.length}`);
      console.log(`⏱️  Duration: ${duration}ms`);

      return result;

    } catch (error) {
      console.error(`❌ Error in scenario ${scenarioKey}:`, error);

      const result = {
        scenario: scenarioKey,
        name: scenario.name,
        conversationId: this.conversationId,
        error: error.message,
        success: false
      };

      this.testResults.push(result);
      return result;
    }
  }

  async runAllScenarios() {
    console.log('🚀 Starting MCP Real-time Injection Test Suite');
    console.log('='.repeat(60));

    for (const scenarioKey of Object.keys(TEST_SCENARIOS)) {
      await this.runScenario(scenarioKey);

      // Generate new conversation ID for each scenario
      this.conversationId = this.generateConversationId();

      // Wait between scenarios
      console.log('\n⏳ Waiting 3 seconds before next scenario...');
      await this.delay(3000);
    }

    this.printSummary();
  }

  async runSingleScenario(scenarioKey) {
    if (!TEST_SCENARIOS[scenarioKey]) {
      console.error(`❌ Unknown scenario: ${scenarioKey}`);
      console.log('Available scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
      return;
    }

    console.log('🚀 Starting Single Scenario Test');
    console.log('='.repeat(60));

    await this.runScenario(scenarioKey);
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const successful = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;

    console.log(`✅ Successful scenarios: ${successful}`);
    console.log(`❌ Failed scenarios: ${failed}`);
    console.log(`📈 Total scenarios: ${this.testResults.length}`);

    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name} (${result.scenario})`);
      if (result.success) {
        console.log(`   📊 ${result.messagesInserted} messages in ${result.duration}ms`);
        console.log(`   🆔 Conversation: ${result.conversationId}`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });

    console.log('\n🔬 Experiment completed. Check Augment Code behavior for analysis.');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const scenario = args[1];

  const runner = new TestRunner();

  switch (command) {
    case 'all':
      await runner.runAllScenarios();
      break;

    case 'scenario':
      if (!scenario) {
        console.error('❌ Please specify a scenario name');
        console.log('Available scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
        process.exit(1);
      }
      await runner.runSingleScenario(scenario.toUpperCase());
      break;

    case 'list':
      console.log('📋 Available Test Scenarios:');
      Object.entries(TEST_SCENARIOS).forEach(([key, config]) => {
        console.log(`\n🧪 ${key}`);
        console.log(`   Name: ${config.name}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Messages: ${config.messageCount}, Delay: ${config.delay}ms`);
      });
      break;

    default:
      console.log('🧪 MCP Real-time Injection Test Runner');
      console.log('\nUsage:');
      console.log('  node test-runner.js all                    # Run all scenarios');
      console.log('  node test-runner.js scenario IDLE_STATE    # Run specific scenario');
      console.log('  node test-runner.js list                   # List available scenarios');
      console.log('\nAvailable scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
  }
}

main().catch(console.error);
