/**
 * Filter valid (non-expired) memory entries
 */

import type { ReadonlyMemoryEntry } from '../types/features.js';
import { isMemoryEntryExpired } from './is-expired.js';

export const filterValidMemoryEntries = <T>(
  entries: readonly ReadonlyMemoryEntry<T>[]
): readonly ReadonlyMemoryEntry<T>[] =>
  entries.filter(entry => !isMemoryEntryExpired(entry));
