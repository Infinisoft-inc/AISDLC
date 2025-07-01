/**
 * Memory tool tests
 */

import { createMemoryTool } from '../../builtin/memory-tool.js';
import { isSuccess, isFailure } from '../../utils/result.js';

describe('createMemoryTool', () => {
  test('should create memory tool with correct name', () => {
    const tool = createMemoryTool('test-agent');

    expect(tool.name).toBe('test-agent_memory');
    expect(tool.description).toBe('Manage memory storage for the AI teammate');
    expect(tool.inputSchema.type).toBe('object');
    expect(tool.inputSchema.required).toEqual(['action']);
  });

  test('should handle set action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'set', key: 'test-key', value: 'test-value' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('Memory set: test-key = test-value');
    }
  });

  test('should handle set action with TTL', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'set', key: 'test-key', value: 'test-value', ttl: 3600 });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('TTL: 3600s');
    }
  });

  test('should handle get action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'get', key: 'test-key' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('Memory get: test-key');
    }
  });

  test('should handle delete action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'delete', key: 'test-key' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('Memory deleted: test-key');
    }
  });

  test('should handle clear action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'clear' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('Memory cleared');
    }
  });

  test('should handle list action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'list' });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toContain('Memory keys:');
    }
  });

  test('should fail for set without key', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'set', value: 'test-value' });

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBe('Key and value are required for set action');
    }
  });

  test('should fail for get without key', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'get' });

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBe('Key is required for get action');
    }
  });

  test('should fail for delete without key', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'delete' });

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBe('Key is required for delete action');
    }
  });

  test('should fail for unknown action', async () => {
    const tool = createMemoryTool('test');
    const result = await tool.handler({ action: 'unknown' });

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBe('Unknown memory action: unknown');
    }
  });
});
