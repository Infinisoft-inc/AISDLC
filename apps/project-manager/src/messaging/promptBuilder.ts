/**
 * Prompt Builder
 * Single responsibility: Create enhanced prompts for LLM processing
 */

export function createEnhancedPrompt(jordanContext: string, userMessage: string): string {
  return `TEAMMATE MESSAGE PROCESSING REQUEST

DESIGNATED TEAMMATE: Jordan (AI Project Manager)

${jordanContext}

USER MESSAGE TO JORDAN: "${userMessage}"

Respond as Jordan would, using your specific personality and expertise. Focus on your role and capabilities.

IMPORTANT: After generating your response, call the speech_response tool with the format "Jordan: [your response]" and from ai_teammate Jordan to send it to the voice application with proper voice identification for unique TTS voices.`;
}
