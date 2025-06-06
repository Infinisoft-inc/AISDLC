/**
 * create-error-result Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { createErrorResult } from './create-error-result';

describe('createErrorResult', () => {
  it('should create error result with message', () => {
    const error = 'Something went wrong';
    const result = createErrorResult(error);
    
    expect(result).toEqual({
      success: false,
      error: 'Something went wrong',
      executionTime: undefined
    });
  });

  it('should create error result with message and execution time', () => {
    const error = 'Timeout error';
    const executionTime = 5000;
    const result = createErrorResult(error, executionTime);
    
    expect(result).toEqual({
      success: false,
      error: 'Timeout error',
      executionTime: 5000
    });
  });

  it('should create error result with empty string error', () => {
    const result = createErrorResult('');
    
    expect(result).toEqual({
      success: false,
      error: '',
      executionTime: undefined
    });
  });

  it('should create error result with detailed error message', () => {
    const detailedError = 'ValidationError: Required parameter "name" is missing. Expected string but got undefined.';
    const executionTime = 10;
    
    const result = createErrorResult(detailedError, executionTime);
    
    expect(result).toEqual({
      success: false,
      error: detailedError,
      executionTime: 10
    });
  });

  it('should create error result with zero execution time', () => {
    const error = 'Immediate failure';
    const result = createErrorResult(error, 0);
    
    expect(result).toEqual({
      success: false,
      error: 'Immediate failure',
      executionTime: 0
    });
  });

  it('should always have success false', () => {
    const results = [
      createErrorResult('error 1'),
      createErrorResult('error 2', 100),
      createErrorResult('error 3', 0),
      createErrorResult('')
    ];
    
    results.forEach(result => {
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
    });
  });

  it('should handle very long error messages', () => {
    const longError = 'A'.repeat(1000);
    const result = createErrorResult(longError, 500);
    
    expect(result).toEqual({
      success: false,
      error: longError,
      executionTime: 500
    });
    expect(result.error.length).toBe(1000);
  });
});
