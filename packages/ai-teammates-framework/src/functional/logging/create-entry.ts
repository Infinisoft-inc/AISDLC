/**
 * Create log entry function
 */

import type { ReadonlyLogEntry, ReadonlyRecord } from '../types/features.js';

export const createLogEntry = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  agentName: string,
  context: ReadonlyRecord<string, unknown> = {}
): ReadonlyLogEntry => ({
  timestamp: new Date(),
  level,
  message,
  context,
  agentName
});
