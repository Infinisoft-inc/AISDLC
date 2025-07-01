/**
 * Handle MCP tool call function
 */

import type { ReadonlyMCPToolCallRequest, ReadonlyMCPResponse } from '../types/mcp.js';
import type { ReadonlyToolDefinition } from '../types/plugin.js';
import { createMCPResponse } from './create-response.js';
import { isSuccess } from '../utils/result.js';

export const handleToolCall = async (
  request: ReadonlyMCPToolCallRequest,
  tools: readonly ReadonlyToolDefinition[]
): Promise<ReadonlyMCPResponse> => {
  const toolName = request.params?.name;
  const args = request.params?.arguments || {};

  if (!toolName) {
    return createMCPResponse('Tool name is required', true);
  }

  const tool = tools.find(t => t.name === toolName);
  if (!tool) {
    return createMCPResponse(`Tool '${toolName}' not found`, true);
  }

  try {
    const result = await tool.handler(args);
    
    if (isSuccess(result)) {
      return createMCPResponse(result.data);
    } else {
      return createMCPResponse(result.error, true);
    }
  } catch (error) {
    return createMCPResponse(`Tool execution failed: ${String(error)}`, true);
  }
};
