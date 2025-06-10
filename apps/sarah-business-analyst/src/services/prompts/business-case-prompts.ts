/**
 * Business Case Prompts
 * Specialized prompts for business case document generation
 */

import { PromptResponse } from './prompt-registry.js';

export interface BusinessCasePromptArgs {
  projectInfo?: string[];
  templateType?: string;
}

/**
 * Generate comprehensive business case documents
 */
export function generateBusinessCasePrompt(args: BusinessCasePromptArgs): PromptResponse {
  const projectInfo = args.projectInfo || [];
  const projectInfoText = projectInfo.length > 0 
    ? projectInfo.map((info, i) => `${i + 1}. ${info}`).join('\n')
    : 'No specific project information provided.';

  return {
    description: "Generate a comprehensive business case document",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a professional business case document using the following information:

PROJECT INFORMATION:
${projectInfoText}

TEMPLATE SECTIONS:
1. Problem Definition - What specific problem are we solving?
2. Stakeholders - Who are the key people affected?
3. Business Impact - What's the cost of not solving this?
4. Proposed Solution - What's the high-level approach?
5. Success Criteria - How will we measure success?
6. ROI - What's the expected return on investment?
7. Timeline - What's the expected timeline?
8. Risks - What are the potential risks?

Please create a comprehensive business case that justifies the project investment. Use markdown formatting with proper headers and structure.`
        }
      }
    ]
  };
}

/**
 * Generate business case executive summary
 */
export function generateExecutiveSummaryPrompt(args: BusinessCasePromptArgs): PromptResponse {
  const projectInfo = args.projectInfo || [];
  const projectInfoText = projectInfo.length > 0 
    ? projectInfo.map((info, i) => `${i + 1}. ${info}`).join('\n')
    : 'No specific project information provided.';

  return {
    description: "Generate an executive summary for business case",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a concise executive summary for a business case using the following information:

PROJECT INFORMATION:
${projectInfoText}

EXECUTIVE SUMMARY REQUIREMENTS:
- Maximum 2 pages
- High-level problem statement
- Proposed solution overview
- Key benefits and ROI
- Investment required
- Timeline summary
- Risk assessment

Focus on the most compelling business arguments that executives need to make a decision. Use clear, executive-level language.`
        }
      }
    ]
  };
}

/**
 * Generate business case financial analysis
 */
export function generateFinancialAnalysisPrompt(args: BusinessCasePromptArgs): PromptResponse {
  const projectInfo = args.projectInfo || [];
  const projectInfoText = projectInfo.length > 0 
    ? projectInfo.map((info, i) => `${i + 1}. ${info}`).join('\n')
    : 'No specific project information provided.';

  return {
    description: "Generate detailed financial analysis for business case",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a detailed financial analysis for a business case using the following information:

PROJECT INFORMATION:
${projectInfoText}

FINANCIAL ANALYSIS SECTIONS:
1. Investment Costs
   - Initial implementation costs
   - Ongoing operational costs
   - Resource requirements

2. Benefits Analysis
   - Cost savings
   - Revenue generation
   - Efficiency gains
   - Risk mitigation value

3. ROI Calculation
   - Net Present Value (NPV)
   - Return on Investment (ROI)
   - Payback period
   - Internal Rate of Return (IRR)

4. Sensitivity Analysis
   - Best case scenario
   - Worst case scenario
   - Most likely scenario

Include specific numbers, assumptions, and calculations where possible. Present in a clear, professional format suitable for financial review.`
        }
      }
    ]
  };
}

/**
 * All business case prompt generators
 */
export const businessCasePrompts = {
  'business-case-generation': generateBusinessCasePrompt,
  'executive-summary': generateExecutiveSummaryPrompt,
  'financial-analysis': generateFinancialAnalysisPrompt
} as const;

/**
 * Business case prompt metadata
 */
export const businessCasePromptMetadata = [
  {
    name: "business-case-generation",
    description: "Generate comprehensive business case documents",
    arguments: [
      { name: "projectInfo", description: "Array of project information strings", required: false },
      { name: "templateType", description: "Type of template to use", required: false }
    ]
  },
  {
    name: "executive-summary",
    description: "Generate executive summary for business case",
    arguments: [
      { name: "projectInfo", description: "Array of project information strings", required: false },
      { name: "templateType", description: "Type of template to use", required: false }
    ]
  },
  {
    name: "financial-analysis",
    description: "Generate detailed financial analysis for business case",
    arguments: [
      { name: "projectInfo", description: "Array of project information strings", required: false },
      { name: "templateType", description: "Type of template to use", required: false }
    ]
  }
];
