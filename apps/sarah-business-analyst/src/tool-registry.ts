/**
 * Tool Registry - Single Responsibility
 * Only handles tool registration and execution
 */

export interface Tool {
  execute(args: any): Promise<any>;
  getSchema(): any;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool) {
    const schema = tool.getSchema();
    this.tools.set(schema.name, tool);
  }

  async execute(name: string, args: any) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return await tool.execute(args);
  }

  getSchemas() {
    return Array.from(this.tools.values()).map(tool => tool.getSchema());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}
