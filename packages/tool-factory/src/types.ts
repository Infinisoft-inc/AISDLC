/**
 * Core Tool Factory Types
 * SRP: Type definitions only
 */

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolParameters {
  [key: string]: ToolParameter;
}

export type ToolFunction<TArgs, TResult> = (args: TArgs) => Promise<TResult>;

export interface ToolDefinition<TArgs, TResult> {
  name: string;
  description: string;
  parameters: ToolParameters;
  requiredParameters: string[];
  execute: ToolFunction<TArgs, TResult>;
}

export interface ToolFactoryConfig {
  defaultTimeout?: number;
  enableEvents?: boolean;
  validateInputs?: boolean;
}

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}

export interface ToolEvent<TArgs, TResult> {
  toolName: string;
  args: TArgs;
  result: ToolResult<TResult>;
  timestamp: Date;
}
