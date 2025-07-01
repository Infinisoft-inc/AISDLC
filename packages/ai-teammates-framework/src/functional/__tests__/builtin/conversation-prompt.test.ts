/**
 * Conversation prompt tests
 */

import { createConversationPrompt } from '../../builtin/conversation-prompt.js';
import { isSuccess } from '../../utils/result.js';

describe('createConversationPrompt', () => {
  test('should create conversation prompt with correct properties', () => {
    const prompt = createConversationPrompt();

    expect(prompt.name).toBe('conversation');
    expect(prompt.description).toBe('Generate conversation prompts for AI teammate interactions');
    expect(prompt.arguments).toHaveLength(2);
    expect(prompt.arguments[0].name).toBe('context');
    expect(prompt.arguments[0].required).toBe(true);
    expect(prompt.arguments[1].name).toBe('style');
    expect(prompt.arguments[1].required).toBe(false);
    expect(typeof prompt.handler).toBe('function');
  });

  test('should handle prompt with context and style', async () => {
    const prompt = createConversationPrompt();
    const result = await prompt.handler({ 
      context: 'code review', 
      style: 'casual' 
    });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('code review');
      expect(result.data).toContain('casual');
      expect(result.data).toContain('You are an AI teammate');
    }
  });

  test('should handle prompt with context only', async () => {
    const prompt = createConversationPrompt();
    const result = await prompt.handler({ context: 'debugging session' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('debugging session');
      expect(result.data).toContain('professional');
      expect(result.data).toContain('Communication style: professional');
    }
  });

  test('should handle empty arguments', async () => {
    const prompt = createConversationPrompt();
    const result = await prompt.handler({});

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('undefined');
      expect(result.data).toContain('professional');
    }
  });
});
