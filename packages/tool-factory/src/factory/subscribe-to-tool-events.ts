/**
 * Tool Event Subscriber
 * SRP: Event subscription only
 */

import { sharedEventHub } from './shared-event-hub';
import type { ToolEvent } from '../types';

/**
 * Subscribe to all tool execution events
 */
export function subscribeToAllToolEvents<TArgs, TResult>(
  callback: (event: ToolEvent<TArgs, TResult>) => void
): () => void {
  return sharedEventHub.on('tool.executed', callback);
}

/**
 * Subscribe to specific tool events by name
 */
export function subscribeToToolEvents<TArgs, TResult>(
  toolName: string,
  callback: (event: ToolEvent<TArgs, TResult>) => void
): () => void {
  return sharedEventHub.on(`tool.${toolName}.executed`, callback);
}

/**
 * Subscribe to tool events matching a pattern
 */
export function subscribeToToolPattern<TArgs, TResult>(
  pattern: RegExp,
  callback: (event: ToolEvent<TArgs, TResult>) => void
): () => void {
  return sharedEventHub.on(pattern, callback);
}
