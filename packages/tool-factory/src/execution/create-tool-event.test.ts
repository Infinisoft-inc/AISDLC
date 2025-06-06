/**
 * create-tool-event Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { createToolEvent } from './create-tool-event';
import type { ToolResult } from '../types';

describe('createToolEvent', () => {
  it('should create tool event with success result', () => {
    const toolName = 'test-tool';
    const args = { param: 'value' };
    const result: ToolResult<string> = {
      success: true,
      data: 'success data',
      executionTime: 100
    };
    
    const event = createToolEvent(toolName, args, result);
    
    expect(event.toolName).toBe('test-tool');
    expect(event.args).toEqual({ param: 'value' });
    expect(event.result).toEqual(result);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it('should create tool event with error result', () => {
    const toolName = 'failing-tool';
    const args = { input: 'test' };
    const result: ToolResult<any> = {
      success: false,
      error: 'Tool execution failed',
      executionTime: 50
    };
    
    const event = createToolEvent(toolName, args, result);
    
    expect(event.toolName).toBe('failing-tool');
    expect(event.args).toEqual({ input: 'test' });
    expect(event.result).toEqual(result);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it('should create tool event with complex args', () => {
    const toolName = 'complex-tool';
    const complexArgs = {
      config: { timeout: 1000, retries: 3 },
      data: [1, 2, 3],
      metadata: { user: 'test', timestamp: new Date() }
    };
    const result: ToolResult<any> = {
      success: true,
      data: { processed: true }
    };
    
    const event = createToolEvent(toolName, complexArgs, result);
    
    expect(event.toolName).toBe('complex-tool');
    expect(event.args).toEqual(complexArgs);
    expect(event.result).toEqual(result);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it('should create tool event with empty args', () => {
    const toolName = 'no-args-tool';
    const args = {};
    const result: ToolResult<string> = {
      success: true,
      data: 'no args needed'
    };
    
    const event = createToolEvent(toolName, args, result);
    
    expect(event.toolName).toBe('no-args-tool');
    expect(event.args).toEqual({});
    expect(event.result).toEqual(result);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it('should create tool event with null/undefined values', () => {
    const toolName = 'null-tool';
    const args = { value: null, other: undefined };
    const result: ToolResult<null> = {
      success: true,
      data: null,
      executionTime: 0
    };
    
    const event = createToolEvent(toolName, args, result);
    
    expect(event.toolName).toBe('null-tool');
    expect(event.args).toEqual({ value: null, other: undefined });
    expect(event.result).toEqual(result);
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it('should create events with different timestamps', async () => {
    const toolName = 'timing-tool';
    const args = { test: true };
    const result: ToolResult<string> = { success: true, data: 'test' };
    
    const event1 = createToolEvent(toolName, args, result);
    
    // Wait a small amount to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const event2 = createToolEvent(toolName, args, result);
    
    expect(event1.timestamp.getTime()).toBeLessThan(event2.timestamp.getTime());
  });

  it('should handle very long tool names', () => {
    const longToolName = 'very-long-tool-name-' + 'x'.repeat(100);
    const args = { test: true };
    const result: ToolResult<string> = { success: true, data: 'test' };
    
    const event = createToolEvent(longToolName, args, result);
    
    expect(event.toolName).toBe(longToolName);
    expect(event.toolName.length).toBeGreaterThan(100);
  });
});
