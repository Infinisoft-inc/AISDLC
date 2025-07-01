/**
 * Output log entry function
 */

import type { ReadonlyLogEntry } from '../types/features.js';
import { formatLogEntry } from './format-entry.js';

export const outputLogEntry = (entry: ReadonlyLogEntry): void => {
  const formatted = formatLogEntry(entry);
  
  switch (entry.level) {
    case 'debug':
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
};
