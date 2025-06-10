/**
 * Unit Tests for Conversation Tool
 */

import { ProcessMessageFor } from '../../../src/tools/process-message-for';

describe('ProcessMessageFor', () => {
  let processMessageFor: ProcessMessageFor;

  beforeEach(() => {
    processMessageFor = new ProcessMessageFor('Alex', 'AI Architect');
  });

  test('should have correct schema', () => {
    const schema = processMessageFor.getSchema();

    expect(schema.name).toBe('process-message-for-alex');
    expect(schema.description).toContain('Process a message for Alex');
    expect(schema.inputSchema.required).toContain('message');
  });

  test('should execute with general context', async () => {
    const args = { message: 'Hello Alex', context: 'general' };

    const result = await processMessageFor.execute(args);

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('You are Alex, AI Architect');
    expect(result.content[0].text).toContain('Hello Alex');
    expect(result.content[0].text).toContain('remember tool');
    expect(result.content[0].text).toContain('speech_response tool');
  });

  test('should execute with project context', async () => {
    const args = { message: 'Let\'s work on a project', context: 'project' };

    const result = await processMessageFor.execute(args);

    expect(result.content[0].text).toContain('PROJECT CONTEXT INSTRUCTIONS');
    expect(result.content[0].text).toContain('SYSTEM ARCHITECTURE TEMPLATE');
    expect(result.content[0].text).toContain('Architecture Overview');
    expect(result.content[0].text).toContain('generate-document tool');
  });

  test('should default to general context', async () => {
    const args = { message: 'Test message' };

    const result = await processMessageFor.execute(args);

    expect(result.content[0].text).toContain('You are Alex');
    expect(result.content[0].text).not.toContain('PROJECT CONTEXT');
  });

  test('should include teammate name in prompt', async () => {
    const customTool = new ProcessMessageFor('Alex', 'Project Manager');
    const args = { message: 'Hello' };
    
    const result = await customTool.execute(args);
    
    expect(result.content[0].text).toContain('You are Alex, Project Manager');
    expect(result.content[0].text).toContain('Respond as Alex would');
  });

  test('should handle empty message', async () => {
    const args = { message: '' };
    
    const result = await processMessageFor.execute(args);
    
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('USER MESSAGE: ""');
  });
});
