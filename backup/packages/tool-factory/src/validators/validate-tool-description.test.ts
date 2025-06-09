/**
 * validate-tool-description Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateToolDescription } from './validate-tool-description';

describe('validateToolDescription', () => {
  it('should pass for valid description', () => {
    expect(() => validateToolDescription('Valid description')).not.toThrow();
  });

  it('should pass for long description', () => {
    const longDesc = 'This is a very long description that contains multiple sentences and explains what the tool does in great detail.';
    expect(() => validateToolDescription(longDesc)).not.toThrow();
  });

  it('should pass for description with special characters', () => {
    expect(() => validateToolDescription('Tool with @#$% characters')).not.toThrow();
  });

  it('should throw for empty string', () => {
    expect(() => validateToolDescription('')).toThrow('Tool description cannot be empty');
  });

  it('should throw for whitespace only', () => {
    expect(() => validateToolDescription('   ')).toThrow('Tool description cannot be empty');
  });

  it('should throw for tab only', () => {
    expect(() => validateToolDescription('\t')).toThrow('Tool description cannot be empty');
  });

  it('should throw for newline only', () => {
    expect(() => validateToolDescription('\n')).toThrow('Tool description cannot be empty');
  });
});
