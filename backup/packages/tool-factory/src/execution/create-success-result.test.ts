/**
 * create-success-result Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { createSuccessResult } from './create-success-result';

describe('createSuccessResult', () => {
  it('should create success result with data', () => {
    const data = { message: 'test data' };
    const result = createSuccessResult(data);
    
    expect(result).toEqual({
      success: true,
      data: { message: 'test data' },
      executionTime: undefined
    });
  });

  it('should create success result with data and execution time', () => {
    const data = 'string data';
    const executionTime = 150;
    const result = createSuccessResult(data, executionTime);
    
    expect(result).toEqual({
      success: true,
      data: 'string data',
      executionTime: 150
    });
  });

  it('should create success result with null data', () => {
    const result = createSuccessResult(null);
    
    expect(result).toEqual({
      success: true,
      data: null,
      executionTime: undefined
    });
  });

  it('should create success result with undefined data', () => {
    const result = createSuccessResult(undefined);
    
    expect(result).toEqual({
      success: true,
      data: undefined,
      executionTime: undefined
    });
  });

  it('should create success result with complex object data', () => {
    const complexData = {
      items: [1, 2, 3],
      metadata: { count: 3, timestamp: new Date() },
      nested: { deep: { value: 'test' } }
    };
    const executionTime = 250;
    
    const result = createSuccessResult(complexData, executionTime);
    
    expect(result).toEqual({
      success: true,
      data: complexData,
      executionTime: 250
    });
  });

  it('should create success result with zero execution time', () => {
    const data = 'fast result';
    const result = createSuccessResult(data, 0);
    
    expect(result).toEqual({
      success: true,
      data: 'fast result',
      executionTime: 0
    });
  });

  it('should always have success true', () => {
    const results = [
      createSuccessResult('test'),
      createSuccessResult(42),
      createSuccessResult(true),
      createSuccessResult([]),
      createSuccessResult({})
    ];
    
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
