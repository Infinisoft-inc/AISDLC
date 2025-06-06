/**
 * Summarize Business Case Tool
 * Handles generating comprehensive business case summaries from stored answers
 */

import type { SummarizeBusinessCaseArgs, SummarizeBusinessCaseResult } from './shared-types';
import type { BusinessCase } from '../business_case';
import { getBusinessCase } from './simple-storage';

/**
 * Tool for generating business case summaries
 */
export const summarizeBusinessCaseTool = {
  name: 'summarize-business-case',
  description: 'Generate a comprehensive business case summary from stored answers',
  inputSchema: {
    type: "object",
    properties: {
      projectId: { type: "string", description: "Project identifier to summarize" }
    },
    required: ['projectId']
  },
  async execute(args: SummarizeBusinessCaseArgs): Promise<SummarizeBusinessCaseResult> {
    // Retrieve data from storage
    const result = getBusinessCase(args.projectId);

    if (!result.success || !result.data) {
      return {
        projectId: args.projectId,
        summary: `# Business Case Summary for ${args.projectId}\n\n❌ No data found for this project.`,
        completionStatus: "0/6 sections completed"
      };
    }

    const data = result.data;
    const fields = ['problem', 'stakeholders', 'outcomes', 'timeline', 'budget', 'constraints'];
    const completed = fields.filter(field => data[field as keyof BusinessCase]).length;

    const summary = `# Business Case Summary for ${args.projectId}

## Problem Statement
${data.problem || "Not yet defined"}

## Stakeholders
${data.stakeholders || "Not yet identified"}

## Expected Outcomes
${data.outcomes || "Not yet defined"}

## Timeline
${data.timeline || "Not yet specified"}

## Budget Considerations
${data.budget || "Not yet discussed"}

## Constraints
${data.constraints || "Not yet identified"}

---

**Status**: ${completed}/${fields.length} sections completed

*This is a generated summary from stored business case data.*`;

    return {
      projectId: args.projectId,
      summary,
      completionStatus: `${completed}/${fields.length} sections completed`
    };
  }
};
