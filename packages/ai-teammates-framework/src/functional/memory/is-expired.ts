/**
 * Check if memory entry is expired
 */

import type { ReadonlyMemoryEntry } from '../types/features.js';

export const isMemoryEntryExpired = (entry: ReadonlyMemoryEntry): boolean => {
  if (!entry.ttl) {
    return false;
  }
  
  const now = Date.now();
  const entryTime = entry.timestamp.getTime();
  const expirationTime = entryTime + (entry.ttl * 1000);
  
  return now > expirationTime;
};
