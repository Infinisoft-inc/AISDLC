/**
 * Plugin types for functional architecture
 */

import type { ReadonlyRecord } from './features.js';
import type { Result } from './result.js';

export interface ReadonlyToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: ReadonlyToolSchema;
  readonly handler: ToolHandler;
}

export interface ReadonlyResourceDefinition {
  readonly uri: string;
  readonly name: string;
  readonly description: string;
  readonly mimeType: string;
  readonly handler: ResourceHandler;
}

export interface ReadonlyPromptDefinition {
  readonly name: string;
  readonly description: string;
  readonly arguments: readonly ReadonlyPromptArgument[];
  readonly handler: PromptHandler;
}

export interface ReadonlyPromptArgument {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
}

export interface ReadonlyToolSchema {
  readonly type: 'object';
  readonly properties: ReadonlyRecord<string, ReadonlySchemaProperty>;
  readonly required?: readonly string[];
}

export interface ReadonlySchemaProperty {
  readonly type: string;
  readonly description: string;
  readonly enum?: readonly string[];
}

export type ToolHandler = (
  args: ReadonlyRecord<string, unknown>
) => Promise<Result<string>>;

export type ResourceHandler = (
  uri: string
) => Promise<Result<string>>;

export type PromptHandler = (
  args: ReadonlyRecord<string, unknown>
) => Promise<Result<string>>;
