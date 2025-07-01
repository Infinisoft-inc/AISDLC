/**
 * Create functional framework composition
 */

import type { ReadonlyConfig } from '../types/core.js';
import type { ReadonlyToolDefinition, ReadonlyResourceDefinition, ReadonlyPromptDefinition } from '../types/plugin.js';
import type { LoggerService } from '../services/logger.js';
import type { MemoryService } from '../services/memory.js';
import type { UriBuilderService } from '../services/uri-builder.js';
import { createLoggerService } from '../services/logger.js';
import { createMemoryService } from '../services/memory.js';
import { createUriBuilderService } from '../services/uri-builder.js';

export interface FunctionalFramework {
  readonly config: ReadonlyConfig;
  readonly logger: LoggerService;
  readonly memory: MemoryService;
  readonly uriBuilder: UriBuilderService;
  readonly tools: readonly ReadonlyToolDefinition[];
  readonly resources: readonly ReadonlyResourceDefinition[];
  readonly prompts: readonly ReadonlyPromptDefinition[];
}

export const createFramework = (
  config: ReadonlyConfig,
  tools: readonly ReadonlyToolDefinition[] = [],
  resources: readonly ReadonlyResourceDefinition[] = [],
  prompts: readonly ReadonlyPromptDefinition[] = []
): FunctionalFramework => ({
  config,
  logger: createLoggerService(config.agent.name),
  memory: createMemoryService(),
  uriBuilder: createUriBuilderService(config.features.resources.uriPrefix),
  tools,
  resources,
  prompts
});
