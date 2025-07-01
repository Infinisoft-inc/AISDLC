/**
 * Training Session Runner - Handles conversation-based teaching
 */

import type { AgentState } from './agent.js';
import type { MemoryManager } from './modules/memory/index.js';
import type { TrainingSession, TrainingMessage } from './examples/training-data.js';

// Training session result
export interface TrainingResult {
  readonly sessionId: string;
  readonly messagesProcessed: number;
  readonly rulesLearned: number;
  readonly memoryIds: readonly string[];
  readonly summary: string;
  readonly updatedState: AgentState;
}

// Training session processor
export class TrainingSessionRunner {
  constructor(
    private memoryManager: MemoryManager,
    private agentState: AgentState
  ) {}

  async runTrainingSession(session: TrainingSession): Promise<TrainingResult> {
    console.log(`\n🎓 Starting training session: ${session.title}`);
    console.log(`📝 Description: ${session.description}\n`);

    const memoryIds: string[] = [];
    let rulesLearned = 0;
    let messagesProcessed = 0;

    // Process each message in the session
    for (const message of session.messages) {
      await this.processMessage(message);
      messagesProcessed++;

      // Store teaching messages as training memories
      if (message.isTeaching && message.speaker === 'human') {
        const memoryId = await this.storeTrainingMessage(message);
        memoryIds.push(memoryId);
        
        if (message.ruleType === 'policy' || message.ruleType === 'exception') {
          rulesLearned++;
        }
      }

      // Store agent responses as conversation memories
      if (message.speaker === 'agent') {
        await this.memoryManager.storeConversation(
          `Agent response: ${message.content}`,
          'medium'
        );
      }
    }

    // Update agent state
    const updatedState = await this.updateAgentState(session, rulesLearned);

    const summary = this.generateSessionSummary(session, rulesLearned, messagesProcessed);

    console.log(`\n✅ Training session completed!`);
    console.log(`📊 Messages processed: ${messagesProcessed}`);
    console.log(`🧠 Rules learned: ${rulesLearned}`);
    console.log(`💾 Memories stored: ${memoryIds.length}\n`);

    return {
      sessionId: session.sessionId,
      messagesProcessed,
      rulesLearned,
      memoryIds,
      summary,
      updatedState
    };
  }

  private async processMessage(message: TrainingMessage): Promise<void> {
    const speaker = message.speaker === 'human' ? '👨‍🏫 Human' : '🤖 Kai';
    console.log(`${speaker}: ${message.content}`);
    
    if (message.isTeaching) {
      console.log(`   📚 [TEACHING: ${message.ruleType}]`);
    }
  }

  private async storeTrainingMessage(message: TrainingMessage): Promise<string> {
    const isRule = message.ruleType === 'policy' || message.ruleType === 'exception';
    
    return this.memoryManager.storeTraining(
      message.content,
      isRule,
      {
        ruleType: message.ruleType,
        category: message.metadata?.category,
        ...message.metadata
      }
    );
  }

  private async updateAgentState(
    session: TrainingSession, 
    rulesLearned: number
  ): Promise<AgentState> {
    const memoryCount = await this.memoryManager.getMemoryCount();
    const newRules = this.extractRulesFromSession(session);
    
    return {
      ...this.agentState,
      memoryCount,
      lastInteraction: new Date(),
      learnedRules: [...this.agentState.learnedRules, ...newRules],
      confidence: Math.min(1.0, this.agentState.confidence + (rulesLearned * 0.2))
    };
  }

  private extractRulesFromSession(session: TrainingSession): string[] {
    return session.messages
      .filter(m => m.isTeaching && (m.ruleType === 'policy' || m.ruleType === 'exception'))
      .map(m => m.content);
  }

  private generateSessionSummary(
    session: TrainingSession, 
    rulesLearned: number, 
    messagesProcessed: number
  ): string {
    return `Training session "${session.title}" completed. ` +
           `Processed ${messagesProcessed} messages and learned ${rulesLearned} rules. ` +
           `Agent is now more knowledgeable about refund policies.`;
  }
}

// Factory function
export const createTrainingSessionRunner = (
  memoryManager: MemoryManager,
  agentState: AgentState
): TrainingSessionRunner => {
  return new TrainingSessionRunner(memoryManager, agentState);
};

// Utility function to run multiple sessions
export const runMultipleTrainingSessions = async (
  sessions: readonly TrainingSession[],
  memoryManager: MemoryManager,
  initialState: AgentState
): Promise<{
  results: readonly TrainingResult[];
  finalState: AgentState;
}> => {
  const results: TrainingResult[] = [];
  let currentState = initialState;

  for (const session of sessions) {
    const runner = createTrainingSessionRunner(memoryManager, currentState);
    const result = await runner.runTrainingSession(session);
    results.push(result);
    currentState = result.updatedState;
  }

  return {
    results,
    finalState: currentState
  };
};
