/**
 * validate-required-parameters Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateRequiredParameters } from './validate-required-parameters';
import type { ToolParameters } from '../types';

describe('validateRequiredParameters', () => {
  const parameters: ToolParameters = {
    param1: { type: 'string', description: 'First param' },
    param2: { type: 'number', description: 'Second param' },
    param3: { type: 'boolean', description: 'Third param' }
  };

  it('should pass when all required parameters exist', () => {
    expect(() => validateRequiredParameters(parameters, ['param1', 'param2'])).not.toThrow();
  });

  it('should pass when single required parameter exists', () => {
    expect(() => validateRequiredParameters(parameters, ['param1'])).not.toThrow();
  });

  it('should pass with empty required parameters', () => {
    expect(() => validateRequiredParameters(parameters, [])).not.toThrow();
  });

  it('should pass with empty parameters and empty required', () => {
    expect(() => validateRequiredParameters({}, [])).not.toThrow();
  });

  it('should throw when required parameter missing', () => {
    expect(() => validateRequiredParameters(parameters, ['missing']))
      .toThrow("Required parameter 'missing' not found in parameters");
  });

  it('should throw when one of multiple required parameters missing', () => {
    expect(() => validateRequiredParameters(parameters, ['param1', 'missing']))
      .toThrow("Required parameter 'missing' not found in parameters");
  });

  it('should throw when all required parameters missing', () => {
    expect(() => validateRequiredParameters({}, ['param1']))
      .toThrow("Required parameter 'param1' not found in parameters");
  });
});
