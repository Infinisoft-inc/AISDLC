/**
 * Handle prompt get tests
 */

import { handlePromptGet } from '../../mcp/handle-prompt-get.js';
import { createPrompt } from '../../tools/create-prompt.js';
import { success, failure } from '../../utils/result.js';
import type { ReadonlyRecord } from '../../types/features.js';

describe('handlePromptGet', () => {
  test('should handle successful prompt get', async () => {
    const handler = async () => success('Generated prompt content');
    const prompt = createPrompt('test-prompt', 'Test prompt', [], handler);
    
    const request = { params: { name: 'test-prompt', arguments: {} } };

    const response = await handlePromptGet(request, [prompt]);

    expect(response.isError).toBe(false);
    expect(response.content?.[0]?.text).toBe('Generated prompt content');
  });

  test('should handle prompt execution failure', async () => {
    const handler = async () => failure('Prompt generation failed');
    const prompt = createPrompt('test-prompt', 'Test prompt', [], handler);
    
    const request = { params: { name: 'test-prompt', arguments: {} } };

    const response = await handlePromptGet(request, [prompt]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Prompt generation failed');
  });

  test('should handle missing prompt name', async () => {
    const request = { params: {} };

    const response = await handlePromptGet(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Prompt name is required');
  });

  test('should handle prompt not found', async () => {
    const request = { params: { name: 'nonexistent-prompt', arguments: {} } };

    const response = await handlePromptGet(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe("Prompt 'nonexistent-prompt' not found");
  });

  test('should handle prompt handler exception', async () => {
    const handler = async () => {
      throw new Error('Handler crashed');
    };
    const prompt = createPrompt('test-prompt', 'Test prompt', [], handler);
    
    const request = { params: { name: 'test-prompt', arguments: {} } };

    const response = await handlePromptGet(request, [prompt]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toContain('Prompt execution failed');
  });

  test('should handle prompt with arguments', async () => {
    const handler = async (args: ReadonlyRecord<string, unknown>) => success(`Prompt with context: ${args.context}`);
    const prompt = createPrompt('test-prompt', 'Test prompt', [], handler);
    
    const request = { 
      params: { 
        name: 'test-prompt', 
        arguments: { context: 'test context' } 
      } 
    };

    const response = await handlePromptGet(request, [prompt]);

    expect(response.isError).toBe(false);
    expect(response.content?.[0]?.text).toBe('Prompt with context: test context');
  });
});
