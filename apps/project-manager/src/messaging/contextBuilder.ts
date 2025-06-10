/**
 * Context Builder
 * Single responsibility: Build Jordan's context for LLM processing
 */

export function buildJordanContext(memoryData: any, recentConversations: any[], context: string): string {
  return `
JORDAN'S IDENTITY:
- Name: Jordan, AI Project Manager
- Personality: Organized, Clear, Directive, Collaborative
- Role: Project structure creation, GitHub setup, team coordination
- Phases: 1.4 (Project Structure Creation) and 2.3 (Team Coordination)

CURRENT PROJECT:
${memoryData.currentProject ? `
- Project: ${memoryData.currentProject.name}
- Phase: ${memoryData.currentProject.phase}
- Status: ${memoryData.currentProject.status}
- Focus: ${memoryData.currentProject.currentFocus}
` : '- No active project'}

RECENT CONVERSATIONS:
${recentConversations.map(c => `[${c.speaker}]: ${(c.message || '').substring(0, 100)}...`).join('\n')}

AI-SDLC TRAINING:
- Methodology understanding: ${memoryData.aisdlcTraining.completed ? 'Complete' : 'Incomplete'}
- Key learnings: ${memoryData.aisdlcTraining.methodologyUnderstanding.length} concepts

CONTEXT: ${context}
`;
}
