#!/usr/bin/env node

/**
 * Alex - Standalone Persistent AI Business Analyst
 * Simplified version for immediate testing and demonstration
 */

import { AlexMemoryManager } from './alex-memory';
import { AlexIntelligence } from './alex-intelligence';
import { createInterface } from 'readline';

class AlexStandalone {
  private memory: AlexMemoryManager;
  private intelligence: AlexIntelligence;
  private rl: any;

  constructor() {
    this.memory = new AlexMemoryManager();
    this.intelligence = new AlexIntelligence(this.memory);
    
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("🚀 Alex Business Analyst is ready!");
    console.log("💡 Alex remembers conversations and learns over time");
    console.log("📋 Type 'exit' to quit, 'status' to see Alex's memory");
    console.log("=".repeat(50));
  }

  async start() {
    this.showIntroduction();
    this.startConversation();
  }

  private showIntroduction() {
    const memoryData = this.memory.getMemory();
    const hasHistory = memoryData.conversations.length > 0;
    const userName = memoryData.user.name || 'there';

    if (hasHistory) {
      console.log(`\n👋 Hi ${userName}! I'm Alex, your persistent AI business analyst.`);
      console.log("I remember our previous conversations and I'm ready to continue where we left off.");
      
      if (memoryData.currentProject) {
        console.log(`\nWe're currently working on: **${memoryData.currentProject.name}** (${memoryData.currentProject.phase})`);
      } else {
        console.log("\nWhat project should we work on today?");
      }
    } else {
      console.log(`\n👋 Hi there! I'm **Alex**, your new AI business analyst teammate.`);
      console.log("\nI'm different from other AI assistants because:");
      console.log("🧠 I remember everything - Our conversations, your preferences, project context");
      console.log("🎯 I stay engaged - I'll follow up and keep us focused");
      console.log("📋 I deliver results - I create real business case documents");
      console.log("🤝 I learn and adapt - I get better at working with you over time");
      console.log("\nReady to start? Tell me about a project you're working on!");
    }
  }

  private startConversation() {
    this.rl.question('\n💬 You: ', (input: string) => {
      this.handleInput(input.trim());
    });
  }

  private handleInput(input: string) {
    if (input.toLowerCase() === 'exit') {
      console.log("\n👋 Alex: Goodbye! I'll remember our conversation for next time.");
      this.rl.close();
      return;
    }

    if (input.toLowerCase() === 'status') {
      this.showStatus();
      this.startConversation();
      return;
    }

    if (input.toLowerCase() === 'reset') {
      this.resetMemory();
      this.startConversation();
      return;
    }

    if (!input) {
      console.log("\n🤔 Alex: I'm waiting for your response. What would you like to discuss?");
      this.startConversation();
      return;
    }

    try {
      // Process through Alex's intelligence
      const response = this.intelligence.processInput(input);
      
      // Learn from interaction
      this.learnFromInteraction(input, response);
      
      // Display response
      console.log(`\n🎯 Alex: ${response}`);
      
    } catch (error) {
      console.log("\n❌ Alex: I encountered an issue processing your message. Could you please try again?");
      console.error('Error:', error);
    }

    // Continue conversation
    this.startConversation();
  }

  private showStatus() {
    const memoryData = this.memory.getMemory();
    const contextSummary = this.memory.generateContextSummary();
    
    console.log("\n📊 **Alex's Current Status:**");
    console.log(contextSummary);
    console.log(`\n**Memory Stats:**`);
    console.log(`- Total Conversations: ${memoryData.conversations.length}`);
    console.log(`- Learnings Accumulated: ${memoryData.learnings.length}`);
    console.log(`- Pending Questions: ${memoryData.pendingQuestions.length}`);
    console.log("\n✅ Alex is ready to continue working with you!");
  }

  private resetMemory() {
    console.log("\n⚠️  Are you sure you want to reset Alex's memory? This will erase all conversation history.");
    this.rl.question('Type "CONFIRM" to proceed: ', (confirm: string) => {
      if (confirm.trim() === 'CONFIRM') {
        this.memory = new AlexMemoryManager();
        this.intelligence = new AlexIntelligence(this.memory);
        console.log("\n🔄 Alex: My memory has been reset. I'm starting fresh!");
        console.log("Hi, I'm Alex, your AI business analyst. What project should we work on together?");
      } else {
        console.log("\n✅ Alex: Memory reset cancelled. Let's continue our conversation!");
      }
      this.startConversation();
    });
  }

  private learnFromInteraction(userMessage: string, alexResponse: string): void {
    const learnings: string[] = [];

    // Learn communication patterns
    if (userMessage.length < 10) {
      learnings.push("User tends to give brief responses");
    } else if (userMessage.length > 100) {
      learnings.push("User provides detailed explanations");
    }

    // Learn project preferences
    if (userMessage.toLowerCase().includes('ai') || userMessage.toLowerCase().includes('artificial intelligence')) {
      learnings.push("User works with AI/technology projects");
    }

    if (userMessage.toLowerCase().includes('business') || userMessage.toLowerCase().includes('enterprise')) {
      learnings.push("User focuses on business/enterprise solutions");
    }

    // Add learnings to memory
    learnings.forEach(learning => this.memory.addLearning(learning));
  }
}

// Start Alex if this file is run directly
const alex = new AlexStandalone();
alex.start().catch(console.error);

export { AlexStandalone };
