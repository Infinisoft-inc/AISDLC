/**
 * execute-with-timeout Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi } from 'vitest';
import { executeWithTimeout } from './execute-with-timeout';
import type { ToolFunction } from '../types';

describe('executeWithTimeout', () => {
  it('should execute function successfully within timeout', async () => {
    const mockFunction: ToolFunction<{ input: string }, string> = vi.fn()
      .mockResolvedValue('success result');
    
    const args = { input: 'test' };
    const timeoutMs = 1000;
    
    const result = await executeWithTimeout(mockFunction, args, timeoutMs);
    
    expect(result).toBe('success result');
    expect(mockFunction).toHaveBeenCalledWith(args);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should timeout when function takes too long', async () => {
    const slowFunction: ToolFunction<any, any> = vi.fn()
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));
    
    const args = { input: 'test' };
    const timeoutMs = 50;
    
    await expect(executeWithTimeout(slowFunction, args, timeoutMs))
      .rejects.toThrow('Tool execution timeout after 50ms');
    
    expect(slowFunction).toHaveBeenCalledWith(args);
  });

  it('should propagate function errors', async () => {
    const errorFunction: ToolFunction<any, any> = vi.fn()
      .mockRejectedValue(new Error('Function failed'));
    
    const args = { input: 'test' };
    const timeoutMs = 1000;
    
    await expect(executeWithTimeout(errorFunction, args, timeoutMs))
      .rejects.toThrow('Function failed');
    
    expect(errorFunction).toHaveBeenCalledWith(args);
  });

  it('should handle function that returns immediately', async () => {
    const fastFunction: ToolFunction<{ value: number }, number> = vi.fn()
      .mockResolvedValue(42);
    
    const args = { value: 10 };
    const timeoutMs = 100;
    
    const result = await executeWithTimeout(fastFunction, args, timeoutMs);
    
    expect(result).toBe(42);
    expect(fastFunction).toHaveBeenCalledWith(args);
  });

  it('should handle function that throws synchronously', async () => {
    const throwingFunction: ToolFunction<any, any> = vi.fn()
      .mockImplementation(() => {
        throw new Error('Sync error');
      });
    
    const args = { input: 'test' };
    const timeoutMs = 1000;
    
    await expect(executeWithTimeout(throwingFunction, args, timeoutMs))
      .rejects.toThrow('Sync error');
    
    expect(throwingFunction).toHaveBeenCalledWith(args);
  });



  it('should pass through complex return values', async () => {
    const complexResult = { 
      data: [1, 2, 3], 
      metadata: { timestamp: new Date() },
      success: true 
    };
    
    const complexFunction: ToolFunction<any, any> = vi.fn()
      .mockResolvedValue(complexResult);
    
    const args = { input: 'test' };
    const timeoutMs = 1000;
    
    const result = await executeWithTimeout(complexFunction, args, timeoutMs);
    
    expect(result).toEqual(complexResult);
    expect(complexFunction).toHaveBeenCalledWith(args);
  });
});
