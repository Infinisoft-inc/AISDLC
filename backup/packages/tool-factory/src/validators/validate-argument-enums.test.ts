/**
 * validate-argument-enums Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateArgumentEnums } from './validate-argument-enums';
import type { ToolParameters } from '../types';

describe('validateArgumentEnums', () => {
  const parameters: ToolParameters = {
    status: { type: 'string', description: 'Status', enum: ['active', 'inactive'] },
    priority: { type: 'string', description: 'Priority', enum: ['high', 'medium', 'low'] },
    name: { type: 'string', description: 'Name' }, // No enum
    count: { type: 'number', description: 'Count' } // No enum
  };

  it('should pass for valid enum values', () => {
    const args = { status: 'active', priority: 'high', name: 'test', count: 5 };
    expect(() => validateArgumentEnums(args, parameters)).not.toThrow();
  });

  it('should pass when enum parameters not provided', () => {
    const args = { name: 'test', count: 5 };
    expect(() => validateArgumentEnums(args, parameters)).not.toThrow();
  });

  it('should pass when only non-enum parameters provided', () => {
    const args = { name: 'test' };
    expect(() => validateArgumentEnums(args, parameters)).not.toThrow();
  });

  it('should pass with empty args', () => {
    expect(() => validateArgumentEnums({}, parameters)).not.toThrow();
  });

  it('should pass with empty parameters', () => {
    const args = { anything: 'value' };
    expect(() => validateArgumentEnums(args, {})).not.toThrow();
  });

  it('should pass when one enum valid, other not provided', () => {
    const args = { status: 'active', name: 'test' };
    expect(() => validateArgumentEnums(args, parameters)).not.toThrow();
  });

  it('should throw for invalid enum value', () => {
    const args = { status: 'invalid', name: 'test' };
    expect(() => validateArgumentEnums(args, parameters))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });

  it('should throw for invalid priority enum', () => {
    const args = { priority: 'urgent', name: 'test' };
    expect(() => validateArgumentEnums(args, parameters))
      .toThrow("Parameter 'priority' must be one of: high, medium, low");
  });

  it('should throw for first invalid enum when multiple present', () => {
    const args = { status: 'invalid', priority: 'also-invalid' };
    expect(() => validateArgumentEnums(args, parameters))
      .toThrow("Parameter 'status' must be one of: active, inactive");
  });
});
