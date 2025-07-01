/**
 * Logger service tests
 */

import { createLoggerService } from '../../services/logger.js';

describe('createLoggerService', () => {
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

  test('should create logger service', () => {
    const logger = createLoggerService('test-agent');
    
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('should create log entry with correct properties', () => {
    const logger = createLoggerService('test-agent', false);
    const entry = logger.info('test message', { key: 'value' });
    
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.agentName).toBe('test-agent');
    expect(entry.context).toEqual({ key: 'value' });
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  test('should output to console when enabled', () => {
    let consoleCalled = false;
    console.info = () => { consoleCalled = true; };

    const logger = createLoggerService('test-agent', true);
    logger.info('test message');

    expect(consoleCalled).toBe(true);
  });

  test('should not output to console when disabled', () => {
    let consoleCalled = false;
    console.info = () => { consoleCalled = true; };

    const logger = createLoggerService('test-agent', false);
    logger.info('test message');

    expect(consoleCalled).toBe(false);
  });

  test('should handle all log levels', () => {
    const logger = createLoggerService('test-agent', false);
    
    expect(logger.debug('debug').level).toBe('debug');
    expect(logger.info('info').level).toBe('info');
    expect(logger.warn('warn').level).toBe('warn');
    expect(logger.error('error').level).toBe('error');
  });

  test('should handle empty context', () => {
    const logger = createLoggerService('test-agent', false);
    const entry = logger.info('test message');
    
    expect(entry.context).toEqual({});
  });
});
