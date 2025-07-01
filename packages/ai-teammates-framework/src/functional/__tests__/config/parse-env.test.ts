/**
 * Environment parsing tests
 */

import { parseEnvironmentConfig } from '../../config/parse-env.js';
import { isSuccess, isFailure } from '../../utils/result.js';

describe('parseEnvironmentConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should parse minimal environment', () => {
    const result = parseEnvironmentConfig();
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.agent.name).toBe('ai-teammate');
      expect(result.data.transport.type).toBe('stdio');
    }
  });

  test('should parse custom agent configuration', () => {
    process.env.AGENT_NAME = 'custom-agent';
    process.env.AGENT_ROLE = 'Custom Assistant';
    process.env.AGENT_COMMUNICATION_STYLE = 'casual';
    
    const result = parseEnvironmentConfig();
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.agent.name).toBe('custom-agent');
      expect(result.data.agent.role).toBe('Custom Assistant');
      expect(result.data.agent.personality.communicationStyle).toBe('casual');
    }
  });

  test('should parse transport options', () => {
    process.env.TRANSPORT_OPTIONS = '{"host": "localhost", "port": 8080}';
    
    const result = parseEnvironmentConfig();
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.transport.options).toEqual({ host: 'localhost', port: 8080 });
    }
  });

  test('should handle invalid transport options', () => {
    process.env.TRANSPORT_OPTIONS = 'invalid json';
    
    const result = parseEnvironmentConfig();
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.transport.options).toEqual({});
    }
  });

  test('should parse string arrays', () => {
    process.env.AGENT_EXPERTISE = 'typescript,nodejs,testing';
    process.env.ENABLED_TOOLS = 'memory,conversations';

    const result = parseEnvironmentConfig();

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.agent.personality.expertise).toEqual(['typescript', 'nodejs', 'testing']);
      expect(result.data.features.tools.enabledTools).toEqual(['memory', 'conversations']);
    }
  });

  test('should handle JSON parsing errors', () => {
    // Mock a scenario that would cause an error in the try-catch block
    const originalEnv = process.env;

    // Create a scenario that triggers the catch block by corrupting the process
    Object.defineProperty(process, 'env', {
      get() {
        throw new Error('Environment access error');
      },
      configurable: true
    });

    const result = parseEnvironmentConfig();

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toContain('Failed to parse environment configuration');
    }

    // Restore the original process.env
    Object.defineProperty(process, 'env', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
  });
});
