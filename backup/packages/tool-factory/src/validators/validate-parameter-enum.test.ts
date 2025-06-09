/**
 * validate-parameter-enum Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateParameterEnum } from './validate-parameter-enum';

describe('validateParameterEnum', () => {
  it('should pass for valid enum value', () => {
    expect(() => validateParameterEnum('status', 'active', ['active', 'inactive']))
      .not.toThrow();
  });

  it('should pass for first enum value', () => {
    expect(() => validateParameterEnum('priority', 'high', ['high', 'medium', 'low']))
      .not.toThrow();
  });

  it('should pass for last enum value', () => {
    expect(() => validateParameterEnum('priority', 'low', ['high', 'medium', 'low']))
      .not.toThrow();
  });

  it('should pass for middle enum value', () => {
    expect(() => validateParameterEnum('priority', 'medium', ['high', 'medium', 'low']))
      .not.toThrow();
  });

  it('should pass for single enum value', () => {
    expect(() => validateParameterEnum('type', 'only', ['only']))
      .not.toThrow();
  });

  it('should throw for invalid enum value', () => {
    expect(() => validateParameterEnum('status', 'invalid', ['active', 'inactive']))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });

  it('should throw for case mismatch', () => {
    expect(() => validateParameterEnum('status', 'Active', ['active', 'inactive']))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });

  it('should throw for empty string when not in enum', () => {
    expect(() => validateParameterEnum('status', '', ['active', 'inactive']))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });

  it('should throw for null value', () => {
    expect(() => validateParameterEnum('status', null, ['active', 'inactive']))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });

  it('should throw for undefined value', () => {
    expect(() => validateParameterEnum('status', undefined, ['active', 'inactive']))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });
});
