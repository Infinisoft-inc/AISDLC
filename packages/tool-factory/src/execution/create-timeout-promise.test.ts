/**
 * create-timeout-promise Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi } from 'vitest';
import { createTimeoutPromise } from './create-timeout-promise';

describe('createTimeoutPromise', () => {
  it('should create a promise that rejects after timeout', async () => {
    const timeoutMs = 100;
    const timeoutPromise = createTimeoutPromise(timeoutMs);
    
    const startTime = Date.now();
    
    await expect(timeoutPromise).rejects.toThrow(
      `Tool execution timeout after ${timeoutMs}ms`
    );
    
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    // Should timeout approximately after the specified time (with some tolerance)
    expect(elapsed).toBeGreaterThanOrEqual(timeoutMs - 10);
    expect(elapsed).toBeLessThan(timeoutMs + 50);
  });

  it('should create promise with different timeout values', async () => {
    const shortTimeout = createTimeoutPromise(50);
    const longTimeout = createTimeoutPromise(200);
    
    // Short timeout should reject first
    await expect(Promise.race([shortTimeout, longTimeout])).rejects.toThrow(
      'Tool execution timeout after 50ms'
    );
  });

  it('should create promise that never resolves, only rejects', async () => {
    const timeoutPromise = createTimeoutPromise(10);
    
    // Promise should reject, not resolve
    await expect(timeoutPromise).rejects.toThrow();
    
    // Should not resolve to any value
    try {
      await timeoutPromise;
      expect.fail('Promise should have rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('timeout');
    }
  });

  it('should handle zero timeout', async () => {
    const timeoutPromise = createTimeoutPromise(0);
    
    await expect(timeoutPromise).rejects.toThrow(
      'Tool execution timeout after 0ms'
    );
  });

  it('should handle very large timeout values', () => {
    const largeTimeout = 999999;
    const timeoutPromise = createTimeoutPromise(largeTimeout);
    
    // Should create promise without throwing
    expect(timeoutPromise).toBeInstanceOf(Promise);
    
    // Should have correct error message when it eventually rejects
    timeoutPromise.catch(error => {
      expect(error.message).toBe(`Tool execution timeout after ${largeTimeout}ms`);
    });
  });
});
