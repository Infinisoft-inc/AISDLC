/**
 * Create prompt definition function
 */

import type { ReadonlyPromptDefinition, ReadonlyPromptArgument, PromptHandler } from '../types/plugin.js';

export const createPrompt = (
  name: string,
  description: string,
  args: readonly ReadonlyPromptArgument[],
  handler: PromptHandler
): ReadonlyPromptDefinition => ({
  name,
  description,
  arguments: args,
  handler
});
