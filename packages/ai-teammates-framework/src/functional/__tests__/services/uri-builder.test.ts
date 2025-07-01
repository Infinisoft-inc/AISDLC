/**
 * URI builder service tests
 */

import { createUriBuilderService } from '../../services/uri-builder.js';

describe('createUriBuilderService', () => {
  test('should create URI builder service', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    
    expect(typeof uriBuilder.memory).toBe('function');
    expect(typeof uriBuilder.conversations).toBe('function');
    expect(typeof uriBuilder.templates).toBe('function');
    expect(typeof uriBuilder.currentProject).toBe('function');
  });

  test('should build memory URI', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    const uri = uriBuilder.memory('user-preferences');
    
    expect(uri).toBe('test-agent://memory/user-preferences');
  });

  test('should build conversation URI', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    const uri = uriBuilder.conversations('conv-123');
    
    expect(uri).toBe('test-agent://conversations/conv-123');
  });

  test('should build template URI', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    const uri = uriBuilder.templates('code-review');
    
    expect(uri).toBe('test-agent://templates/code-review');
  });

  test('should build current project URI', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    const uri = uriBuilder.currentProject();
    
    expect(uri).toBe('test-agent://project/current');
  });

  test('should encode special characters in keys', () => {
    const uriBuilder = createUriBuilderService('test-agent');
    const uri = uriBuilder.memory('key with spaces & symbols');
    
    expect(uri).toBe('test-agent://memory/key%20with%20spaces%20%26%20symbols');
  });
});
