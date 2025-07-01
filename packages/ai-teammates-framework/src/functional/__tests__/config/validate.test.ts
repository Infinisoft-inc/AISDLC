/**
 * Configuration validation tests
 */

import { validateConfig } from '../../config/validate.js';
import type { ReadonlyConfig } from '../../types/core.js';

describe('validateConfig', () => {
  const validConfig: ReadonlyConfig = {
    agent: {
      name: 'test-agent',
      role: 'Test Assistant',
      personality: {
        avatar: '🤖',
        voice: 'professional',
        expertise: ['testing'],
        communicationStyle: 'professional',
        defaultPrompts: []
      }
    },
    organization: {
      name: 'test-org',
      defaultRepo: 'test-repo',
      defaultBranch: 'main',
      defaultReviewer: 'reviewer'
    },
    integrations: {
      doppler: { token: '', project: '', environment: 'test' },
      storage: { type: 'mock', basePath: './test', github: { owner: '', repo: '', branch: 'main' } },
      github: { token: '', organization: '', commentSignature: 'Test' }
    },
    transport: { type: 'stdio', options: {} },
    features: {
      resources: { uriPrefix: 'test', conversationHistoryLimit: 50, enabledResources: [] },
      tools: { namePrefix: 'test', enabledTools: [] },
      prompts: { enabledPrompts: [], templatePath: './prompts' }
    }
  };

  test('should validate correct configuration', () => {
    const result = validateConfig(validConfig);
    expect(result.valid).toBe(true);
  });

  test('should reject invalid transport type', () => {
    const invalidConfig = {
      ...validConfig,
      transport: { ...validConfig.transport, type: 'invalid' as 'stdio' | 'sse' }
    };
    
    const result = validateConfig(invalidConfig);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual({
        path: 'transport.type',
        message: 'Transport type must be one of: stdio, sse',
        value: 'invalid'
      });
    }
  });

  test('should reject invalid conversation history limit', () => {
    const invalidConfig = {
      ...validConfig,
      features: {
        ...validConfig.features,
        resources: { ...validConfig.features.resources, conversationHistoryLimit: 0 }
      }
    };
    
    const result = validateConfig(invalidConfig);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual({
        path: 'features.resources.conversationHistoryLimit',
        message: 'Conversation history limit must be at least 1',
        value: 0
      });
    }
  });

  test('should reject empty agent name', () => {
    const invalidConfig = {
      ...validConfig,
      agent: { ...validConfig.agent, name: '   ' }
    };
    
    const result = validateConfig(invalidConfig);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual({
        path: 'agent.name',
        message: 'Agent name is required',
        value: '   '
      });
    }
  });
});
