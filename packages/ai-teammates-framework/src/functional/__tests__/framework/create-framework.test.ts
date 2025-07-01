/**
 * Create framework tests
 */

import { createFramework } from '../../framework/create-framework.js';
import { createTool } from '../../tools/create-tool.js';
import { createResource } from '../../tools/create-resource.js';
import { createPrompt } from '../../tools/create-prompt.js';
import { success } from '../../utils/result.js';

describe('createFramework', () => {
  const mockConfig = {
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
    transport: { type: 'stdio' as const, options: {} },
    features: {
      resources: { uriPrefix: 'test-agent', conversationHistoryLimit: 50, enabledResources: [] },
      tools: { namePrefix: 'test-agent', enabledTools: [] },
      prompts: { enabledPrompts: [], templatePath: './prompts' }
    }
  };

  test('should create framework with minimal configuration', () => {
    const framework = createFramework(mockConfig);

    expect(framework.config).toBe(mockConfig);
    expect(typeof framework.logger.info).toBe('function');
    expect(typeof framework.memory.set).toBe('function');
    expect(typeof framework.uriBuilder.memory).toBe('function');
    expect(framework.tools).toEqual([]);
    expect(framework.resources).toEqual([]);
    expect(framework.prompts).toEqual([]);
  });

  test('should create framework with tools, resources, and prompts', () => {
    const tool = createTool('test-tool', 'Test tool', { type: 'object', properties: {} }, async () => success('test'));
    const resource = createResource('test://resource', 'Test Resource', 'Test', 'text/plain', async () => success('test'));
    const prompt = createPrompt('test-prompt', 'Test prompt', [], async () => success('test'));

    const framework = createFramework(mockConfig, [tool], [resource], [prompt]);

    expect(framework.tools).toHaveLength(1);
    expect(framework.tools[0]).toBe(tool);
    expect(framework.resources).toHaveLength(1);
    expect(framework.resources[0]).toBe(resource);
    expect(framework.prompts).toHaveLength(1);
    expect(framework.prompts[0]).toBe(prompt);
  });

  test('should create services with correct configuration', () => {
    const framework = createFramework(mockConfig);

    // Test logger uses agent name
    const logEntry = framework.logger.info('test message');
    expect(logEntry.agentName).toBe('test-agent');

    // Test URI builder uses correct prefix
    const memoryUri = framework.uriBuilder.memory('test-key');
    expect(memoryUri).toBe('test-agent://memory/test-key');
  });
});
