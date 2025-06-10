/**
 * Unit Tests for Generate Document Tool
 */

import { GenerateDocumentTool } from '../../../src/tools/generate-document-tool.js';
import { ProjectMemory } from '../../../src/project-memory.js';
import { PromptRegistry } from '../../../src/services/prompts/prompt-registry.js';

describe('GenerateDocumentTool', () => {
  let tool: GenerateDocumentTool;
  let projectMemory: ProjectMemory;
  let promptRegistry: PromptRegistry;

  beforeEach(() => {
    projectMemory = new ProjectMemory();
    promptRegistry = new PromptRegistry();
    tool = new GenerateDocumentTool(projectMemory, promptRegistry);
  });

  test('should have correct schema', () => {
    const schema = tool.getSchema();

    expect(schema.name).toBe('generate-document');
    expect(schema.description).toContain('Generate LLM prompt for document creation');
    expect(schema.inputSchema.properties).toHaveProperty('templateName');
  });

  test('should generate document when project memory has info', async () => {
    // Add project information
    projectMemory.add('Problem: Manual customer support');
    projectMemory.add('Stakeholders: Support team, customers');
    projectMemory.add('Business Impact: $50k/month churn');

    const result = await tool.execute({ templateName: 'business-case' });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Create a professional business case document');
    expect(result.content[0].text).toContain('Manual customer support');
    expect(result.content[0].text).toContain('Support team, customers');
    expect(result.content[0].text).toContain('$50k/month churn');
  });

  test('should fail when no project information', async () => {
    const result = await tool.execute({ templateName: 'business-case' });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('❌ **Failed to Generate Document**');
    expect(result.content[0].text).toContain('No project information gathered yet');
  });

  test('should use MCP Prompt Registry', async () => {
    // Add project information
    projectMemory.add('Test project info');

    // Spy on prompt registry
    const getPromptSpy = jest.spyOn(promptRegistry, 'getPrompt');

    await tool.execute({ templateName: 'business-case' });

    expect(getPromptSpy).toHaveBeenCalledWith('business-case-generation', {
      projectInfo: ['Test project info'],
      templateType: 'business-case'
    });
  });

  test('should handle different template names', async () => {
    projectMemory.add('Test info');

    const getPromptSpy = jest.spyOn(promptRegistry, 'getPrompt');

    await tool.execute({ templateName: 'requirements' });

    expect(getPromptSpy).toHaveBeenCalledWith('business-case-generation', {
      projectInfo: ['Test info'],
      templateType: 'requirements'
    });
  });

  test('should handle prompt registry errors gracefully', async () => {
    projectMemory.add('Test info');

    // Mock prompt registry to throw error
    jest.spyOn(promptRegistry, 'getPrompt').mockImplementation(() => {
      throw new Error('Prompt not found');
    });

    const result = await tool.execute({ templateName: 'business-case' });

    expect(result.content[0].text).toContain('❌ **Failed to Generate Document**');
    expect(result.content[0].text).toContain('Prompt not found');
  });

  test('should pass project name if provided', async () => {
    projectMemory.add('Test info');

    const getPromptSpy = jest.spyOn(promptRegistry, 'getPrompt');

    await tool.execute({ 
      templateName: 'business-case',
      projectName: 'AI Platform Project'
    });

    expect(getPromptSpy).toHaveBeenCalledWith('business-case-generation', {
      projectInfo: ['Test info'],
      templateType: 'business-case'
    });
  });
});
