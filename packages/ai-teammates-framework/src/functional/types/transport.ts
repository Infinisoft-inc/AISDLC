/**
 * Transport types for functional architecture
 */

import type { ReadonlyRecord } from './features.js';

export interface ReadonlyTransportConfig {
  readonly type: 'stdio' | 'sse';
  readonly options: ReadonlyRecord<string, unknown>;
}

export interface ReadonlyDopplerConfig {
  readonly token: string;
  readonly project: string;
  readonly environment: string;
}

export interface ReadonlyStorageConfig {
  readonly type: string;
  readonly basePath: string;
  readonly github: ReadonlyGitHubStorageConfig;
}

export interface ReadonlyGitHubStorageConfig {
  readonly owner: string;
  readonly repo: string;
  readonly branch: string;
}

export interface ReadonlyGitHubConfig {
  readonly token: string;
  readonly organization: string;
  readonly commentSignature: string;
}

import type { ReadonlyResourcesConfig, ReadonlyToolsConfig, ReadonlyPromptsConfig } from './features.js';

export interface ReadonlyFeaturesConfig {
  readonly resources: ReadonlyResourcesConfig;
  readonly tools: ReadonlyToolsConfig;
  readonly prompts: ReadonlyPromptsConfig;
}

// Re-export from features
export type { ReadonlyResourcesConfig, ReadonlyToolsConfig, ReadonlyPromptsConfig };
