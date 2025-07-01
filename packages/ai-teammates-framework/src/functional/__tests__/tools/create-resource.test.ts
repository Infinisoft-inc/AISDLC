/**
 * Create resource tests
 */

import { createResource } from '../../tools/create-resource.js';
import { success } from '../../utils/result.js';

describe('createResource', () => {
  test('should create resource definition', () => {
    const handler = async () => success('resource content');

    const resource = createResource(
      'test://resource/123',
      'Test Resource',
      'A test resource',
      'text/plain',
      handler
    );

    expect(resource.uri).toBe('test://resource/123');
    expect(resource.name).toBe('Test Resource');
    expect(resource.description).toBe('A test resource');
    expect(resource.mimeType).toBe('text/plain');
    expect(resource.handler).toBe(handler);
  });

  test('should create resource with different mime type', () => {
    const handler = async () => success('{"data": "json"}');

    const resource = createResource(
      'test://api/data',
      'API Data',
      'JSON API data',
      'application/json',
      handler
    );

    expect(resource.mimeType).toBe('application/json');
  });
});
