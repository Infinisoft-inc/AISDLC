/**
 * Functional memory service composition
 */

import type { ReadonlyMemoryEntry } from '../types/features.js';
import { createMemoryEntry } from '../memory/create-entry.js';
import { filterValidMemoryEntries } from '../memory/filter-valid.js';

export interface MemoryService {
  readonly set: <T>(key: string, value: T, ttl?: number) => ReadonlyMemoryEntry<T>;
  readonly get: <T>(key: string, entries: readonly ReadonlyMemoryEntry<T>[]) => T | undefined;
  readonly has: (key: string, entries: readonly ReadonlyMemoryEntry[]) => boolean;
  readonly delete: (key: string, entries: readonly ReadonlyMemoryEntry[]) => readonly ReadonlyMemoryEntry[];
  readonly clear: () => readonly ReadonlyMemoryEntry[];
  readonly getAll: (entries: readonly ReadonlyMemoryEntry[]) => readonly ReadonlyMemoryEntry[];
  readonly size: (entries: readonly ReadonlyMemoryEntry[]) => number;
}

export const createMemoryService = (): MemoryService => ({
  set: <T>(key: string, value: T, ttl?: number): ReadonlyMemoryEntry<T> =>
    createMemoryEntry(key, value, ttl),

  get: <T>(key: string, entries: readonly ReadonlyMemoryEntry<T>[]): T | undefined => {
    const validEntries = filterValidMemoryEntries(entries);
    const entry = validEntries.find(e => e.key === key);
    return entry?.value;
  },

  has: (key: string, entries: readonly ReadonlyMemoryEntry[]): boolean => {
    const validEntries = filterValidMemoryEntries(entries);
    return validEntries.some(e => e.key === key);
  },

  delete: (key: string, entries: readonly ReadonlyMemoryEntry[]): readonly ReadonlyMemoryEntry[] =>
    filterValidMemoryEntries(entries).filter(e => e.key !== key),

  clear: (): readonly ReadonlyMemoryEntry[] => [],

  getAll: (entries: readonly ReadonlyMemoryEntry[]): readonly ReadonlyMemoryEntry[] =>
    filterValidMemoryEntries(entries),

  size: (entries: readonly ReadonlyMemoryEntry[]): number =>
    filterValidMemoryEntries(entries).length
});
