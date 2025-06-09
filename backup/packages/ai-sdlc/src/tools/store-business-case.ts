/**
 * Store Business Case Tool
 * Handles storing business case discovery answers for a project
 */

import type { BusinessCase } from '../business_case';
import type { StoreBusinessCaseResult } from './shared-types';
import { storeBusinessCase } from './simple-storage';

/**
 * Tool for storing business case discovery answers
 */
export const storeBusinessCaseTool = {
  name: 'store-business-case',
  description: 'Store business case discovery answers for a project',
  inputSchema: {
    type: "object",
    properties: {
      projectId: { type: "string", description: "Unique project identifier" },
      problem: { type: "string", description: "Problem description" },
      stakeholders: { type: "string", description: "Key stakeholders and users" },
      outcomes: { type: "string", description: "Expected outcomes and success criteria" },
      timeline: { type: "string", description: "Timeline expectations" },
      budget: { type: "string", description: "Budget considerations" },
      constraints: { type: "string", description: "Constraints and limitations" }
    },
    required: ['projectId']
  },
  async execute(args: BusinessCase): Promise<StoreBusinessCaseResult> {
    // Store using shared storage
    const result = storeBusinessCase(args);

    return {
      projectId: args.projectId,
      stored: result.success,
      timestamp: new Date().toISOString()
    };
  }
};
