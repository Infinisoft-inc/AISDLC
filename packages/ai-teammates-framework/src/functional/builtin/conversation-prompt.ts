/**
 * Built-in conversation prompt
 */

import type { ReadonlyPromptDefinition, ReadonlyPromptArgument } from '../types/plugin.js';
import type { ReadonlyRecord } from '../types/features.js';
import type { Result } from '../types/result.js';
import { success } from '../utils/result.js';
import { createPrompt } from '../tools/create-prompt.js';

const conversationPromptArgs: readonly ReadonlyPromptArgument[] = [
  {
    name: 'context',
    description: 'Conversation context or topic',
    required: true
  },
  {
    name: 'style',
    description: 'Communication style preference',
    required: false
  }
];

const conversationPromptHandler = async (
  args: ReadonlyRecord<string, unknown>
): Promise<Result<string>> => {
  const context = args.context as string;
  const style = (args.style as string) || 'professional';
  
  const prompt = `You are an AI teammate engaging in conversation about: ${context}
Communication style: ${style}
Please provide helpful, accurate, and contextually appropriate responses.`;

  return success(prompt);
};

export const createConversationPrompt = (): ReadonlyPromptDefinition =>
  createPrompt(
    'conversation',
    'Generate conversation prompts for AI teammate interactions',
    conversationPromptArgs,
    conversationPromptHandler
  );
