/**
 * Create memory entry function
 */

import type { ReadonlyMemoryEntry } from '../types/features.js';

export const createMemoryEntry = <T>(
  key: string,
  value: T,
  ttl?: number
): ReadonlyMemoryEntry<T> => ({
  key,
  value,
  timestamp: new Date(),
  ttl
});
