/**
 * Document Templates - Configuration
 * Alex-specific templates for system architecture
 */

export interface Template {
  name: string;
  sections: string[];
  prompt: string;
}

export const ALEX_TEMPLATES: Template[] = [
  {
    name: 'system-architecture',
    sections: [
      'Architecture Overview - High-level system design and principles',
      'System Components - Core modules, services, and their responsibilities',
      'Data Architecture - Data models, storage, and flow patterns',
      'Integration Patterns - APIs, messaging, and external system connections',
      'Security Architecture - Authentication, authorization, and data protection',
      'Scalability Design - Performance considerations and scaling strategies',
      'Technology Stack - Frameworks, libraries, and infrastructure choices',
      'Deployment Architecture - Environment setup and deployment patterns'
    ],
    prompt: 'Create a comprehensive system architecture document that provides technical guidance for development teams.'
  },
  {
    name: 'technical-specification',
    sections: [
      'Technical Requirements - Detailed technical constraints and specifications',
      'API Design - Interface definitions and data contracts',
      'Database Design - Schema, relationships, and data access patterns',
      'Service Architecture - Microservices, modules, and communication patterns',
      'Error Handling - Exception management and recovery strategies',
      'Performance Requirements - Response times, throughput, and resource usage',
      'Security Specifications - Technical security implementation details',
      'Testing Strategy - Unit, integration, and system testing approaches'
    ],
    prompt: 'Create detailed technical specifications that guide implementation and ensure quality standards.'
  },
  {
    name: 'solution-design',
    sections: [
      'Solution Overview - High-level approach to solving the business problem',
      'Architecture Patterns - Design patterns and architectural styles used',
      'Component Interaction - How different parts of the system work together',
      'Data Flow Diagrams - Visual representation of data movement',
      'Infrastructure Requirements - Hardware, cloud services, and networking needs',
      'Development Guidelines - Coding standards and best practices',
      'Monitoring and Observability - Logging, metrics, and health checks',
      'Maintenance and Support - Operational considerations and support procedures'
    ],
    prompt: 'Create a solution design document that bridges business requirements with technical implementation.'
  }
];
