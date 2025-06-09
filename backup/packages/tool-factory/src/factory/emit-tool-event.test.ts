/**
 * emit-tool-event Unit Tests
 * Tests hub integration with proper event structure expectations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitToolEvent } from './emit-tool-event';
import { subscribeToAllToolEvents, subscribeToToolEvents } from './subscribe-to-tool-events';
import type { ToolEvent } from '../types';

describe('emitToolEvent with hub integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should emit tool events that can be subscribed to', async () => {
    const mockCallback = vi.fn();
    
    // Subscribe to all tool events
    const unsubscribe = subscribeToAllToolEvents(mockCallback);
    
    // Create test event
    const testEvent: ToolEvent<any, any> = {
      toolName: 'test-tool',
      args: { param: 'value' },
      result: { success: true, data: 'result' },
      timestamp: new Date()
    };
    
    // Emit event
    emitToolEvent(testEvent);
    
    // Wait a bit for async event processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Verify the event structure (hub adds metadata)
    const receivedEvent = mockCallback.mock.calls[0][0];
    expect(receivedEvent).toMatchObject({
      toolName: 'test-tool',
      args: { param: 'value' },
      result: { success: true, data: 'result' },
      event: 'tool.executed'
    });
    expect(receivedEvent.timestamp).toBeInstanceOf(Date);
    expect(receivedEvent.headers).toBeInstanceOf(Array);
    expect(receivedEvent.headers[0]).toHaveProperty('timestamp');
    expect(receivedEvent.headers[0]).toHaveProperty('uuid');
    
    // Cleanup
    unsubscribe();
  });

  it('should emit specific tool events', async () => {
    const mockCallback = vi.fn();
    
    // Subscribe to specific tool
    const unsubscribe = subscribeToToolEvents('specific-tool', mockCallback);
    
    // Create test event
    const testEvent: ToolEvent<any, any> = {
      toolName: 'specific-tool',
      args: { param: 'value' },
      result: { success: true, data: 'result' },
      timestamp: new Date()
    };
    
    // Emit event
    emitToolEvent(testEvent);
    
    // Wait a bit for async event processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Verify the event structure (hub adds metadata)
    const receivedEvent = mockCallback.mock.calls[0][0];
    expect(receivedEvent).toMatchObject({
      toolName: 'specific-tool',
      args: { param: 'value' },
      result: { success: true, data: 'result' },
      event: 'tool.specific-tool.executed'
    });
    expect(receivedEvent.timestamp).toBeInstanceOf(Date);
    expect(receivedEvent.headers).toBeInstanceOf(Array);
    expect(receivedEvent.headers[0]).toHaveProperty('timestamp');
    expect(receivedEvent.headers[0]).toHaveProperty('uuid');
    
    // Cleanup
    unsubscribe();
  });

  it('should not trigger specific subscription for different tool', async () => {
    const mockCallback = vi.fn();
    
    // Subscribe to specific tool
    const unsubscribe = subscribeToToolEvents('other-tool', mockCallback);
    
    // Create test event for different tool
    const testEvent: ToolEvent<any, any> = {
      toolName: 'different-tool',
      args: { param: 'value' },
      result: { success: true, data: 'result' },
      timestamp: new Date()
    };
    
    // Emit event
    emitToolEvent(testEvent);
    
    // Wait a bit for async event processing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify callback was NOT called
    expect(mockCallback).not.toHaveBeenCalled();
    
    // Cleanup
    unsubscribe();
  });
});
