/**
 * Unit Tests for Prompt Registry
 */

import { PromptRegistry } from '../../src/services/prompts/prompt-registry.js';

describe('PromptRegistry', () => {
  let promptRegistry: PromptRegistry;

  beforeEach(() => {
    promptRegistry = new PromptRegistry();
  });

  test('should initialize with default prompts', () => {
    const prompts = promptRegistry.listPrompts();

    expect(prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'business-case-generation',
          description: 'Generate comprehensive business case documents'
        }),
        expect.objectContaining({
          name: 'conversation-context',
          description: 'Generate conversation prompts with context'
        }),
        expect.objectContaining({
          name: 'document-refinement',
          description: 'Refine existing documents with new requirements'
        }),
        expect.objectContaining({
          name: 'requirements-gathering',
          description: 'Guide requirements gathering conversations'
        })
      ])
    );
  });

  test('should generate business case prompt', () => {
    const args = {
      projectInfo: ['Need AI platform', 'Voice interface required'],
      templateType: 'business-case'
    };

    const prompt = promptRegistry.getPrompt('business-case-generation', args);

    expect(prompt.description).toBe('Generate a comprehensive business case document');
    expect(prompt.messages).toHaveLength(1);
    expect(prompt.messages[0].role).toBe('user');
    expect(prompt.messages[0].content.text).toContain('Need AI platform');
    expect(prompt.messages[0].content.text).toContain('Voice interface required');
    expect(prompt.messages[0].content.text).toContain('Problem Definition');
    expect(prompt.messages[0].content.text).toContain('ROI');
  });

  test('should generate conversation context prompt with general context', () => {
    const args = {
      message: 'Hello Sarah',
      context: 'general',
      teammateName: 'Sarah',
      teammateRole: 'AI Business Analyst'
    };

    const prompt = promptRegistry.getPrompt('conversation-context', args);

    expect(prompt.description).toBe('Generate conversation prompt with context');
    expect(prompt.messages).toHaveLength(1);
    expect(prompt.messages[0].content.text).toContain('You are Sarah, AI Business Analyst');
    expect(prompt.messages[0].content.text).toContain('Hello Sarah');
    expect(prompt.messages[0].content.text).toContain('remember tool');
    expect(prompt.messages[0].content.text).toContain('speech_response tool');
  });

  test('should generate conversation context prompt with project context', () => {
    const args = {
      message: 'Let\'s work on the business case',
      context: 'project'
    };

    const prompt = promptRegistry.getPrompt('conversation-context', args);

    expect(prompt.messages[0].content.text).toContain('PROJECT CONTEXT INSTRUCTIONS');
    expect(prompt.messages[0].content.text).toContain('business case template');
    expect(prompt.messages[0].content.text).toContain('Problem Definition');
    expect(prompt.messages[0].content.text).toContain('generate-document tool');
  });

  test('should generate document refinement prompt', () => {
    const args = {
      currentDocument: '# Business Case\n\nCurrent content...',
      newRequirements: ['Add security section', 'Include cost analysis'],
      changeType: 'Enhancement'
    };

    const prompt = promptRegistry.getPrompt('document-refinement', args);

    expect(prompt.description).toBe('Refine existing document with new requirements');
    expect(prompt.messages[0].content.text).toContain('# Business Case');
    expect(prompt.messages[0].content.text).toContain('Add security section');
    expect(prompt.messages[0].content.text).toContain('Include cost analysis');
    expect(prompt.messages[0].content.text).toContain('Enhancement');
  });

  test('should generate requirements gathering prompt', () => {
    const args = {
      projectType: 'AI Platform',
      stakeholders: ['Developers', 'Product Managers'],
      constraints: ['Budget: $100k', 'Timeline: 6 months']
    };

    const prompt = promptRegistry.getPrompt('requirements-gathering', args);

    expect(prompt.description).toBe('Guide requirements gathering conversation');
    expect(prompt.messages[0].content.text).toContain('AI Platform project');
    expect(prompt.messages[0].content.text).toContain('Developers, Product Managers');
    expect(prompt.messages[0].content.text).toContain('Budget: $100k');
    expect(prompt.messages[0].content.text).toContain('Functional Requirements');
    expect(prompt.messages[0].content.text).toContain('User Stories');
  });

  test('should register custom prompt', () => {
    const customPrompt = (args: { customArg: string }) => ({
      description: 'Custom test prompt',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Custom prompt with: ${args.customArg}`
          }
        }
      ]
    });

    promptRegistry.register('custom-prompt', customPrompt);

    const prompt = promptRegistry.getPrompt('custom-prompt', { customArg: 'test value' });

    expect(prompt.description).toBe('Custom test prompt');
    expect(prompt.messages[0].content.text).toContain('test value');
  });

  test('should handle unknown prompt', () => {
    expect(() => promptRegistry.getPrompt('unknown-prompt'))
      .toThrow('Prompt \'unknown-prompt\' not found');
  });

  test('should handle missing arguments gracefully', () => {
    // Should not throw when args are missing
    const prompt = promptRegistry.getPrompt('business-case-generation', {});

    expect(prompt.description).toBe('Generate a comprehensive business case document');
    expect(prompt.messages).toHaveLength(1);
  });

  test('should use default values for conversation context', () => {
    const prompt = promptRegistry.getPrompt('conversation-context', {
      message: 'Test message'
    });

    expect(prompt.messages[0].content.text).toContain('You are Sarah, AI Business Analyst');
    expect(prompt.messages[0].content.text).toContain('Test message');
  });
});
