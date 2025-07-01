/**
 * Functional AI Teammates Framework
 * Pure functional architecture with composition
 */

// Types
export type * from './types/core.js';
export type * from './types/transport.js';
export type * from './types/features.js';
export type * from './types/result.js';
export type * from './types/plugin.js';
export type * from './types/mcp.js';

// Utilities
export * from './utils/result.js';
export * from './utils/compose.js';

// Configuration
export * from './config/parse-env.js';
export * from './config/validate.js';

// Services
export * from './services/logger.js';
export * from './services/memory.js';
export * from './services/uri-builder.js';

// Core functions
export * from './logging/create-entry.js';
export * from './logging/format-entry.js';
export * from './logging/output-entry.js';
export * from './memory/create-entry.js';
export * from './memory/is-expired.js';
export * from './memory/filter-valid.js';
export * from './uri/build-memory.js';
export * from './uri/build-conversation.js';
export * from './uri/build-template.js';
export * from './uri/build-project.js';

// Tools and plugins
export * from './tools/create-tool.js';
export * from './tools/create-resource.js';
export * from './tools/create-prompt.js';

// MCP handlers
export * from './mcp/create-response.js';
export * from './mcp/handle-tool-call.js';
export * from './mcp/handle-resource-read.js';
export * from './mcp/handle-prompt-get.js';

// Framework composition
export * from './framework/create-framework.js';

// Built-in components
export * from './builtin/memory-tool.js';
export * from './builtin/memory-resource.js';
export * from './builtin/conversation-prompt.js';
