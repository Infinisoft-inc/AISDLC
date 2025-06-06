/**
 * Memory functions for business-analyst-mcp
 * Uses the @brainstack/mem package for storage
 */

import { upsert, recall, list, InMemoryNetwork } from "@brainstack/mem";
import type { BusinessCase } from "@brainstack/ai-sdlc";

export type BusinessCaseData = BusinessCase;

/**
 * Store business case data
 */
export async function storeBusinessCase(data: BusinessCase) {
  const dataWithTimestamp = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  return await upsert(InMemoryNetwork, data.projectId, dataWithTimestamp);
}

/**
 * Recall business case data
 */
export async function recallBusinessCase(projectId: string) {
  return await recall(InMemoryNetwork, projectId);
}

/**
 * List all business cases
 */
export async function listBusinessCases() {
  return await list(InMemoryNetwork);
}
