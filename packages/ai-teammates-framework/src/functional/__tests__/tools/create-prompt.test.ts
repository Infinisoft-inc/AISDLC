/**
 * Create prompt tests
 */

import { createPrompt } from '../../tools/create-prompt.js';
import { success } from '../../utils/result.js';

describe('createPrompt', () => {
  test('should create prompt definition', () => {
    const args = [
      { name: 'topic', description: 'Topic to discuss', required: true },
      { name: 'style', description: 'Communication style', required: false }
    ];

    const handler = async () => success('Generated prompt');

    const prompt = createPrompt('test-prompt', 'Test prompt description', args, handler);

    expect(prompt.name).toBe('test-prompt');
    expect(prompt.description).toBe('Test prompt description');
    expect(prompt.arguments).toBe(args);
    expect(prompt.handler).toBe(handler);
  });

  test('should create prompt with no arguments', () => {
    const handler = async () => success('Simple prompt');

    const prompt = createPrompt('simple-prompt', 'Simple prompt', [], handler);

    expect(prompt.arguments).toEqual([]);
  });

  test('should create prompt with multiple required arguments', () => {
    const args = [
      { name: 'context', description: 'Context', required: true },
      { name: 'goal', description: 'Goal', required: true },
      { name: 'constraints', description: 'Constraints', required: false }
    ];

    const handler = async () => success('Complex prompt');

    const prompt = createPrompt('complex-prompt', 'Complex prompt', args, handler);

    const requiredArgs = prompt.arguments.filter(arg => arg.required);
    expect(requiredArgs).toHaveLength(2);
    expect(requiredArgs.map(arg => arg.name)).toEqual(['context', 'goal']);
  });
});
