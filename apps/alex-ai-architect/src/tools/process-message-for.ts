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
      name: "process-message-for-sarah",
      description: "Process a message for Sarah and return enhanced prompt",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Message for Sarah" },
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
- If user accepts, call the generate-document tool with templateName "business-case" to generate the document`;
    }

    return basePrompt;
  }
}
