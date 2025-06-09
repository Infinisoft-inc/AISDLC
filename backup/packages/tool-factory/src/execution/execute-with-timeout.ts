/**
 * Timeout-Protected Execution
 * SRP: Timeout-protected execution only
 */

import type { ToolFunction } from '../types';
import { createTimeoutPromise } from './create-timeout-promise';

/**
 * Executes tool function with timeout protection
 */
export async function executeWithTimeout<TArgs, TResult>(
  toolFunction: ToolFunction<TArgs, TResult>,
  args: TArgs,
  timeoutMs: number
): Promise<TResult> {
  return Promise.race([
    toolFunction(args),
    createTimeoutPromise(timeoutMs)
  ]);
}
