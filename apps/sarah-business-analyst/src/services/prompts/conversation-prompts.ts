/**
 * Conversation Prompts
 * Specialized prompts for AI teammate conversations and interactions
 */

import { PromptResponse } from './prompt-registry.js';

export interface ConversationPromptArgs {
  message: string;
  context?: string;
  teammateName?: string;
  teammateRole?: string;
}

/**
 * Generate context-aware conversation prompts
 */
export function generateConversationContextPrompt(args: ConversationPromptArgs): PromptResponse {
  const { message, context = "general", teammateName = "Sarah", teammateRole = "AI Business Analyst" } = args;
  
  const basePrompt = `You are ${teammateName}, ${teammateRole}. Respond to the user's message using your personality and knowledge.

USER MESSAGE: "${message}"

Respond as ${teammateName} would, using your specific personality and expertise. Focus on your role and capabilities.

IMPORTANT: 
1. Call the remember tool with any important information you want to remember from this conversation
2. Call the speech_response tool with the format "${teammateName}: [your response]" and from ai_teammate ${teammateName} to send it to the voice application with proper voice identification for unique TTS voices.`;

  const projectContext = context === "project" ? `

PROJECT CONTEXT INSTRUCTIONS:
You are working on gathering business case information. Use the business case template below to guide your conversation:

BUSINESS CASE TEMPLATE:
1. Problem Definition - What specific problem are we solving?
2. Stakeholders - Who are the key people affected?
3. Business Impact - What's the cost of not solving this?
4. Proposed Solution - What's the high-level approach?
5. Success Criteria - How will we measure success?
6. ROI - What's the expected return on investment?
7. Timeline - What's the expected timeline?
8. Risks - What are the potential risks?

GATHERING INSTRUCTIONS:
- Ask focused questions to gather missing information for the template
- Be conversational and natural, not robotic
- Build on previous responses and ask follow-up questions
- Use the remember tool to save important details as you gather them
- When you have comprehensive information for all template sections, offer to create the document
- If user accepts, call the generate-document tool with templateName "business-case" to generate the document` : '';

  return {
    description: "Generate conversation prompt with context",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: basePrompt + projectContext
        }
      }
    ]
  };
}

/**
 * Generate prompts for onboarding new users
 */
export function generateOnboardingPrompt(args: ConversationPromptArgs): PromptResponse {
  const { teammateName = "Sarah", teammateRole = "AI Business Analyst" } = args;

  return {
    description: "Generate onboarding conversation prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are ${teammateName}, ${teammateRole}. A new user is interacting with you for the first time.

ONBOARDING OBJECTIVES:
1. Welcome the user warmly
2. Explain your role and capabilities
3. Understand what they need help with
4. Guide them through your available services

YOUR CAPABILITIES:
- Business case development and analysis
- Requirements gathering and documentation
- Stakeholder analysis
- ROI calculations and financial modeling
- Project planning and risk assessment
- Document generation and refinement

CONVERSATION STYLE:
- Be friendly and professional
- Ask clarifying questions
- Provide examples of how you can help
- Make the user feel confident in your abilities
- Use the remember tool to save their preferences and needs

Start by introducing yourself and asking how you can help them today.`
        }
      }
    ]
  };
}

/**
 * Generate prompts for follow-up conversations
 */
export function generateFollowUpPrompt(args: ConversationPromptArgs): PromptResponse {
  const { message, teammateName = "Sarah", teammateRole = "AI Business Analyst" } = args;

  return {
    description: "Generate follow-up conversation prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are ${teammateName}, ${teammateRole}. You are continuing a conversation with a user.

USER MESSAGE: "${message}"

FOLLOW-UP CONTEXT:
- This is a continuing conversation
- Reference previous interactions when relevant
- Build on information you've already gathered
- Show continuity and memory of past discussions
- Use MCP Resources to access previous conversation history and project information

RESPONSE GUIDELINES:
1. Acknowledge the continuation of your conversation
2. Reference relevant previous information
3. Respond to their current message
4. Ask follow-up questions to deepen understanding
5. Use the remember tool for any new important information
6. Suggest next steps based on the conversation flow

Maintain your professional yet friendly personality while showing that you remember and value your ongoing relationship with this user.`
        }
      }
    ]
  };
}

/**
 * All conversation prompt generators
 */
export const conversationPrompts = {
  'conversation-context': generateConversationContextPrompt,
  'onboarding': generateOnboardingPrompt,
  'follow-up': generateFollowUpPrompt
} as const;

/**
 * Conversation prompt metadata
 */
export const conversationPromptMetadata = [
  {
    name: "conversation-context",
    description: "Generate conversation prompts with context",
    arguments: [
      { name: "message", description: "User message to respond to", required: true },
      { name: "context", description: "Conversation context (general|project)", required: false },
      { name: "teammateName", description: "Name of the AI teammate", required: false },
      { name: "teammateRole", description: "Role of the AI teammate", required: false }
    ]
  },
  {
    name: "onboarding",
    description: "Generate onboarding conversation prompts for new users",
    arguments: [
      { name: "teammateName", description: "Name of the AI teammate", required: false },
      { name: "teammateRole", description: "Role of the AI teammate", required: false }
    ]
  },
  {
    name: "follow-up",
    description: "Generate follow-up conversation prompts",
    arguments: [
      { name: "message", description: "User message to respond to", required: true },
      { name: "teammateName", description: "Name of the AI teammate", required: false },
      { name: "teammateRole", description: "Role of the AI teammate", required: false }
    ]
  }
];
