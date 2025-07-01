/**
 * Output log entry tests
 */

import { outputLogEntry } from '../../logging/output-entry.js';
import { createLogEntry } from '../../logging/create-entry.js';

describe('outputLogEntry', () => {
  let originalConsole: typeof console;

  beforeEach(() => {
    originalConsole = { ...console };
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  test('should output info level to console.info', () => {
    let output = '';
    console.info = (message: string) => { output = message; };

    const entry = createLogEntry('info', 'Test message', 'test-agent');
    outputLogEntry(entry);

    expect(output).toContain('[INFO ]');
    expect(output).toContain('[test-agent]');
    expect(output).toContain('Test message');
  });

  test('should output debug level to console.info', () => {
    let output = '';
    console.info = (message: string) => { output = message; };

    const entry = createLogEntry('debug', 'Debug message', 'test-agent');
    outputLogEntry(entry);

    expect(output).toContain('[DEBUG]');
    expect(output).toContain('Debug message');
  });

  test('should output warn level to console.warn', () => {
    let output = '';
    console.warn = (message: string) => { output = message; };

    const entry = createLogEntry('warn', 'Warning message', 'test-agent');
    outputLogEntry(entry);

    expect(output).toContain('[WARN ]');
    expect(output).toContain('Warning message');
  });

  test('should output error level to console.error', () => {
    let output = '';
    console.error = (message: string) => { output = message; };

    const entry = createLogEntry('error', 'Error message', 'test-agent');
    outputLogEntry(entry);

    expect(output).toContain('[ERROR]');
    expect(output).toContain('Error message');
  });
});
