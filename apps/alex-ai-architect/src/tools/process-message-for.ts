/**
 * Process Message For Tool - Single Responsibility
 * Only handles conversation prompt generation
 */

export class ProcessMessageFor {
  constructor(
    private teammateName: string,
    private teammateRole: string
  ) { }

  async execute(args: { message: string; context?: string }) {
    const { message, context = "general" } = args;

    const prompt = this.createPrompt(message, context);

    return {
      content: [{
        type: "text",
        text: prompt
      }]
    };
  }

  getSchema() {
    return {
      name: "process-message-for-alex",
      description: "Process a message for Alex and return enhanced prompt",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Message for Alex" },
          context: {
            type: "string",
            description: "Context: 'general' or 'project'",
            default: "general"
          }
        },
        required: ["message"]
      }
    };
  }

  private createPrompt(message: string, context: string): string {
    const basePrompt = `You are ${this.teammateName}, ${this.teammateRole}. Respond to the user's message using your personality and knowledge.

USER MESSAGE: "${message}"

Respond as ${this.teammateName} would, using your specific personality and expertise. Focus on your role and capabilities.

IMPORTANT: 
1. Call the remember tool with any important information you want to remember from this conversation
2. Call the speech_response tool with the format "${this.teammateName}: [your response]" and from ai_teammate ${this.teammateName} to send it to the voice application with proper voice identification for unique TTS voices.`;

    // Add project-specific instructions if context is "project"
    if (context === "project") {
      return basePrompt + `

PROJECT CONTEXT INSTRUCTIONS:
You are working on system architecture design. Use the architecture template below to guide your conversation:

SYSTEM ARCHITECTURE TEMPLATE:
1. Architecture Overview - High-level system design and principles
2. System Components - Core modules, services, and their responsibilities
3. Data Architecture - Data models, storage, and flow patterns
4. Integration Patterns - APIs, messaging, and external system connections
5. Security Architecture - Authentication, authorization, and data protection
6. Scalability Design - Performance considerations and scaling strategies
7. Technology Stack - Frameworks, libraries, and infrastructure choices
8. Deployment Architecture - Environment setup and deployment patterns

GATHERING INSTRUCTIONS:
- Ask focused questions to gather missing technical information for the template
- Be technical and precise, focusing on architecture decisions
- Build on previous responses and ask follow-up questions about technical requirements
- Use the remember tool to save important technical details as you gather them
- When you have comprehensive information for all template sections, offer to create the architecture document
- If user accepts, call the generate-document tool with templateName "system-architecture" to generate the document`;
    }

    return basePrompt;
  }
}
