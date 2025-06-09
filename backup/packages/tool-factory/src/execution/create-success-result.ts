/**
 * Success Result Creator
 * SRP: Success result creation only
 */

import type { ToolResult } from '../types';

/**
 * Creates success result wrapper
 */
export function createSuccessResult<T>(
  data: T,
  executionTime?: number
): ToolResult<T> {
  return {
    success: true,
    data,
    executionTime
  };
}
