/**
 * Document Prompts
 * Specialized prompts for document refinement, editing, and enhancement
 */

import { PromptResponse } from './prompt-registry.js';

export interface DocumentPromptArgs {
  currentDocument?: string;
  newRequirements?: string[];
  changeType?: string;
  documentType?: string;
  targetAudience?: string;
}

/**
 * Refine existing documents with new requirements
 */
export function generateDocumentRefinementPrompt(args: DocumentPromptArgs): PromptResponse {
  const currentDocument = args.currentDocument || 'No document provided.';
  const newRequirements = args.newRequirements || [];
  const requirementsText = newRequirements.length > 0
    ? newRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n')
    : 'No new requirements specified.';

  return {
    description: "Refine existing document with new requirements",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please refine the following document by incorporating new requirements:

CURRENT DOCUMENT:
${currentDocument}

NEW REQUIREMENTS:
${requirementsText}

REFINEMENT TYPE: ${args.changeType || 'Update and enhance'}

Please update the document to include the new requirements while maintaining consistency with the existing content. Highlight the changes made.`
        }
      }
    ]
  };
}

/**
 * Enhance document quality and readability
 */
export function generateDocumentEnhancementPrompt(args: DocumentPromptArgs): PromptResponse {
  const currentDocument = args.currentDocument || 'No document provided.';
  const targetAudience = args.targetAudience || 'general business audience';

  return {
    description: "Enhance document quality and readability",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please enhance the following document for improved quality and readability:

CURRENT DOCUMENT:
${currentDocument}

TARGET AUDIENCE: ${targetAudience}

ENHANCEMENT OBJECTIVES:
1. Improve clarity and readability
2. Enhance professional presentation
3. Strengthen logical flow and structure
4. Add compelling language where appropriate
5. Ensure consistency in tone and style
6. Optimize for the target audience

SPECIFIC IMPROVEMENTS TO MAKE:
- Strengthen executive summary and key points
- Improve section transitions and flow
- Enhance data presentation and formatting
- Add compelling business language
- Ensure professional tone throughout
- Optimize for decision-maker consumption

Please provide the enhanced version with clear improvements while maintaining all original content and meaning.`
        }
      }
    ]
  };
}

/**
 * Convert document format or style
 */
export function generateDocumentConversionPrompt(args: DocumentPromptArgs): PromptResponse {
  const currentDocument = args.currentDocument || 'No document provided.';
  const documentType = args.documentType || 'professional report';
  const targetAudience = args.targetAudience || 'business stakeholders';

  return {
    description: "Convert document to different format or style",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please convert the following document to a ${documentType} format:

CURRENT DOCUMENT:
${currentDocument}

TARGET FORMAT: ${documentType}
TARGET AUDIENCE: ${targetAudience}

CONVERSION REQUIREMENTS:
1. Adapt content structure for the new format
2. Adjust language and tone for target audience
3. Reorganize information as appropriate
4. Maintain all key information and data
5. Enhance presentation for the new format
6. Add format-specific elements as needed

FORMAT-SPECIFIC GUIDELINES:
- Use appropriate headers and sections
- Include executive summary if needed
- Add visual elements descriptions where helpful
- Ensure professional formatting
- Optimize for the intended use case

Provide the converted document with clear structure and professional presentation.`
        }
      }
    ]
  };
}

/**
 * Generate document review and feedback
 */
export function generateDocumentReviewPrompt(args: DocumentPromptArgs): PromptResponse {
  const currentDocument = args.currentDocument || 'No document provided.';
  const documentType = args.documentType || 'business document';

  return {
    description: "Generate comprehensive document review and feedback",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please provide a comprehensive review of the following ${documentType}:

DOCUMENT TO REVIEW:
${currentDocument}

REVIEW CRITERIA:
1. Content Quality
   - Completeness of information
   - Accuracy and relevance
   - Logical flow and structure

2. Business Impact
   - Clarity of value proposition
   - Strength of business case
   - Persuasiveness for decision makers

3. Professional Presentation
   - Writing quality and clarity
   - Professional tone and style
   - Formatting and organization

4. Audience Appropriateness
   - Suitable for intended audience
   - Appropriate level of detail
   - Clear call to action

FEEDBACK FORMAT:
- Overall Assessment (1-10 rating)
- Strengths (what works well)
- Areas for Improvement (specific suggestions)
- Recommended Changes (prioritized list)
- Next Steps (actionable recommendations)

Provide constructive, actionable feedback that will help improve the document's effectiveness.`
        }
      }
    ]
  };
}

/**
 * All document prompt generators
 */
export const documentPrompts = {
  'document-refinement': generateDocumentRefinementPrompt,
  'document-enhancement': generateDocumentEnhancementPrompt,
  'document-conversion': generateDocumentConversionPrompt,
  'document-review': generateDocumentReviewPrompt
} as const;

/**
 * Document prompt metadata
 */
export const documentPromptMetadata = [
  {
    name: "document-refinement",
    description: "Refine existing documents with new requirements",
    arguments: [
      { name: "currentDocument", description: "Current document content", required: false },
      { name: "newRequirements", description: "Array of new requirements", required: false },
      { name: "changeType", description: "Type of changes to make", required: false }
    ]
  },
  {
    name: "document-enhancement",
    description: "Enhance document quality and readability",
    arguments: [
      { name: "currentDocument", description: "Current document content", required: false },
      { name: "targetAudience", description: "Target audience for the document", required: false }
    ]
  },
  {
    name: "document-conversion",
    description: "Convert document to different format or style",
    arguments: [
      { name: "currentDocument", description: "Current document content", required: false },
      { name: "documentType", description: "Target document type", required: false },
      { name: "targetAudience", description: "Target audience", required: false }
    ]
  },
  {
    name: "document-review",
    description: "Generate comprehensive document review and feedback",
    arguments: [
      { name: "currentDocument", description: "Document to review", required: false },
      { name: "documentType", description: "Type of document being reviewed", required: false }
    ]
  }
];
