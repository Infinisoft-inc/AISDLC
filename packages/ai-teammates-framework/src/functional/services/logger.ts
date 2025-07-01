/**
 * Functional logger service composition
 */

import type { ReadonlyLogEntry, ReadonlyRecord } from '../types/features.js';
import { createLogEntry } from '../logging/create-entry.js';
import { outputLogEntry } from '../logging/output-entry.js';
import { pipe } from '../utils/compose.js';

export interface LoggerService {
  readonly info: (message: string, context?: ReadonlyRecord<string, unknown>) => ReadonlyLogEntry;
  readonly warn: (message: string, context?: ReadonlyRecord<string, unknown>) => ReadonlyLogEntry;
  readonly error: (message: string, context?: ReadonlyRecord<string, unknown>) => ReadonlyLogEntry;
  readonly debug: (message: string, context?: ReadonlyRecord<string, unknown>) => ReadonlyLogEntry;
}

export const createLoggerService = (
  agentName: string,
  enableConsole = true
): LoggerService => {
  const logWithOutput = (entry: ReadonlyLogEntry): ReadonlyLogEntry => {
    if (enableConsole) {
      outputLogEntry(entry);
    }
    return entry;
  };

  const createAndOutput = (
    level: 'debug' | 'info' | 'warn' | 'error'
  ) => (message: string, context: ReadonlyRecord<string, unknown> = {}): ReadonlyLogEntry =>
    pipe(createLogEntry(level, message, agentName, context))
      .to(logWithOutput)
      .value();

  return {
    info: createAndOutput('info'),
    warn: createAndOutput('warn'),
    error: createAndOutput('error'),
    debug: createAndOutput('debug')
  };
};
