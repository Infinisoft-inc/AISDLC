/**
 * Handle MCP prompt get function
 */

import type { ReadonlyMCPPromptRequest, ReadonlyMCPResponse } from '../types/mcp.js';
import type { ReadonlyPromptDefinition } from '../types/plugin.js';
import { createMCPResponse } from './create-response.js';
import { isSuccess } from '../utils/result.js';

export const handlePromptGet = async (
  request: ReadonlyMCPPromptRequest,
  prompts: readonly ReadonlyPromptDefinition[]
): Promise<ReadonlyMCPResponse> => {
  const promptName = request.params?.name;
  const args = request.params?.arguments || {};

  if (!promptName) {
    return createMCPResponse('Prompt name is required', true);
  }

  const prompt = prompts.find(p => p.name === promptName);
  if (!prompt) {
    return createMCPResponse(`Prompt '${promptName}' not found`, true);
  }

  try {
    const result = await prompt.handler(args);
    
    if (isSuccess(result)) {
      return createMCPResponse(result.data);
    } else {
      return createMCPResponse(result.error, true);
    }
  } catch (error) {
    return createMCPResponse(`Prompt execution failed: ${String(error)}`, true);
  }
};
