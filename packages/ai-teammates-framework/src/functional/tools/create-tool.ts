/**
 * Create tool definition function
 */

import type { ReadonlyToolDefinition, ReadonlyToolSchema, ToolHandler } from '../types/plugin.js';

export const createTool = (
  name: string,
  description: string,
  inputSchema: ReadonlyToolSchema,
  handler: ToolHandler
): ReadonlyToolDefinition => ({
  name,
  description,
  inputSchema,
  handler
});
