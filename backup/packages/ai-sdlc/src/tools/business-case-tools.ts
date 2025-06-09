/**
 * Business Case Tools - Entry point for all business case tools
 * Self-contained tools without external dependencies
 */

export * from './shared-types';
export * from './store-business-case';
export * from './summarize-business-case';
export * from './simple-storage';

import { storeBusinessCaseTool } from './store-business-case';
import { summarizeBusinessCaseTool } from './summarize-business-case';

// ===== TOOL COLLECTION =====

export const businessCaseTools = [
  storeBusinessCaseTool,
  summarizeBusinessCaseTool
] as const;
