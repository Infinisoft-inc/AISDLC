#!/usr/bin/env node

/**
 * Natural Chat Interface - JavaScript version for immediate use
 * Allows natural conversation by just mentioning teammate names
 */

// Simple teammate detection
function detectTeammate(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  const teammates = {
    'jordan': {
      name: 'Jordan',
      role: 'AI Project Manager',
      status: 'active',
      tool: 'chat-with-jordan_jordanProjectManager'
    },
    'alex': {
      name: 'Alex', 
      role: 'AI Business Analyst',
      status: 'inactive',
      tool: 'chat-with-alex_alexBusinessAnalyst'
    },
    'sarah': {
      name: 'Sarah',
      role: 'AI Architect', 
      status: 'inactive',
      tool: 'chat-with-sarah_sarahArchitect'
    }
  };

  // Check for name mentions
  for (const [key, teammate] of Object.entries(teammates)) {
    const patterns = [
      `${key}:`,
      `${key},`,
      `${key} `,
      `hey ${key}`,
      `hi ${key}`,
      `@${key}`
    ];

    for (const pattern of patterns) {
      if (lowerMessage.startsWith(pattern)) {
        const cleanMessage = message.substring(pattern.length).trim() || "Hi!";
        return { teammate, cleanMessage };
      }
    }
  }

  return { teammate: null, cleanMessage: message };
}

function showTeammates() {
  return `🤖 **Available AI Teammates:**

✅ **Jordan** - AI Project Manager
   Status: active & trained
   Say: "jordan, [your message]" to chat

⚠️ **Alex** - AI Business Analyst  
   Status: not bootstrapped yet

⚠️ **Sarah** - AI Architect
   Status: not bootstrapped yet

**How to chat:**
- Just say the name: \`jordan, let's organize this project\`
- Or use @: \`@jordan what's our project status?\`
- Or casual: \`hey jordan, can you help me?\`

**Jordan is ready to chat right now!** 🚀`;
}

function processMessage(message) {
  const { teammate, cleanMessage } = detectTeammate(message);
  
  if (teammate) {
    if (teammate.status !== 'active') {
      return `⚠️ ${teammate.name} hasn't been bootstrapped yet. Only Jordan is currently available.

Try: "jordan, ${cleanMessage}"`;
    }
    
    if (teammate.name === 'Jordan') {
      return `🎯 **Connecting you to Jordan...**

**Your message:** "${cleanMessage}"

**Jordan will respond with his organized, clear, directive, and collaborative style.**

*Note: In the actual implementation, this would directly call Jordan's MCP tool and return his real response.*

**For now, you can use the MCP tool directly:**
\`chat-with-jordan_jordanProjectManager\` with message: "${cleanMessage}"`;
    }
  }
  
  return `I didn't detect a specific teammate mention in: "${message}"

${showTeammates()}`;
}

// CLI usage
const message = process.argv[2];

if (!message) {
  console.log("Usage: node chat-interface.js \"your message\"");
  console.log("\nExamples:");
  console.log("node chat-interface.js \"jordan, help me organize this project\"");
  console.log("node chat-interface.js \"teammates\"");
  process.exit(1);
}

if (message.toLowerCase() === 'teammates') {
  console.log(showTeammates());
} else {
  console.log(processMessage(message));
}
