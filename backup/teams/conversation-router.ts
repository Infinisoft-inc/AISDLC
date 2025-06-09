/**
 * Natural Conversation Router for AI Teammates
 * Enables natural human-friendly conversations by just mentioning teammate names
 */

interface AITeammate {
  name: string;
  role: string;
  mcpTool: string;
  status: 'active' | 'training' | 'inactive';
  greeting: string;
}

export class ConversationRouter {
  private teammates: Map<string, AITeammate> = new Map();

  constructor() {
    this.initializeTeammates();
  }

  private initializeTeammates(): void {
    // Register all AI teammates
    this.teammates.set('jordan', {
      name: 'Jordan',
      role: 'AI Project Manager',
      mcpTool: 'chat-with-jordan_jordanProjectManager',
      status: 'active',
      greeting: "Hi, I'm Jordan, your AI Project Manager. Let's get this project organized properly."
    });

    this.teammates.set('alex', {
      name: 'Alex',
      role: 'AI Business Analyst',
      mcpTool: 'chat-with-alex_alexBusinessAnalyst',
      status: 'inactive',
      greeting: "Hi! I'm Alex, your AI Business Analyst. What project are we working on today?"
    });

    this.teammates.set('sarah', {
      name: 'Sarah',
      role: 'AI Architect',
      mcpTool: 'chat-with-sarah_sarahArchitect',
      status: 'inactive',
      greeting: "Hello, I'm Sarah, your AI Architect. Let's design a robust system architecture."
    });

    this.teammates.set('mike', {
      name: 'Mike',
      role: 'AI Developer',
      mcpTool: 'chat-with-mike_mikeDeveloper',
      status: 'inactive',
      greeting: "Got it! I'm Mike, your AI Developer. Ready to implement some great code!"
    });

    this.teammates.set('sam', {
      name: 'Sam',
      role: 'AI QA Engineer',
      mcpTool: 'chat-with-sam_samQAEngineer',
      status: 'inactive',
      greeting: "I'm Sam, your AI QA Engineer. Let's ensure top quality in everything we build."
    });

    this.teammates.set('riley', {
      name: 'Riley',
      role: 'AI DevOps Engineer',
      mcpTool: 'chat-with-riley_rileyDevOps',
      status: 'inactive',
      greeting: "I'm Riley, your AI DevOps Engineer. I'll handle the deployment and infrastructure."
    });
  }

  /**
   * Detect if user message is trying to talk to a specific teammate
   */
  detectTeammateConversation(message: string): { teammate: AITeammate | null, cleanMessage: string } {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for direct name mentions at start
    for (const [key, teammate] of this.teammates) {
      const patterns = [
        `${key.toLowerCase()}:`,
        `${key.toLowerCase()},`,
        `${key.toLowerCase()} `,
        `hey ${key.toLowerCase()}`,
        `hi ${key.toLowerCase()}`,
        `hello ${key.toLowerCase()}`,
        `@${key.toLowerCase()}`
      ];

      for (const pattern of patterns) {
        if (lowerMessage.startsWith(pattern)) {
          const cleanMessage = message.substring(pattern.length).trim();
          return { teammate, cleanMessage: cleanMessage || "Hi!" };
        }
      }
    }

    // Check for name mentions anywhere in the message
    for (const [key, teammate] of this.teammates) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return { teammate, cleanMessage: message };
      }
    }

    return { teammate: null, cleanMessage: message };
  }

  /**
   * Get available teammates and their status
   */
  getTeammatesList(): string {
    let list = "🤖 **Available AI Teammates:**\n\n";
    
    for (const teammate of this.teammates.values()) {
      const statusIcon = teammate.status === 'active' ? '✅' : 
                        teammate.status === 'training' ? '🎓' : '⚠️';
      
      list += `${statusIcon} **${teammate.name}** - ${teammate.role}\n`;
      list += `   Status: ${teammate.status}\n`;
      if (teammate.status === 'active') {
        list += `   Say: "${teammate.name.toLowerCase()}, [your message]" to chat\n`;
      }
      list += `\n`;
    }

    list += "**How to chat:**\n";
    list += "- Just say the name: `jordan, let's organize this project`\n";
    list += "- Or use @: `@jordan what's our project status?`\n";
    list += "- Or casual: `hey jordan, can you help me?`\n";

    return list;
  }

  /**
   * Update teammate status
   */
  updateTeammateStatus(name: string, status: 'active' | 'training' | 'inactive'): void {
    const teammate = this.teammates.get(name.toLowerCase());
    if (teammate) {
      teammate.status = status;
    }
  }

  /**
   * Get teammate by name
   */
  getTeammate(name: string): AITeammate | undefined {
    return this.teammates.get(name.toLowerCase());
  }

  /**
   * Generate natural conversation starter
   */
  generateConversationStarter(teammate: AITeammate, userMessage: string): string {
    if (userMessage.toLowerCase().trim() === "hi!" || 
        userMessage.toLowerCase().trim() === "hello!" ||
        userMessage.toLowerCase().trim() === "hey!") {
      return teammate.greeting;
    }
    
    return `${teammate.greeting}\n\nYou said: "${userMessage}"\n\nHow can I help you with that?`;
  }
}

// Export singleton instance
export const conversationRouter = new ConversationRouter();
