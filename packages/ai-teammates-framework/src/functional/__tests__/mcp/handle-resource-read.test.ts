/**
 * Handle resource read tests
 */

import { handleResourceRead } from '../../mcp/handle-resource-read.js';
import { createResource } from '../../tools/create-resource.js';
import { success, failure } from '../../utils/result.js';

describe('handleResourceRead', () => {
  test('should handle successful resource read', async () => {
    const handler = async () => success('Resource content');
    const resource = createResource('test://resource', 'Test Resource', 'Test', 'text/plain', handler);
    
    const request = { params: { uri: 'test://resource' } };

    const response = await handleResourceRead(request, [resource]);

    expect(response.isError).toBe(false);
    expect(response.content?.[0]?.text).toBe('Resource content');
  });

  test('should handle resource read failure', async () => {
    const handler = async () => failure('Resource not accessible');
    const resource = createResource('test://resource', 'Test Resource', 'Test', 'text/plain', handler);
    
    const request = { params: { uri: 'test://resource' } };

    const response = await handleResourceRead(request, [resource]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Resource not accessible');
  });

  test('should handle missing URI', async () => {
    const request = { params: {} };

    const response = await handleResourceRead(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Resource URI is required');
  });

  test('should handle resource not found', async () => {
    const request = { params: { uri: 'nonexistent://resource' } };

    const response = await handleResourceRead(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe("Resource 'nonexistent://resource' not found");
  });

  test('should handle resource handler exception', async () => {
    const handler = async () => {
      throw new Error('Handler crashed');
    };
    const resource = createResource('test://resource', 'Test Resource', 'Test', 'text/plain', handler);
    
    const request = { params: { uri: 'test://resource' } };

    const response = await handleResourceRead(request, [resource]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toContain('Resource read failed');
  });
});
