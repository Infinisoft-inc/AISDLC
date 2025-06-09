#!/usr/bin/env node

/**
 * Natural Chat Interface for AI Teammates
 * Allows natural conversation by just mentioning teammate names
 */

import { conversationRouter } from './conversation-router.js';

// Available MCP tools (these would be dynamically loaded in real implementation)
const mcpTools = {
  'chat-with-jordan_jordanProjectManager': async (message: string) => {
    // This would call the actual MCP tool
    return `👨‍💼 **Jordan:** ${message} - I'll help organize this project properly!`;
  }
};

export class NaturalChatInterface {
  
  /**
   * Process user message and route to appropriate teammate
   */
  async processMessage(userMessage: string): Promise<string> {
    // Detect if user wants to talk to a specific teammate
    const { teammate, cleanMessage } = conversationRouter.detectTeammateConversation(userMessage);
    
    if (teammate) {
      if (teammate.status !== 'active') {
        return this.handleInactiveTeammate(teammate);
      }
      
      return await this.chatWithTeammate(teammate, cleanMessage);
    }
    
    // No specific teammate mentioned - show available options
    return this.showTeammateOptions(userMessage);
  }

  private async chatWithTeammate(teammate: any, message: string): Promise<string> {
    try {
      // In real implementation, this would call the actual MCP tool
      if (teammate.name === 'Jordan') {
        // Simulate calling Jordan's MCP tool
        return `👨‍💼 **Jordan:** Hi! You said "${message}". As your AI Project Manager, I'm ready to help organize your project. What specific aspect would you like me to focus on - project structure, GitHub setup, team coordination, or milestone planning?`;
      }
      
      return `🤖 **${teammate.name}:** I received your message "${message}". I'm ready to help with ${teammate.role} tasks!`;
      
    } catch (error) {
      return `❌ Sorry, I couldn't connect to ${teammate.name} right now. Please try again.`;
    }
  }

  private handleInactiveTeammate(teammate: any): string {
    const statusMessages = {
      'training': `🎓 ${teammate.name} is currently completing AI-SDLC training. They'll be available soon!`,
      'inactive': `⚠️ ${teammate.name} hasn't been bootstrapped yet. Would you like me to create them?`
    };
    
    return statusMessages[teammate.status] || `${teammate.name} is not available right now.`;
  }

  private showTeammateOptions(originalMessage: string): string {
    return `I didn't detect a specific teammate mention in: "${originalMessage}"

${conversationRouter.getTeammatesList()}

**Examples:**
- \`jordan, let's organize this project\`
- \`hey alex, I need a business case\`
- \`@sarah can you design the architecture?\`

Who would you like to talk to?`;
  }

  /**
   * Get list of available teammates
   */
  getTeammates(): string {
    return conversationRouter.getTeammatesList();
  }
}

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const chat = new NaturalChatInterface();
  const message = process.argv[2];
  
  if (!message) {
    console.log("Usage: node natural-chat.js \"your message\"");
    console.log("\nExamples:");
    console.log("node natural-chat.js \"jordan, help me organize this project\"");
    console.log("node natural-chat.js \"hey alex, I need a business case\"");
    console.log("node natural-chat.js \"teammates\"");
    process.exit(1);
  }
  
  if (message.toLowerCase() === 'teammates') {
    console.log(chat.getTeammates());
  } else {
    chat.processMessage(message).then(response => {
      console.log(response);
    });
  }
}
