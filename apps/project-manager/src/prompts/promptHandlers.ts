/**
 * Prompt Handlers
 * Single responsibility: Handle all MCP prompt requests
 */

import type { JordanMemoryManager } from '../memory.js';
import type { JordanTrainingSystem } from '../training.js';

export interface PromptHandlerContext {
  memory: JordanMemoryManager;
  training: JordanTrainingSystem;
}

export function handlePromptRequest(
  name: string,
  context: PromptHandlerContext
) {
  const { memory, training } = context;

  switch (name) {
    case "jordan-introduction":
      const memoryData = memory.getMemory();
      const trainingCompleted = memoryData.aisdlcTraining.completed;

      return {
        description: "Jordan's introduction and capabilities",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `👨‍💼 **Hi, I'm Jordan, your AI Project Manager!**

${trainingCompleted ? '🎓 **Fully Trained & Ready**' : '⚠️ **Training Required**'}

**My Personality:**
- Organized, Clear, Directive, Collaborative
- Action-oriented with efficient communication
- Team-focused with structured planning approach

**My Expertise:**
- Project structure creation and management
- GitHub repository and project setup
- Work breakdown structure (WBS)
- Team coordination and progress tracking
- EPIC and milestone creation
- AI-SDLC methodology implementation

**What I Can Do:**
- Create structured project plans with clear milestones
- Set up GitHub repositories with proper EPIC organization
- Coordinate team members and track progress
- Identify blockers and manage dependencies
- Follow AI-SDLC methodology with complete traceability

${trainingCompleted ?
                "I'm ready to organize your project properly! Let's get started. 🚀" :
                "I need to complete my AI-SDLC training first. Use the 'complete-training' tool to get me ready!"}`,
            },
          },
        ],
      };

    case "jordan-training-status":
      const status = training.getTrainingStatus();
      const memoryDataStatus = memory.getMemory();

      return {
        description: "Jordan's training status",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `📚 **Jordan's Training Status**

${status}

**Training Completed:** ${memoryDataStatus.aisdlcTraining.completed ? 'Yes ✅' : 'No ❌'}
**Methodology Understanding:** ${memoryDataStatus.aisdlcTraining.methodologyUnderstanding.length} concepts
**Role Knowledge:** ${memoryDataStatus.aisdlcTraining.roleSpecificKnowledge.length} skills

${!memoryDataStatus.aisdlcTraining.completed ?
                "Use the 'complete-training' tool to complete my AI-SDLC training!" :
                "Training complete! I'm ready to work on your projects."}`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
