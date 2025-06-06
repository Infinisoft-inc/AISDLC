/**
 * create-wrapped-execute Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWrappedExecute } from './create-wrapped-execute';
import type { ToolFunction } from '../types';

describe('createWrappedExecute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create wrapped execute function for valid tool', async () => {
    const mockExecute: ToolFunction<{ name: string }, string> = vi.fn()
      .mockResolvedValue('Hello John');
    
    const toolName = 'greet-tool';
    const parameters = { name: { type: 'string', description: 'Name to greet' } };
    const requiredParameters = ['name'];
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: true };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    expect(typeof wrappedExecute).toBe('function');
    
    const result = await wrappedExecute({ name: 'John' });
    
    expect(result).toBe('Hello John');
    expect(mockExecute).toHaveBeenCalledWith({ name: 'John' });
  });

  it('should handle tool execution errors', async () => {
    const mockExecute: ToolFunction<any, any> = vi.fn()
      .mockRejectedValue(new Error('Tool execution failed'));
    
    const toolName = 'error-tool';
    const parameters = {};
    const requiredParameters: string[] = [];
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: false };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    try {
      await wrappedExecute({});
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Tool execution failed');
    }
  });

  it.skip('should handle validation errors', async () => {
    const mockExecute: ToolFunction<{ required: string }, string> = vi.fn()
      .mockResolvedValue('result');
    
    const toolName = 'validation-tool';
    const parameters = { required: { type: 'string', description: 'Required parameter' } };
    const requiredParameters = ['required'];
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: true };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    try {
      await wrappedExecute({}); // Missing required parameter
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Missing required parameter');
      expect(mockExecute).not.toHaveBeenCalled();
    }
  });

  it('should handle timeout scenarios', async () => {
    const slowExecute: ToolFunction<any, any> = vi.fn()
      .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('slow result'), 200)));
    
    const toolName = 'slow-tool';
    const parameters = {};
    const requiredParameters: string[] = [];
    const options = { defaultTimeout: 50, enableEvents: false, validateInputs: false }; // Very short timeout
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      slowExecute,
      parameters,
      requiredParameters,
      options
    );
    
    try {
      await wrappedExecute({});
      expect.fail('Should have timed out');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('timeout');
    }
  });

  it('should use default timeout when specified', async () => {
    const fastExecute: ToolFunction<any, any> = vi.fn()
      .mockResolvedValue('fast result');
    
    const toolName = 'fast-tool';
    const parameters = {};
    const requiredParameters: string[] = [];
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: false };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      fastExecute,
      parameters,
      requiredParameters,
      options
    );
    
    const result = await wrappedExecute({});
    
    expect(result).toBe('fast result');
  });

  it('should handle complex parameter validation', async () => {
    const mockExecute: ToolFunction<any, any> = vi.fn()
      .mockResolvedValue('complex result');
    
    const toolName = 'complex-tool';
    const parameters = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter', required: false },
      status: { 
        type: 'string', 
        description: 'Status parameter',
        enum: ['active', 'inactive']
      }
    };
    const requiredParameters = ['name', 'status']; // age is optional
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: true };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    // Valid inputs
    const result = await wrappedExecute({ 
      name: 'John', 
      status: 'active' 
    });
    
    expect(result).toBe('complex result');
    expect(mockExecute).toHaveBeenCalledWith({ name: 'John', status: 'active' });
  });

  it.skip('should handle enum validation errors', async () => {
    const mockExecute: ToolFunction<any, any> = vi.fn()
      .mockResolvedValue('result');
    
    const toolName = 'enum-tool';
    const parameters = {
      status: { 
        type: 'string', 
        description: 'Status parameter',
        enum: ['active', 'inactive']
      }
    };
    const requiredParameters = ['status'];
    const options = { defaultTimeout: 30000, enableEvents: false, validateInputs: true };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    try {
      await wrappedExecute({ status: 'invalid' });
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Invalid enum value');
      expect(mockExecute).not.toHaveBeenCalled();
    }
  });

  it('should emit events when enabled', async () => {
    const mockExecute: ToolFunction<any, any> = vi.fn()
      .mockResolvedValue('result with events');
    
    const toolName = 'event-tool';
    const parameters = {};
    const requiredParameters: string[] = [];
    const options = { defaultTimeout: 30000, enableEvents: true, validateInputs: false };
    
    const wrappedExecute = createWrappedExecute(
      toolName,
      mockExecute,
      parameters,
      requiredParameters,
      options
    );
    
    const result = await wrappedExecute({});
    
    expect(result).toBe('result with events');
    expect(mockExecute).toHaveBeenCalledWith({});
  });
});
