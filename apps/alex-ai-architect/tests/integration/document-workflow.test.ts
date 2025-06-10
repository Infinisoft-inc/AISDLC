/**
 * Integration Tests for Document Workflow
 */

import { ProjectMemory } from '../../src/project-memory.js';
import {  DocumentStorage } from '../../src/services/storage/implementations/document-storage.js';
import { MockStorage } from '../../src/services/storage/implementations/mock-storage.js';
import { PromptRegistry } from '../../src/services/prompts/prompt-registry.js';
import { RememberTool } from '../../src/tools/remember-tool.js';
import { GenerateDocumentTool } from '../../src/tools/generate-document-tool.js';
import { SaveDocumentTool } from '../../src/tools/save-document-tool.js';

describe('Document Workflow Integration', () => {
  let projectMemory: ProjectMemory;
  let storage: MockStorage;
  let promptRegistry: PromptRegistry;
  let documentSaver: DocumentStorage;
  let rememberTool: RememberTool;
  let generateTool: GenerateDocumentTool;
  let saveTool: SaveDocumentTool;

  beforeEach(() => {
    projectMemory = new ProjectMemory();
    storage = new MockStorage();
    promptRegistry = new PromptRegistry();
    documentSaver = new DocumentStorage(storage);
    rememberTool = new RememberTool(projectMemory);
    generateTool = new GenerateDocumentTool(projectMemory, promptRegistry);
    saveTool = new SaveDocumentTool(documentSaver, () => ({
      name: 'Test Project',
      githubRepo: 'test-repo',
      organization: 'test-org',
      docsPath: 'projects/test-project/docs'
    }));
  });

  test('should complete full document workflow', async () => {
    // Step 1: Remember information
    await rememberTool.execute({ information: 'Need AI platform for developers' });
    await rememberTool.execute({ information: 'Voice interface is key requirement' });
    await rememberTool.execute({ information: 'Target market is software teams' });

    // Verify information is stored
    expect(projectMemory.hasInfo()).toBe(true);
    expect(projectMemory.getAll().length).toBe(3);

    // Step 2: Generate document
    const generateResult = await generateTool.execute({ templateName: 'business-case' });

    expect(generateResult.content[0].text).toContain('Create a professional business case document');
    expect(generateResult.content[0].text).toContain('AI platform for developers');
    expect(generateResult.content[0].text).toContain('Voice interface');

    // Step 3: Save document
    const documentContent = '# Business Case: AI Platform\n\n## Problem\nNeed AI platform for developers...';
    const saveResult = await saveTool.execute({
      document: documentContent,
      projectName: 'Test Project',
      fileName: 'business-case.md'
    });

    expect(saveResult.content[0].text).toContain('⚠️');
    expect(saveResult.content[0].text).toContain('Document Saved to Mock Storage');
    expect(storage.get('projects/test-project/docs/business-case.md')).toBe(documentContent);
  });

  test('should fail generate without information', async () => {
    const result = await generateTool.execute({ templateName: 'business-case' });
    
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('No project information gathered yet');
  });

  test('should handle any template name with MCP prompts', async () => {
    await rememberTool.execute({ information: 'Some info' });

    const result = await generateTool.execute({ templateName: 'unknown-template' as any });

    // With MCP Prompts, any template name works since we use business-case-generation prompt
    expect(result.content[0].text).toContain('Create a professional business case document');
    expect(result.content[0].text).toContain('Some info');
  });

  test('should work with different templates', async () => {
    await rememberTool.execute({ information: 'System needs user authentication' });
    await rememberTool.execute({ information: 'Must support 1000 concurrent users' });

    const result = await generateTool.execute({ templateName: 'requirements' });

    expect(result.content[0].text).toContain('business case document');
    expect(result.content[0].text).toContain('user authentication');
    expect(result.content[0].text).toContain('1000 concurrent users');
  });
});
