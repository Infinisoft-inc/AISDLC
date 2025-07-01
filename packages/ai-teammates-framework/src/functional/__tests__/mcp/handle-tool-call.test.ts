/**
 * Handle tool call tests
 */

import { handleToolCall } from '../../mcp/handle-tool-call.js';
import { createTool } from '../../tools/create-tool.js';
import { success, failure } from '../../utils/result.js';

describe('handleToolCall', () => {
  const mockSchema = {
    type: 'object' as const,
    properties: {
      message: { type: 'string', description: 'Message' }
    }
  };

  test('should handle successful tool call', async () => {
    const handler = async () => success('Tool executed successfully');
    const tool = createTool('test-tool', 'Test tool', mockSchema, handler);
    
    const request = {
      params: {
        name: 'test-tool',
        arguments: { message: 'hello' }
      }
    };

    const response = await handleToolCall(request, [tool]);

    expect(response.isError).toBe(false);
    expect(response.content?.[0]?.text).toBe('Tool executed successfully');
  });

  test('should handle tool execution failure', async () => {
    const handler = async () => failure('Tool failed');
    const tool = createTool('failing-tool', 'Failing tool', mockSchema, handler);
    
    const request = {
      params: {
        name: 'failing-tool',
        arguments: {}
      }
    };

    const response = await handleToolCall(request, [tool]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Tool failed');
  });

  test('should handle missing tool name', async () => {
    const request = { params: {} };

    const response = await handleToolCall(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe('Tool name is required');
  });

  test('should handle tool not found', async () => {
    const request = {
      params: {
        name: 'nonexistent-tool',
        arguments: {}
      }
    };

    const response = await handleToolCall(request, []);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toBe("Tool 'nonexistent-tool' not found");
  });

  test('should handle tool handler exception', async () => {
    const handler = async () => {
      throw new Error('Handler crashed');
    };
    const tool = createTool('crashing-tool', 'Crashing tool', mockSchema, handler);
    
    const request = {
      params: {
        name: 'crashing-tool',
        arguments: {}
      }
    };

    const response = await handleToolCall(request, [tool]);

    expect(response.isError).toBe(true);
    expect(response.content?.[0]?.text).toContain('Tool execution failed');
  });
});
