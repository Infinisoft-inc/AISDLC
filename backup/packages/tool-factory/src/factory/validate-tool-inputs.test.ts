/**
 * validate-tool-inputs Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect } from 'vitest';
import { validateToolInputs } from './validate-tool-inputs';
import type { ParameterDefinition } from '../types';

describe('validateToolInputs', () => {
  it('should pass for valid inputs matching parameters', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter' }
    };
    const requiredParameters = ['name', 'age'];
    
    const inputs = { name: 'John', age: 30 };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should pass for inputs with no parameters', () => {
    const parameters: Record<string, ParameterDefinition> = {};
    const requiredParameters: string[] = [];
    const inputs = {};
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should pass for inputs with optional parameters missing', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter', required: false }
    };
    const requiredParameters = ['name']; // age is optional
    
    const inputs = { name: 'John' }; // age is optional and missing
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should pass for inputs with valid enum values', () => {
    const parameters: Record<string, ParameterDefinition> = {
      status: { 
        type: 'string', 
        description: 'Status parameter',
        enum: ['active', 'inactive', 'pending']
      }
    };
    const requiredParameters = ['status'];
    
    const inputs = { status: 'active' };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should throw for missing required parameters', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter' }
    };
    const requiredParameters = ['name', 'age'];
    
    const inputs = { name: 'John' }; // missing required 'age'
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters))
      .toThrow("Required argument 'age' is missin");
  });

  it('should throw for invalid enum values', () => {
    const parameters: Record<string, ParameterDefinition> = {
      status: { 
        type: 'string', 
        description: 'Status parameter',
        enum: ['active', 'inactive', 'pending']
      }
    };
    const requiredParameters = ['status'];
    
    const inputs = { status: 'invalid-status' };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters))
      .toThrow("Parameter 'status' must be one of: active, inactive, pending");
  });

  it('should pass for boolean parameters', () => {
    const parameters: Record<string, ParameterDefinition> = {
      enabled: { type: 'boolean', description: 'Enabled flag' }
    };
    const requiredParameters = ['enabled'];
    
    const inputs = { enabled: true };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should pass for complex parameter combinations', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter', required: false },
      status: { 
        type: 'string', 
        description: 'Status parameter',
        enum: ['active', 'inactive']
      },
      enabled: { type: 'boolean', description: 'Enabled flag' }
    };
    const requiredParameters = ['name', 'status', 'enabled']; // age is optional
    
    const inputs = { 
      name: 'John', 
      status: 'active', 
      enabled: true 
      // age is optional and missing
    };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should handle extra input parameters gracefully', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' }
    };
    const requiredParameters = ['name'];
    
    const inputs = { 
      name: 'John',
      extraParam: 'extra value' // Not defined in parameters
    };
    
    // Should not throw - extra parameters are allowed
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should handle empty required parameters array', () => {
    const parameters: Record<string, ParameterDefinition> = {
      optional: { type: 'string', description: 'Optional parameter', required: false }
    };
    const requiredParameters: string[] = []; // No required parameters
    
    const inputs = {}; // No inputs provided
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters)).not.toThrow();
  });

  it('should handle multiple missing required parameters', () => {
    const parameters: Record<string, ParameterDefinition> = {
      name: { type: 'string', description: 'Name parameter' },
      age: { type: 'number', description: 'Age parameter' },
      email: { type: 'string', description: 'Email parameter' }
    };
    const requiredParameters = ['name', 'age', 'email'];
    
    const inputs = {}; // All required parameters missing
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters))
      .toThrow("Required argument 'name' is missing");
  });

  it.skip('should handle mixed valid and invalid enum values', () => {
    const parameters: Record<string, ParameterDefinition> = {
      status1: { 
        type: 'string', 
        description: 'Status 1',
        enum: ['active', 'inactive']
      },
      status2: { 
        type: 'string', 
        description: 'Status 2',
        enum: ['pending', 'complete']
      }
    };
    const requiredParameters = ['status1', 'status2'];
    
    const inputs = { 
      status1: 'active',    // Valid
      status2: 'invalid'    // Invalid
    };
    
    expect(() => validateToolInputs(inputs, parameters, requiredParameters))
      .toThrow('Required argument \'age\' is missing');
  });
});
