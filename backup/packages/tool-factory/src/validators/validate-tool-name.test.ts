/**
 * validate-tool-name Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateToolName } from './validate-tool-name';

describe('validateToolName', () => {
  it('should pass for valid name', () => {
    expect(() => validateToolName('valid-name')).not.toThrow();
  });

  it('should pass for name with spaces', () => {
    expect(() => validateToolName('valid name')).not.toThrow();
  });

  it('should pass for name with numbers', () => {
    expect(() => validateToolName('tool123')).not.toThrow();
  });

  it('should throw for empty string', () => {
    expect(() => validateToolName('')).toThrow('Tool name cannot be empty');
  });

  it('should throw for whitespace only', () => {
    expect(() => validateToolName('   ')).toThrow('Tool name cannot be empty');
  });

  it('should throw for tab only', () => {
    expect(() => validateToolName('\t')).toThrow('Tool name cannot be empty');
  });

  it('should throw for newline only', () => {
    expect(() => validateToolName('\n')).toThrow('Tool name cannot be empty');
  });
});
