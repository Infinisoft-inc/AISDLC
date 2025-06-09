/**
 * create-tool-factory Unit Tests
 * 100% coverage requirement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createToolFactory } from './create-tool-factory';

describe('createToolFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create tool factory with valid configuration', () => {
    const config = {
      defaultTimeout: 5000,
      enableEvents: true,
      validateInputs: true
    };
    
    const factory = createToolFactory(config);
    
    expect(factory).toBeDefined();
    expect(typeof factory).toBe('function');
  });

  it('should create tool factory with default configuration', () => {
    const factory = createToolFactory();
    
    expect(factory).toBeDefined();
    expect(typeof factory).toBe('function');
  });

  it('should create tool using factory', () => {
    const factory = createToolFactory();
    
    const tool = factory(
      'greet-tool',
      'Greets a person',
      { name: { type: 'string', description: 'Name to greet' } },
      ['name'],
      async ({ name }: { name: string }) => `Hello ${name}`
    );
    
    expect(tool).toBeDefined();
    expect(tool.name).toBe('greet-tool');
    expect(tool.description).toBe('Greets a person');
    expect(tool.parameters).toEqual({ name: { type: 'string', description: 'Name to greet' } });
    expect(typeof tool.execute).toBe('function');
  });

  it('should create tool with no parameters', () => {
    const factory = createToolFactory();
    
    const tool = factory(
      'no-params-tool',
      'Tool with no parameters',
      {},
      [],
      async () => 'result'
    );
    
    expect(tool.name).toBe('no-params-tool');
    expect(tool.parameters).toEqual({});
    expect(typeof tool.execute).toBe('function');
  });

  it('should create tool with custom timeout configuration', () => {
    const factory = createToolFactory({ defaultTimeout: 5000 });
    
    const tool = factory(
      'timeout-tool',
      'Tool with custom timeout',
      {},
      [],
      async () => 'result'
    );
    
    expect(tool.name).toBe('timeout-tool');
    expect(typeof tool.execute).toBe('function');
  });

  it('should execute tool successfully', async () => {
    const factory = createToolFactory();
    
    const tool = factory(
      'echo-tool',
      'Echoes input',
      { input: { type: 'string', description: 'Input to echo' } },
      ['input'],
      async ({ input }: { input: string }) => `Echo: ${input}`
    );
    
    const result = await tool.execute({ input: 'test' });
    
    expect(result).toBe('Echo: test');
  });

  it('should handle execution errors', async () => {
    const factory = createToolFactory();
    
    const tool = factory(
      'error-tool',
      'Tool that throws error',
      {},
      [],
      async () => {
        throw new Error('Execution failed');
      }
    );
    
    try {
      await tool.execute({});
      expect.fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Execution failed');
    }
  });

  it.skip('should validate inputs before execution', async () => {
    const mockExecute = vi.fn().mockResolvedValue('result');
    const factory = createToolFactory({ validateInputs: true });
    
    const tool = factory(
      'validation-tool',
      'Tool with validation',
      { required: { type: 'string', description: 'Required parameter' } },
      ['required'],
      mockExecute
    );
    
    try {
      await tool.execute({}); // Missing required parameter
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Missing required parameter');
      expect(mockExecute).not.toHaveBeenCalled();
    }
  });

  it('should throw for invalid tool definition', () => {
    const factory = createToolFactory();
    
    expect(() => factory(
      '', // Invalid empty name
      'Valid description',
      {},
      [],
      async () => 'result'
    )).toThrow('Tool name cannot be empty');
  });

  it('should create tool with complex parameters', () => {
    const factory = createToolFactory();
    
    const tool = factory(
      'complex-tool',
      'Tool with complex parameters',
      {
        name: { type: 'string', description: 'Name parameter' },
        age: { type: 'number', description: 'Age parameter', required: false },
        status: { 
          type: 'string', 
          description: 'Status parameter',
          enum: ['active', 'inactive', 'pending']
        },
        enabled: { type: 'boolean', description: 'Enabled flag' }
      },
      ['name', 'status', 'enabled'], // age is optional
      async (args: any) => `Processed: ${JSON.stringify(args)}`
    );
    
    expect(tool.name).toBe('complex-tool');
    expect(Object.keys(tool.parameters)).toHaveLength(4);
    expect(tool.parameters.status.enum).toEqual(['active', 'inactive', 'pending']);
  });

  it('should create factory with events disabled', () => {
    const factory = createToolFactory({ enableEvents: false });
    
    const tool = factory(
      'no-events-tool',
      'Tool without events',
      {},
      [],
      async () => 'result'
    );
    
    expect(tool.name).toBe('no-events-tool');
    expect(typeof tool.execute).toBe('function');
  });

  it('should create factory with validation disabled', () => {
    const factory = createToolFactory({ validateInputs: false });
    
    const tool = factory(
      'no-validation-tool',
      'Tool without validation',
      { param: { type: 'string', description: 'Parameter' } },
      ['param'],
      async () => 'result'
    );
    
    expect(tool.name).toBe('no-validation-tool');
    expect(typeof tool.execute).toBe('function');
  });
});
