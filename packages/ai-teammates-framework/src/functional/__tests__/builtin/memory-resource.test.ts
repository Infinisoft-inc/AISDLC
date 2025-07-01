/**
 * Memory resource tests
 */

import { createMemoryResource } from '../../builtin/memory-resource.js';
import { isSuccess } from '../../utils/result.js';

describe('createMemoryResource', () => {
  test('should create memory resource with correct properties', () => {
    const resource = createMemoryResource('test-agent');

    expect(resource.uri).toBe('test-agent://memory/{key}');
    expect(resource.name).toBe('Memory Storage');
    expect(resource.description).toBe('Access stored memory values');
    expect(resource.mimeType).toBe('text/plain');
    expect(typeof resource.handler).toBe('function');
  });

  test('should handle resource request', async () => {
    const resource = createMemoryResource('test-agent');
    const result = await resource.handler('test-agent://memory/user-preferences');

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('Memory resource for key: user-preferences');
    }
  });

  test('should handle encoded URI keys', async () => {
    const resource = createMemoryResource('test-agent');
    const result = await resource.handler('test-agent://memory/key%20with%20spaces');

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('Memory resource for key: key with spaces');
    }
  });

  test('should handle URI without key', async () => {
    const resource = createMemoryResource('test-agent');
    const result = await resource.handler('test-agent://memory/');

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('Memory resource for key: ');
    }
  });
});
