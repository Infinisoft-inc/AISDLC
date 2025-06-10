/**
 * AI Team Configuration
 * Single responsibility: Define all AI teammates and their assignments
 */

export interface AITeammate {
  name: string;
  role: string;
  phases: string[];
  expertise: string[];
  color: string;
  icon: string;
}

export const AI_TEAMMATES: Record<string, AITeammate> = {
  'Sarah': {
    name: 'Sarah',
    role: 'AI Business Analyst',
    phases: ['1.1', '1.2'],
    expertise: [
      'Business case creation and validation',
      'Stakeholder analysis and requirements gathering',
      'Strategic questioning and problem identification',
      'Business impact assessment and ROI analysis'
    ],
    color: '#ff6b6b',
    icon: 'user'
  },
  'Alex': {
    name: 'Alex',
    role: 'AI Architect',
    phases: ['1.3'],
    expertise: [
      'System architecture design and validation',
      'Technical requirements analysis',
      'Technology stack selection and integration',
      'Scalability and performance planning'
    ],
    color: '#4ecdc4',
    icon: 'code'
  },
  'Jordan': {
    name: 'Jordan',
    role: 'AI Project Manager',
    phases: ['1.4', '2.3'],
    expertise: [
      'Project structure creation and management',
      'GitHub repository and project setup',
      'Work breakdown structure (WBS)',
      'Team coordination and progress tracking'
    ],
    color: '#45b7d1',
    icon: 'project-diagram'
  },
  'Taylor': {
    name: 'Taylor',
    role: 'AI Functional Analyst',
    phases: ['2.1'],
    expertise: [
      'Functional requirements specification',
      'Detailed technical design',
      'Database and UI design',
      'Acceptance criteria definition'
    ],
    color: '#96ceb4',
    icon: 'search'
  },
  'Casey': {
    name: 'Casey',
    role: 'AI Lead Developer',
    phases: ['2.2'],
    expertise: [
      'Implementation planning and strategy',
      'Task breakdown and dependencies',
      'Technical architecture decisions',
      'Development workflow design'
    ],
    color: '#feca57',
    icon: 'terminal'
  },
  'Mike': {
    name: 'Mike',
    role: 'AI Developer',
    phases: ['2.4'],
    expertise: [
      'Code development and implementation',
      'Testing and quality assurance',
      'Debugging and problem-solving',
      'Code review and optimization'
    ],
    color: '#ff9ff3',
    icon: 'code'
  },
  'Riley': {
    name: 'Riley',
    role: 'AI Frontend Developer',
    phases: ['2.4'],
    expertise: [
      'HTML5, CSS3, JavaScript ES6+',
      'Responsive Design & Mobile-First Development',
      'Performance Optimization & SEO',
      'Modern Web Standards & Accessibility'
    ],
    color: '#54a0ff',
    icon: 'html5'
  },
  'Sam': {
    name: 'Sam',
    role: 'AI QA Engineer',
    phases: ['3.1'],
    expertise: [
      'Pull request review and analysis',
      'Quality assurance and testing',
      'Acceptance criteria validation',
      'Code quality assessment'
    ],
    color: '#5f27cd',
    icon: 'check'
  },
  'Morgan': {
    name: 'Morgan',
    role: 'AI DevOps Engineer',
    phases: ['3.2'],
    expertise: [
      'Deployment automation and CI/CD',
      'Infrastructure management',
      'Monitoring and reliability',
      'Performance optimization'
    ],
    color: '#2d3436',
    icon: 'server'
  }
};

export const AI_TEAMMATE_OPTIONS = Object.keys(AI_TEAMMATES).map(key => ({
  value: `${AI_TEAMMATES[key].name} - ${AI_TEAMMATES[key].role}`,
  label: `${AI_TEAMMATES[key].name} - ${AI_TEAMMATES[key].role}`,
  teammate: AI_TEAMMATES[key]
}));

/**
 * Get AI teammate by name
 */
export function getAITeammate(name: string): AITeammate | undefined {
  return AI_TEAMMATES[name];
}

/**
 * Get AI teammates for a specific phase
 */
export function getAITeammatesForPhase(phase: string): AITeammate[] {
  return Object.values(AI_TEAMMATES).filter(teammate => 
    teammate.phases.includes(phase)
  );
}

/**
 * Get all AI teammate assignment options for GitHub project fields
 */
export function getAITeammateFieldOptions(): string[] {
  return AI_TEAMMATE_OPTIONS.map(option => option.value);
}

/**
 * Create AI teammate assignment text for issues
 */
export function createAITeammateAssignment(teammateName: string): string {
  const teammate = getAITeammate(teammateName);
  if (!teammate) return '';
  
  return `**🤖 AI Teammate:** ${teammate.name} - ${teammate.role}
**📋 Expertise:** ${teammate.expertise.join(', ')}
**🎯 Phases:** ${teammate.phases.join(', ')}`;
}
