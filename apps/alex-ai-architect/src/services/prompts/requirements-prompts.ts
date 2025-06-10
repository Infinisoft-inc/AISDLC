/**
 * Requirements Prompts
 * Specialized prompts for requirements gathering, analysis, and documentation
 */

import { PromptResponse } from './prompt-registry.js';

export interface RequirementsPromptArgs {
  projectType?: string;
  stakeholders?: string[];
  constraints?: string[];
  currentRequirements?: string[];
  analysisType?: string;
}

/**
 * Guide requirements gathering conversations
 */
export function generateRequirementsGatheringPrompt(args: RequirementsPromptArgs): PromptResponse {
  const projectType = args.projectType || 'software';
  const stakeholdersText = args.stakeholders && args.stakeholders.length > 0 
    ? `STAKEHOLDERS: ${args.stakeholders.join(', ')}`
    : '';
  const constraintsText = args.constraints && args.constraints.length > 0
    ? `CONSTRAINTS: ${args.constraints.join(', ')}`
    : '';

  return {
    description: "Guide requirements gathering conversation",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are helping gather requirements for a ${projectType} project.

${stakeholdersText}
${constraintsText}

Guide the conversation to gather:
1. Functional Requirements - What the system must do
2. Non-Functional Requirements - Performance, security, usability
3. User Stories - From user perspective
4. Acceptance Criteria - How to verify requirements

Ask focused questions to uncover detailed requirements. Be thorough but conversational.`
        }
      }
    ]
  };
}

/**
 * Analyze and validate requirements
 */
export function generateRequirementsAnalysisPrompt(args: RequirementsPromptArgs): PromptResponse {
  const currentRequirements = args.currentRequirements || [];
  const requirementsText = currentRequirements.length > 0
    ? currentRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n')
    : 'No requirements provided.';
  const analysisType = args.analysisType || 'completeness and quality';

  return {
    description: "Analyze and validate requirements",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the following requirements for ${analysisType}:

CURRENT REQUIREMENTS:
${requirementsText}

ANALYSIS CRITERIA:
1. Completeness
   - Are all necessary requirements covered?
   - Are there any gaps or missing areas?
   - Do requirements cover all user scenarios?

2. Quality Assessment
   - Are requirements clear and unambiguous?
   - Are they testable and verifiable?
   - Are they realistic and achievable?

3. Consistency Check
   - Do requirements conflict with each other?
   - Are there any contradictions?
   - Is terminology used consistently?

4. Prioritization
   - Which requirements are critical vs. nice-to-have?
   - What are the dependencies between requirements?
   - What should be implemented first?

DELIVERABLES:
- Overall assessment of requirements quality
- Identified gaps and missing requirements
- Recommendations for improvement
- Suggested prioritization
- Risk assessment for unclear requirements

Provide a comprehensive analysis with actionable recommendations.`
        }
      }
    ]
  };
}

/**
 * Generate user stories from requirements
 */
export function generateUserStoriesPrompt(args: RequirementsPromptArgs): PromptResponse {
  const currentRequirements = args.currentRequirements || [];
  const requirementsText = currentRequirements.length > 0
    ? currentRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n')
    : 'No requirements provided.';
  const stakeholders = args.stakeholders || ['User'];

  return {
    description: "Generate user stories from requirements",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Convert the following requirements into well-formed user stories:

REQUIREMENTS:
${requirementsText}

STAKEHOLDERS: ${stakeholders.join(', ')}

USER STORY FORMAT:
As a [type of user], I want [some goal] so that [some reason/benefit].

ACCEPTANCE CRITERIA FORMAT:
Given [some context]
When [some action is taken]
Then [some outcome is expected]

REQUIREMENTS FOR EACH USER STORY:
1. Clear user persona (who)
2. Specific functionality (what)
3. Business value (why)
4. Detailed acceptance criteria
5. Priority level (High/Medium/Low)
6. Estimated effort (if possible)

ADDITIONAL ELEMENTS:
- Edge cases and error scenarios
- Non-functional requirements as stories
- Integration points with other systems
- Data requirements and validation rules

Generate comprehensive user stories that development teams can implement directly.`
        }
      }
    ]
  };
}

/**
 * Create requirements traceability matrix
 */
export function generateTraceabilityMatrixPrompt(args: RequirementsPromptArgs): PromptResponse {
  const currentRequirements = args.currentRequirements || [];
  const requirementsText = currentRequirements.length > 0
    ? currentRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n')
    : 'No requirements provided.';

  return {
    description: "Create requirements traceability matrix",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a requirements traceability matrix for the following requirements:

REQUIREMENTS:
${requirementsText}

TRACEABILITY MATRIX STRUCTURE:
1. Requirement ID - Unique identifier
2. Requirement Description - Clear statement
3. Source - Where requirement originated
4. Priority - Critical/High/Medium/Low
5. Status - Proposed/Approved/Implemented/Tested
6. Test Cases - How requirement will be verified
7. Dependencies - Related requirements
8. Implementation Notes - Technical considerations

MATRIX OBJECTIVES:
- Ensure all requirements are traceable
- Identify dependencies and relationships
- Support impact analysis for changes
- Enable verification and validation
- Facilitate project tracking

ADDITIONAL ANALYSIS:
- Requirements coverage assessment
- Dependency mapping
- Risk identification for high-impact requirements
- Recommendations for requirement management

Present the matrix in a clear, tabular format that can be used for project management and quality assurance.`
        }
      }
    ]
  };
}

/**
 * All requirements prompt generators
 */
export const requirementsPrompts = {
  'requirements-gathering': generateRequirementsGatheringPrompt,
  'requirements-analysis': generateRequirementsAnalysisPrompt,
  'user-stories': generateUserStoriesPrompt,
  'traceability-matrix': generateTraceabilityMatrixPrompt
} as const;

/**
 * Requirements prompt metadata
 */
export const requirementsPromptMetadata = [
  {
    name: "requirements-gathering",
    description: "Guide requirements gathering conversations",
    arguments: [
      { name: "projectType", description: "Type of project", required: false },
      { name: "stakeholders", description: "Array of stakeholder names", required: false },
      { name: "constraints", description: "Array of project constraints", required: false }
    ]
  },
  {
    name: "requirements-analysis",
    description: "Analyze and validate requirements",
    arguments: [
      { name: "currentRequirements", description: "Array of current requirements", required: false },
      { name: "analysisType", description: "Type of analysis to perform", required: false }
    ]
  },
  {
    name: "user-stories",
    description: "Generate user stories from requirements",
    arguments: [
      { name: "currentRequirements", description: "Array of requirements to convert", required: false },
      { name: "stakeholders", description: "Array of stakeholder types", required: false }
    ]
  },
  {
    name: "traceability-matrix",
    description: "Create requirements traceability matrix",
    arguments: [
      { name: "currentRequirements", description: "Array of requirements to trace", required: false }
    ]
  }
];
