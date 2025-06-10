/**
 * Document Templates - Configuration
 * Sarah-specific templates for business analysis
 */

export interface Template {
  name: string;
  sections: string[];
  prompt: string;
}

export const SARAH_TEMPLATES: Template[] = [
  {
    name: 'business-case',
    sections: [
      'Problem Definition - What specific problem are we solving?',
      'Stakeholders - Who are the key people affected?',
      'Business Impact - What\'s the cost of not solving this?',
      'Proposed Solution - What\'s the high-level approach?',
      'Success Criteria - How will we measure success?',
      'ROI - What\'s the expected return on investment?',
      'Timeline - What\'s the expected timeline?',
      'Risks - What are the potential risks?'
    ],
    prompt: 'Create a comprehensive business case that justifies the project investment.'
  },
  {
    name: 'requirements',
    sections: [
      'Functional Requirements - What the system must do',
      'Non-Functional Requirements - Performance, security, usability',
      'User Stories - From user perspective',
      'Acceptance Criteria - How to verify requirements'
    ],
    prompt: 'Create a detailed requirements document that clearly defines what needs to be built.'
  },
  {
    name: 'architecture',
    sections: [
      'System Overview - High-level architecture',
      'Components - Major system components',
      'Data Flow - How data moves through the system',
      'Technology Stack - Technologies and frameworks'
    ],
    prompt: 'Create a comprehensive architecture document that guides technical implementation.'
  }
];
