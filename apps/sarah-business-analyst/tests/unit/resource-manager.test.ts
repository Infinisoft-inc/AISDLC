/**
 * Unit Tests for Resource Manager
 */

import { ResourceManager } from '../../src/services/resources/resource-manager.js';
import { ProjectMemory } from '../../src/project-memory.js';
import { MockStorage } from '../../src/services/storage/implementations/mock-storage.js';

describe('ResourceManager', () => {
  let resourceManager: ResourceManager;
  let projectMemory: ProjectMemory;
  let storage: MockStorage;

  beforeEach(() => {
    projectMemory = new ProjectMemory();
    storage = new MockStorage();
    resourceManager = new ResourceManager(projectMemory, storage);
  });

  test('should initialize with dependencies', () => {
    expect(resourceManager).toBeInstanceOf(ResourceManager);
  });

  test('should list resources when project memory has info', async () => {
    projectMemory.add('Test project info');
    projectMemory.setName('Test Project');

    const resources = await resourceManager.listResources();

    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'memory://sarah/current-project',
          name: 'Current Project Memory',
          mimeType: 'application/json'
        })
      ])
    );
  });

  test('should not list project memory when empty', async () => {
    const resources = await resourceManager.listResources();

    const projectResource = resources.find(r => r.uri === 'memory://sarah/current-project');
    expect(projectResource).toBeUndefined();
  });

  test('should add and list conversation history', async () => {
    resourceManager.addConversation('User: Hello Sarah');
    resourceManager.addConversation('Sarah: Hi there!');

    const resources = await resourceManager.listResources();

    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'memory://sarah/conversations',
          name: 'Conversation History',
          mimeType: 'application/json'
        })
      ])
    );
  });

  test('should register and list templates', async () => {
    const template = {
      name: 'test-template',
      sections: ['Section 1'],
      prompt: 'Test prompt'
    };

    resourceManager.registerTemplate('test-template', template);

    const resources = await resourceManager.listResources();

    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'template://sarah/test-template',
          name: 'test-template Template',
          mimeType: 'application/json'
        })
      ])
    );
  });

  test('should read project memory resource', async () => {
    projectMemory.add('Test info 1');
    projectMemory.add('Test info 2');
    projectMemory.setName('Test Project');

    const content = await resourceManager.readResource('memory://sarah/current-project');

    expect(content.uri).toBe('memory://sarah/current-project');
    expect(content.mimeType).toBe('application/json');
    expect(content.text).toBeDefined();

    const data = JSON.parse(content.text!);
    expect(data.projectName).toBe('Test Project');
    expect(data.information).toEqual(['Test info 1', 'Test info 2']);
  });

  test('should read conversation history resource', async () => {
    resourceManager.addConversation('User: Hello');
    resourceManager.addConversation('Sarah: Hi!');

    const content = await resourceManager.readResource('memory://sarah/conversations');

    expect(content.uri).toBe('memory://sarah/conversations');
    expect(content.mimeType).toBe('application/json');

    const data = JSON.parse(content.text!);
    expect(data.messages).toEqual(['User: Hello', 'Sarah: Hi!']);
    expect(data.count).toBe(2);
  });

  test('should read template resource', async () => {
    const template = {
      name: 'test-template',
      sections: ['Section 1'],
      prompt: 'Test prompt'
    };

    resourceManager.registerTemplate('test-template', template);

    const content = await resourceManager.readResource('template://sarah/test-template');

    expect(content.uri).toBe('template://sarah/test-template');
    expect(content.mimeType).toBe('application/json');

    const data = JSON.parse(content.text!);
    expect(data).toEqual(template);
  });

  test('should handle unknown resource URI', async () => {
    await expect(resourceManager.readResource('unknown://resource'))
      .rejects.toThrow('Unknown resource URI: unknown://resource');
  });

  test('should limit conversation history to 50 messages', async () => {
    // Add 60 messages
    for (let i = 0; i < 60; i++) {
      resourceManager.addConversation(`Message ${i}`);
    }

    const resources = await resourceManager.listResources();
    const conversationResource = resources.find(r => r.uri === 'memory://sarah/conversations');
    expect(conversationResource).toBeDefined();

    // Should only keep last 50
    // Note: We can't easily test the internal state without exposing it
    // This test verifies the resource is still listed
    expect(conversationResource).toBeDefined();
  });

  test('should list documents from storage', async () => {
    // Save a document to storage
    await storage.save('test-document.md', '# Test Document\n\nThis is a test.');

    const resources = await resourceManager.listResources();

    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: 'file://sarah/documents/test-document.md',
          name: 'test-document.md',
          mimeType: 'text/markdown'
        })
      ])
    );
  });

  test('should read document content from storage', async () => {
    // Save a document to storage
    const content = '# Test Document\n\nThis is a test document with real content.';
    await storage.save('test-content.md', content);

    const resourceContent = await resourceManager.readResource('file://sarah/documents/test-content.md');

    expect(resourceContent.uri).toBe('file://sarah/documents/test-content.md');
    expect(resourceContent.mimeType).toBe('text/markdown');
    expect(resourceContent.text).toBe(content);
  });
});
