/**
 * validate-required-arguments Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateRequiredArguments } from './validate-required-arguments';

describe('validateRequiredArguments', () => {
  it('should pass when all required arguments present', () => {
    const args = { param1: 'value1', param2: 'value2', param3: 'value3' };
    expect(() => validateRequiredArguments(args, ['param1', 'param2'])).not.toThrow();
  });

  it('should pass when single required argument present', () => {
    const args = { param1: 'value1', param2: 'value2' };
    expect(() => validateRequiredArguments(args, ['param1'])).not.toThrow();
  });

  it('should pass with empty required parameters', () => {
    const args = { param1: 'value1' };
    expect(() => validateRequiredArguments(args, [])).not.toThrow();
  });

  it('should pass with empty args and empty required', () => {
    expect(() => validateRequiredArguments({}, [])).not.toThrow();
  });

  it('should pass when argument value is falsy but present', () => {
    const args = { param1: '', param2: 0, param3: false };
    expect(() => validateRequiredArguments(args, ['param1', 'param2', 'param3'])).not.toThrow();
  });

  it('should throw when required argument missing', () => {
    const args = { param1: 'value1' };
    expect(() => validateRequiredArguments(args, ['missing']))
      .toThrow("Required argument 'missing' is missing");
  });

  it('should throw when one of multiple required arguments missing', () => {
    const args = { param1: 'value1' };
    expect(() => validateRequiredArguments(args, ['param1', 'missing']))
      .toThrow("Required argument 'missing' is missing");
  });

  it('should throw when all required arguments missing', () => {
    const args = {};
    expect(() => validateRequiredArguments(args, ['param1']))
      .toThrow("Required argument 'param1' is missing");
  });
});
