/**
 * Tool Event Emitter
 * SRP: Event emission only
 */

import { sharedEventHub } from './shared-event-hub';
import type { ToolEvent } from '../types';

/**
 * Emits tool execution event to the BrainStack hub
 */
export function emitToolEvent<TArgs, TResult>(
  event: ToolEvent<TArgs, TResult>
): void {
  // Emit specific tool event
  sharedEventHub.emit(`tool.${event.toolName}.executed`, event);

  // Emit generic tool event for global listeners
  sharedEventHub.emit('tool.executed', event);
}
