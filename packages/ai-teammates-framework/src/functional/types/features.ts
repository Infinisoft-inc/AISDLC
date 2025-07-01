/**
 * Feature types for functional architecture
 */

export interface ReadonlyResourcesConfig {
  readonly uriPrefix: string;
  readonly conversationHistoryLimit: number;
  readonly enabledResources: readonly string[];
}

export interface ReadonlyToolsConfig {
  readonly namePrefix: string;
  readonly enabledTools: readonly string[];
}

export interface ReadonlyPromptsConfig {
  readonly enabledPrompts: readonly string[];
  readonly templatePath: string;
}

export type ReadonlyRecord<K extends string | number | symbol, V> = {
  readonly [P in K]: V;
};

export interface ReadonlyLogEntry {
  readonly timestamp: Date;
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly message: string;
  readonly context: ReadonlyRecord<string, unknown>;
  readonly agentName: string;
}

export interface ReadonlyMemoryEntry<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly timestamp: Date;
  readonly ttl?: number;
}
