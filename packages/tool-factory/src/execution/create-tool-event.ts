/**
 * Tool Event Creator
 * SRP: Event creation only
 */

import type { ToolEvent, ToolResult } from '../types';

/**
 * Creates tool execution event
 */
export function createToolEvent<TArgs, TResult>(
  toolName: string,
  args: TArgs,
  result: ToolResult<TResult>
): ToolEvent<TArgs, TResult> {
  return {
    toolName,
    args,
    result,
    timestamp: new Date()
  };
}
