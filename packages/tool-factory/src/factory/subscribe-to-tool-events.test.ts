/**
 * subscribe-to-tool-events Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  subscribeToAllToolEvents, 
  subscribeToToolEvents, 
  subscribeToToolPattern 
} from './subscribe-to-tool-events';
import { emitToolEvent } from './emit-tool-event';
import type { ToolEvent } from '../types';

describe('subscribe-to-tool-events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeToAllToolEvents', () => {
    it('should subscribe to all tool events', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToAllToolEvents(mockCallback);
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'any-tool',
        args: { test: true },
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
    });

    it('should return unsubscribe function', () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToAllToolEvents(mockCallback);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });

    it('should stop receiving events after unsubscribe', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToAllToolEvents(mockCallback);
      
      // Unsubscribe immediately
      unsubscribe();
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'test-tool',
        args: {},
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToToolEvents', () => {
    it('should subscribe to specific tool events', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToToolEvents('specific-tool', mockCallback);
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'specific-tool',
        args: { test: true },
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
    });

    it('should not receive events from other tools', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToToolEvents('specific-tool', mockCallback);
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'other-tool',
        args: { test: true },
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockCallback).not.toHaveBeenCalled();
      
      unsubscribe();
    });

    it('should return unsubscribe function', () => {
      const mockCallback = vi.fn();
      const unsubscribe = subscribeToToolEvents('test-tool', mockCallback);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });
  });

  describe('subscribeToToolPattern', () => {
    it('should subscribe to events matching pattern', async () => {
      const mockCallback = vi.fn();
      const pattern = /tool\..*\.executed/;
      const unsubscribe = subscribeToToolPattern(pattern, mockCallback);
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'pattern-tool',
        args: { test: true },
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
    });

    it('should return unsubscribe function', () => {
      const mockCallback = vi.fn();
      const pattern = /test/;
      const unsubscribe = subscribeToToolPattern(pattern, mockCallback);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
    });
  });

  describe('multiple subscriptions', () => {
    it('should handle multiple subscribers to same events', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const unsubscribe1 = subscribeToAllToolEvents(callback1);
      const unsubscribe2 = subscribeToAllToolEvents(callback2);
      
      const testEvent: ToolEvent<any, any> = {
        toolName: 'multi-sub-tool',
        args: { test: true },
        result: { success: true, data: 'result' },
        timestamp: new Date()
      };
      
      emitToolEvent(testEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      
      unsubscribe1();
      unsubscribe2();
    });
  });
});
