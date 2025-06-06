/**
 * MCP Adapter - Simple MCP Protocol Support
 * Converts simple tools to MCP format and handles execution
 */

/**
 * Simple tool interface
 */
export interface SimpleTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
  execute(args: any): Promise<any>;
}

/**
 * MCP Tool Schema (compatible with @modelcontextprotocol/sdk)
 */
export interface MCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * MCP Tool Response
 */
export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

/**
 * Converts simple tool to MCP tool schema
 */
export function toolToMCPSchema(tool: SimpleTool): MCPToolSchema {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  };
}

/**
 * Converts multiple tools to MCP tool list
 */
export function toolsToMCPSchemas(tools: SimpleTool[]): MCPToolSchema[] {
  return tools.map(toolToMCPSchema);
}

/**
 * Executes tool and formats response for MCP
 */
export async function executeMCPTool(
  tool: SimpleTool,
  args: any
): Promise<MCPToolResponse> {
  try {
    const result = await tool.execute(args);

    return {
      content: [
        {
          type: "text",
          text: formatToolResult(tool.name, result, true)
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      content: [
        {
          type: "text",
          text: formatToolResult(tool.name, errorMessage, false)
        }
      ]
    };
  }
}



/**
 * Formats tool execution result for display
 */
function formatToolResult<TResult>(
  toolName: string,
  result: TResult | string,
  success: boolean
): string {
  if (success) {
    return `✅ ${toolName} executed successfully:\n\n${formatResultData(result)}`;
  } else {
    return `❌ ${toolName} failed: ${result}`;
  }
}

/**
 * Formats result data for display
 */
function formatResultData<TResult>(result: TResult): string {
  if (typeof result === 'string') {
    return result;
  }
  
  if (typeof result === 'object' && result !== null) {
    return JSON.stringify(result, null, 2);
  }
  
  return String(result);
}

/**
 * Creates MCP tool handler from simple tool
 */
export function createMCPToolHandler(tool: SimpleTool) {
  return {
    schema: toolToMCPSchema(tool),
    handler: (args: any) => executeMCPTool(tool, args)
  };
}
