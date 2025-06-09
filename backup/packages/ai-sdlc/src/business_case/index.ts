/**
 * Business Case Module - Core business case functionality
 * Simple business case types and interfaces
 */

/**
 * Business Case data structure
 */
export interface BusinessCase {
  projectId: string;
  problem?: string;
  stakeholders?: string;
  outcomes?: string;
  timeline?: string;
  budget?: string;
  constraints?: string;
}

/**
 * Parse business case from unknown input
 */
export function parseBusinessCase(input: any): BusinessCase {
  if (typeof input !== 'object' || !input) {
    throw new Error('Invalid business case input');
  }

  if (!input.projectId || typeof input.projectId !== 'string') {
    throw new Error('Business case must have a valid projectId');
  }

  return {
    projectId: input.projectId,
    problem: input.problem || '',
    stakeholders: input.stakeholders || '',
    outcomes: input.outcomes || '',
    timeline: input.timeline || '',
    budget: input.budget || '',
    constraints: input.constraints || ''
  };
}

/**
 * Business case schema for validation
 */
export const BusinessCaseSchema = {
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
  required: ["projectId"]
};
