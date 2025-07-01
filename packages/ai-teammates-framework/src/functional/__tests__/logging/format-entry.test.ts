/**
 * Format log entry tests
 */

import { formatLogEntry } from '../../logging/format-entry.js';
import { createLogEntry } from '../../logging/create-entry.js';

describe('formatLogEntry', () => {
  test('should format log entry with context', () => {
    const entry = createLogEntry('info', 'Test message', 'test-agent', { userId: '123' });
    const formatted = formatLogEntry(entry);

    expect(formatted).toContain('[INFO ]');
    expect(formatted).toContain('[test-agent]');
    expect(formatted).toContain('Test message');
    expect(formatted).toContain('{"userId":"123"}');
  });

  test('should format log entry without context', () => {
    const entry = createLogEntry('info', 'Test message', 'test-agent', {});
    const formatted = formatLogEntry(entry);

    expect(formatted).toContain('[INFO ]');
    expect(formatted).toContain('[test-agent]');
    expect(formatted).toContain('Test message');
    expect(formatted).not.toContain('{}');
  });

  test('should format different log levels', () => {
    const debugEntry = createLogEntry('debug', 'Debug message', 'test-agent');
    const warnEntry = createLogEntry('warn', 'Warning message', 'test-agent');
    const errorEntry = createLogEntry('error', 'Error message', 'test-agent');

    expect(formatLogEntry(debugEntry)).toContain('[DEBUG]');
    expect(formatLogEntry(warnEntry)).toContain('[WARN ]');
    expect(formatLogEntry(errorEntry)).toContain('[ERROR]');
  });
});
