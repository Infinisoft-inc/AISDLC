/**
 * Process Message
 * Single responsibility: Process messages for Jordan and return enhanced prompts
 */

import { buildJordanContext } from './contextBuilder.js';
import { createEnhancedPrompt } from './promptBuilder.js';
import type { JordanMemoryManager } from '../memory.js';

export async function processMessageForJordan(
  message: string,
  context: string,
  memory: JordanMemoryManager
): Promise<string> {
  // Get Jordan's current memory and context
  const memoryData = memory.getMemory();
  const recentConversations = memory.getRecentConversations(5);

  // Build Jordan's context for the LLM
  const jordanContext = buildJordanContext(memoryData, recentConversations, context);

  // Create the enhanced prompt for the LLM to respond as Jordan
  const enhancedPrompt = createEnhancedPrompt(jordanContext, message);

  // Return the enhanced prompt for the main LLM to process
  return enhancedPrompt;
}
