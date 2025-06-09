/**
 * Error Result Creator
 * SRP: Error result creation only
 */

import type { ToolResult } from '../types';

/**
 * Creates error result wrapper
 */
export function createErrorResult<T>(
  error: string,
  executionTime?: number
): ToolResult<T> {
  return {
    success: false,
    error,
    executionTime
  };
}
