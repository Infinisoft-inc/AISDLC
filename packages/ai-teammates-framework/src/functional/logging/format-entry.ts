/**
 * Format log entry function
 */

import type { ReadonlyLogEntry } from '../types/features.js';

export const formatLogEntry = (entry: ReadonlyLogEntry): string => {
  const timestamp = entry.timestamp.toISOString().substring(11, 19);
  const level = entry.level.toUpperCase().padEnd(5);
  const context = Object.keys(entry.context).length > 0 
    ? ` ${JSON.stringify(entry.context)}`
    : '';
  
  return `${timestamp} [${level}] [${entry.agentName}] ${entry.message}${context}`;
};
