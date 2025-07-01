/**
 * Memory service tests
 */

import { createMemoryService } from '../../services/memory.js';
import type { ReadonlyMemoryEntry } from '../../types/features.js';

describe('createMemoryService', () => {
  let memoryService: ReturnType<typeof createMemoryService>;
  let entries: ReadonlyMemoryEntry[];

  beforeEach(() => {
    memoryService = createMemoryService();
    entries = [];
  });

  test('should create memory service', () => {
    expect(typeof memoryService.set).toBe('function');
    expect(typeof memoryService.get).toBe('function');
    expect(typeof memoryService.has).toBe('function');
    expect(typeof memoryService.delete).toBe('function');
    expect(typeof memoryService.clear).toBe('function');
    expect(typeof memoryService.getAll).toBe('function');
    expect(typeof memoryService.size).toBe('function');
  });

  test('should set memory entry', () => {
    const entry = memoryService.set('key1', 'value1');
    
    expect(entry.key).toBe('key1');
    expect(entry.value).toBe('value1');
    expect(entry.timestamp).toBeInstanceOf(Date);
    expect(entry.ttl).toBeUndefined();
  });

  test('should set memory entry with TTL', () => {
    const entry = memoryService.set('key1', 'value1', 3600);
    
    expect(entry.ttl).toBe(3600);
  });

  test('should get memory value', () => {
    const entry = memoryService.set('key1', 'value1');
    entries = [entry];
    
    const value = memoryService.get('key1', entries);
    expect(value).toBe('value1');
  });

  test('should return undefined for non-existent key', () => {
    const value = memoryService.get('nonexistent', entries);
    expect(value).toBeUndefined();
  });

  test('should check if key exists', () => {
    const entry = memoryService.set('key1', 'value1');
    entries = [entry];
    
    expect(memoryService.has('key1', entries)).toBe(true);
    expect(memoryService.has('nonexistent', entries)).toBe(false);
  });

  test('should delete memory entry', () => {
    const entry1 = memoryService.set('key1', 'value1');
    const entry2 = memoryService.set('key2', 'value2');
    entries = [entry1, entry2];
    
    const newEntries = memoryService.delete('key1', entries);
    expect(newEntries).toHaveLength(1);
    expect(newEntries[0].key).toBe('key2');
  });

  test('should clear all entries', () => {
    const cleared = memoryService.clear();
    expect(cleared).toEqual([]);
  });

  test('should get all valid entries', () => {
    const entry1 = memoryService.set('key1', 'value1');
    const entry2 = memoryService.set('key2', 'value2');
    entries = [entry1, entry2];
    
    const allEntries = memoryService.getAll(entries);
    expect(allEntries).toHaveLength(2);
  });

  test('should get size of entries', () => {
    const entry1 = memoryService.set('key1', 'value1');
    const entry2 = memoryService.set('key2', 'value2');
    entries = [entry1, entry2];
    
    expect(memoryService.size(entries)).toBe(2);
  });

  test('should filter expired entries', () => {
    // Mock Date constructor to control time
    const originalDate = Date;
    const baseTime = 1000000;

    // Mock Date constructor
    global.Date = class extends Date {
      constructor() {
        super(baseTime);
      }
      static now() {
        return baseTime;
      }
    } as DateConstructor;

    const entry = memoryService.set('key1', 'value1', 1); // 1 second TTL
    entries = [entry];

    // Move time forward by 2 seconds
    global.Date = class extends Date {
      constructor() {
        super(baseTime + 2000);
      }
      static now() {
        return baseTime + 2000;
      }
    } as DateConstructor;

    const value = memoryService.get('key1', entries);
    expect(value).toBeUndefined();

    global.Date = originalDate;
  });
});
