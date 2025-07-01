/**
 * MCP protocol types for functional architecture
 */

import type { ReadonlyRecord } from './features.js';

export interface ReadonlyMCPRequest {
  readonly params?: ReadonlyRecord<string, unknown>;
}

export interface ReadonlyMCPToolCallRequest extends ReadonlyMCPRequest {
  readonly params?: {
    readonly name?: string;
    readonly arguments?: ReadonlyRecord<string, unknown>;
  };
}

export interface ReadonlyMCPResourceRequest extends ReadonlyMCPRequest {
  readonly params?: {
    readonly uri?: string;
  };
}

export interface ReadonlyMCPPromptRequest extends ReadonlyMCPRequest {
  readonly params?: {
    readonly name?: string;
    readonly arguments?: ReadonlyRecord<string, unknown>;
  };
}

export interface ReadonlyMCPResponse {
  readonly content?: readonly ReadonlyMCPContent[];
  readonly isError?: boolean;
}

export interface ReadonlyMCPContent {
  readonly type: 'text';
  readonly text: string;
}
