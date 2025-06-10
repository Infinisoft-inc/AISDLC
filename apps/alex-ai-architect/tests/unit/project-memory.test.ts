/**
 * Unit Tests for Project Memory
 */

import { ProjectMemory } from '../../src/project-memory.js';

describe('ProjectMemory', () => {
  let memory: ProjectMemory;

  beforeEach(() => {
    memory = new ProjectMemory();
  });

  test('should initialize with empty state', () => {
    expect(memory.hasInfo()).toBe(false);
    expect(memory.getAll()).toEqual([]);
    expect(memory.getName()).toBeUndefined();
  });

  test('should add information', () => {
    memory.add('First piece of info');
    memory.add('Second piece of info');

    expect(memory.hasInfo()).toBe(true);
    expect(memory.getAll()).toEqual([
      'First piece of info',
      'Second piece of info'
    ]);
  });

  test('should not duplicate information', () => {
    memory.add('Same info');
    memory.add('Same info');

    expect(memory.getAll()).toEqual(['Same info']);
  });

  test('should set and get project name', () => {
    memory.setName('Test Project');

    expect(memory.getName()).toBe('Test Project');
  });

  test('should generate correct summary', () => {
    memory.setName('AI Platform');
    memory.add('Voice interface needed');
    memory.add('Target developers');

    const summary = memory.getSummary();
    expect(summary).toBe('Project: AI Platform (2 pieces of information)');
  });

  test('should handle unnamed project in summary', () => {
    memory.add('Some info');

    const summary = memory.getSummary();
    expect(summary).toBe('Project: Unnamed Project (1 pieces of information)');
  });

  test('should clear all information', () => {
    memory.setName('Test');
    memory.add('Info 1');
    memory.add('Info 2');

    memory.clear();

    expect(memory.hasInfo()).toBe(false);
    expect(memory.getAll()).toEqual([]);
    expect(memory.getName()).toBeUndefined();
  });
});
