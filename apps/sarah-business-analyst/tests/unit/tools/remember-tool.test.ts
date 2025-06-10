/**
 * Unit Tests for Remember Tool
 */

import { RememberTool } from '../../../src/tools/remember-tool.js';
import { ProjectMemory } from '../../../src/project-memory.js';

describe('RememberTool', () => {
  let projectMemory: ProjectMemory;
  let rememberTool: RememberTool;

  beforeEach(() => {
    projectMemory = new ProjectMemory();
    rememberTool = new RememberTool(projectMemory);
  });

  test('should have correct schema', () => {
    const schema = rememberTool.getSchema();
    
    expect(schema.name).toBe('remember');
    expect(schema.description).toContain('Save important project information');
    expect(schema.inputSchema.required).toContain('information');
  });

  test('should execute successfully', async () => {
    const args = { information: 'Test information' };
    
    const result = await rememberTool.execute(args);
    
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('✅');
    expect(result.content[0].text).toContain('Test information');
    expect(projectMemory.getAll()).toContain('Test information');
  });

  test('should handle multiple pieces of information', async () => {
    await rememberTool.execute({ information: 'First info' });
    await rememberTool.execute({ information: 'Second info' });
    
    const allInfo = projectMemory.getAll();
    expect(allInfo).toContain('First info');
    expect(allInfo).toContain('Second info');
    expect(allInfo.length).toBe(2);
  });

  test('should not duplicate information', async () => {
    await rememberTool.execute({ information: 'Same info' });
    await rememberTool.execute({ information: 'Same info' });
    
    expect(projectMemory.getAll().length).toBe(1);
  });

  test('should handle errors gracefully', async () => {
    // Mock projectMemory to throw error
    const errorMemory = {
      add: jest.fn().mockImplementation(() => {
        throw new Error('Memory error');
      })
    };
    
    const tool = new RememberTool(errorMemory as any);
    const result = await tool.execute({ information: 'test' });
    
    expect(result.content[0].text).toContain('❌');
    expect(result.content[0].text).toContain('Memory error');
  });
});
