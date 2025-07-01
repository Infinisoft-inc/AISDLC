/**
 * Create tool tests
 */

import { createTool } from '../../tools/create-tool.js';
import { success } from '../../utils/result.js';

describe('createTool', () => {
  test('should create tool definition', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        message: {
          type: 'string',
          description: 'Message to process'
        }
      },
      required: ['message']
    };

    const handler = async () => success('test result');

    const tool = createTool('test-tool', 'Test tool description', schema, handler);

    expect(tool.name).toBe('test-tool');
    expect(tool.description).toBe('Test tool description');
    expect(tool.inputSchema).toBe(schema);
    expect(tool.handler).toBe(handler);
  });

  test('should create tool with complex schema', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          description: 'Action to perform',
          enum: ['create', 'update', 'delete']
        },
        data: {
          type: 'string',
          description: 'Data payload'
        }
      },
      required: ['action']
    };

    const handler = async () => success('complex result');

    const tool = createTool('complex-tool', 'Complex tool', schema, handler);

    expect(tool.inputSchema.properties.action.enum).toEqual(['create', 'update', 'delete']);
    expect(tool.inputSchema.required).toEqual(['action']);
  });
});
