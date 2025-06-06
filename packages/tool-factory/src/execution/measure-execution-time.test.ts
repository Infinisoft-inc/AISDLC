/**
 * measure-execution-time Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi } from 'vitest';
import { measureExecutionTime } from './measure-execution-time';

describe('measureExecutionTime', () => {
  it('should measure execution time of fast function', async () => {
    const fastFunction = vi.fn().mockResolvedValue('fast result');
    
    const { result, executionTime } = await measureExecutionTime(fastFunction);
    
    expect(result).toBe('fast result');
    expect(executionTime).toBeGreaterThanOrEqual(0);
    expect(executionTime).toBeLessThan(50); // Should be very fast
    expect(fastFunction).toHaveBeenCalledTimes(1);
  });

  it('should measure execution time of slow function', async () => {
    const delay = 100;
    const slowFunction = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('slow result'), delay))
    );
    
    const { result, executionTime } = await measureExecutionTime(slowFunction);
    
    expect(result).toBe('slow result');
    expect(executionTime).toBeGreaterThanOrEqual(delay - 10); // Allow some tolerance
    expect(executionTime).toBeLessThan(delay + 50); // Allow some tolerance
    expect(slowFunction).toHaveBeenCalledTimes(1);
  });

  it('should measure execution time when function throws error', async () => {
    const errorFunction = vi.fn().mockRejectedValue(new Error('Test error'));
    
    await expect(measureExecutionTime(errorFunction)).rejects.toThrow('Test error');
    expect(errorFunction).toHaveBeenCalledTimes(1);
  });

  it('should measure execution time when function throws synchronously', async () => {
    const throwingFunction = vi.fn().mockImplementation(() => {
      throw new Error('Sync error');
    });
    
    await expect(measureExecutionTime(throwingFunction)).rejects.toThrow('Sync error');
    expect(throwingFunction).toHaveBeenCalledTimes(1);
  });

  it('should return accurate timing for multiple calls', async () => {
    const delay1 = 50;
    const delay2 = 100;
    
    const function1 = () => new Promise(resolve => setTimeout(() => resolve('result1'), delay1));
    const function2 = () => new Promise(resolve => setTimeout(() => resolve('result2'), delay2));
    
    const [timing1, timing2] = await Promise.all([
      measureExecutionTime(function1),
      measureExecutionTime(function2)
    ]);
    
    expect(timing1.result).toBe('result1');
    expect(timing2.result).toBe('result2');
    
    expect(timing1.executionTime).toBeGreaterThanOrEqual(delay1 - 10);
    expect(timing1.executionTime).toBeLessThan(delay1 + 50);
    
    expect(timing2.executionTime).toBeGreaterThanOrEqual(delay2 - 10);
    expect(timing2.executionTime).toBeLessThan(delay2 + 50);
    
    // Function2 should take longer than function1
    expect(timing2.executionTime).toBeGreaterThan(timing1.executionTime);
  });

  it('should handle function returning complex objects', async () => {
    const complexResult = {
      data: { items: [1, 2, 3] },
      metadata: { count: 3, timestamp: new Date() },
      nested: { deep: { value: 'test' } }
    };
    
    const complexFunction = vi.fn().mockResolvedValue(complexResult);
    
    const { result, executionTime } = await measureExecutionTime(complexFunction);
    
    expect(result).toEqual(complexResult);
    expect(executionTime).toBeGreaterThanOrEqual(0);
    expect(complexFunction).toHaveBeenCalledTimes(1);
  });

  it('should handle function returning primitive values', async () => {
    const primitiveTests = [
      { fn: () => Promise.resolve(42), expected: 42 },
      { fn: () => Promise.resolve('string'), expected: 'string' },
      { fn: () => Promise.resolve(true), expected: true },
      { fn: () => Promise.resolve(null), expected: null },
      { fn: () => Promise.resolve(undefined), expected: undefined }
    ];
    
    for (const test of primitiveTests) {
      const { result, executionTime } = await measureExecutionTime(test.fn);
      expect(result).toBe(test.expected);
      expect(executionTime).toBeGreaterThanOrEqual(0);
    }
  });
});
