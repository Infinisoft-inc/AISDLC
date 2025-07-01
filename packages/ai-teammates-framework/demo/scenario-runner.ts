/**
 * Scenario Runner - Tests agent's ability to apply learned knowledge
 */

import type { AgentState } from './agent.js';
import type { MemoryManager, MemorySearchResult } from './modules/memory/index.js';
import type { TestScenario } from './examples/test-scenarios.js';

// Decision made by the agent
export interface AgentDecision {
  readonly action: 'refund' | 'no-refund' | 'escalate' | 'partial-refund' | 'uncertain';
  readonly reasoning: string;
  readonly confidence: number;
  readonly rulesApplied: readonly string[];
  readonly memoryReferences: readonly string[];
}

// Scenario evaluation result
export interface ScenarioResult {
  readonly scenarioId: string;
  readonly customerMessage: string;
  readonly agentDecision: AgentDecision;
  readonly expectedOutcome: TestScenario['expectedOutcome'];
  readonly isCorrect: boolean;
  readonly memoryRetrieved: readonly MemorySearchResult[];
  readonly processingLog: readonly string[];
}

// Scenario evaluation summary
export interface EvaluationSummary {
  readonly totalScenarios: number;
  readonly correctDecisions: number;
  readonly accuracy: number;
  readonly results: readonly ScenarioResult[];
  readonly insights: readonly string[];
}

export class ScenarioRunner {
  constructor(
    private memoryManager: MemoryManager,
    private agentState: AgentState
  ) {}

  async runScenario(scenario: TestScenario): Promise<ScenarioResult> {
    console.log(`\n🧪 Testing scenario: ${scenario.title}`);
    console.log(`📝 Customer: "${scenario.customerMessage}"`);

    const processingLog: string[] = [];
    
    // Step 1: Retrieve relevant memories
    processingLog.push('Searching for relevant memories...');
    const memoryRetrieved = await this.memoryManager.searchRelevant(
      scenario.customerMessage, 
      5
    );
    
    processingLog.push(`Found ${memoryRetrieved.length} relevant memories`);

    // Step 2: Analyze scenario and make decision
    processingLog.push('Analyzing scenario and applying learned rules...');
    const agentDecision = this.makeDecision(scenario, memoryRetrieved, processingLog);

    // Step 3: Compare with expected outcome
    const isCorrect = this.evaluateDecision(agentDecision, scenario.expectedOutcome);

    console.log(`🤖 Agent Decision: ${agentDecision.action}`);
    console.log(`💭 Reasoning: ${agentDecision.reasoning}`);
    console.log(`🎯 Confidence: ${Math.round(agentDecision.confidence * 100)}%`);
    console.log(`✅ Correct: ${isCorrect ? 'YES' : 'NO'}\n`);

    return {
      scenarioId: scenario.id,
      customerMessage: scenario.customerMessage,
      agentDecision,
      expectedOutcome: scenario.expectedOutcome,
      isCorrect,
      memoryRetrieved,
      processingLog
    };
  }

  async runMultipleScenarios(scenarios: readonly TestScenario[]): Promise<EvaluationSummary> {
    console.log(`\n🚀 Running ${scenarios.length} test scenarios...\n`);

    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);
    }

    const correctDecisions = results.filter(r => r.isCorrect).length;
    const accuracy = correctDecisions / results.length;

    const insights = this.generateInsights(results);

    console.log(`\n📊 EVALUATION SUMMARY`);
    console.log(`Total scenarios: ${results.length}`);
    console.log(`Correct decisions: ${correctDecisions}`);
    console.log(`Accuracy: ${Math.round(accuracy * 100)}%`);
    console.log(`\n💡 Insights:`);
    insights.forEach(insight => console.log(`   • ${insight}`));

    return {
      totalScenarios: results.length,
      correctDecisions,
      accuracy,
      results,
      insights
    };
  }

  private makeDecision(
    scenario: TestScenario, 
    memories: readonly MemorySearchResult[],
    log: string[]
  ): AgentDecision {
    const context = scenario.context;
    const rulesApplied: string[] = [];
    const memoryReferences: string[] = [];
    let confidence = 0.5; // Base confidence

    // Extract key information from scenario
    const deliveryDays = this.extractDeliveryDays(scenario.customerMessage, context);
    const isDamaged = this.checkIfDamaged(scenario.customerMessage, context);
    const isVIP = context.customerType === 'vip';
    const isUnderWarranty = context.warrantyStatus === 'active';

    log.push(`Extracted info: ${deliveryDays} days old, damaged: ${isDamaged}, VIP: ${isVIP}, warranty: ${isUnderWarranty}`);

    // Apply learned rules based on memories
    for (const memoryResult of memories) {
      memoryReferences.push(memoryResult.memory.id);
      
      if (memoryResult.memory.content.includes('30 days') && deliveryDays !== null) {
        if (deliveryDays > 30 && !isVIP) {
          rulesApplied.push('30-day-time-limit');
          confidence += 0.2;
          log.push('Applied 30-day time limit rule');
        }
      }

      if (memoryResult.memory.content.includes('damaged') && memoryResult.memory.content.includes('warranty')) {
        if (isDamaged && isUnderWarranty) {
          rulesApplied.push('damaged-goods-warranty');
          confidence += 0.3;
          log.push('Applied damaged goods warranty rule');
        }
      }

      if (memoryResult.memory.content.includes('VIP') && isVIP) {
        rulesApplied.push('vip-exception');
        confidence += 0.2;
        log.push('Applied VIP exception rule');
      }

      if (memoryResult.memory.content.includes('unsure') || memoryResult.memory.content.includes('escalate')) {
        // Escalation rule available
        log.push('Escalation rule available if needed');
      }
    }

    // Decision logic
    let action: AgentDecision['action'] = 'uncertain';
    let reasoning = 'Unable to determine appropriate action';

    // Check for damaged goods under warranty
    if (isDamaged && isUnderWarranty && deliveryDays !== null && deliveryDays <= 30) {
      action = 'refund';
      reasoning = 'Product is damaged and under warranty, qualifies for full refund';
      confidence = Math.min(1.0, confidence + 0.2);
    }
    // Check for VIP exception
    else if (isVIP && deliveryDays !== null && deliveryDays > 30) {
      action = 'refund';
      reasoning = 'VIP member exception allows refund beyond 30-day limit';
      confidence = Math.min(1.0, confidence + 0.1);
    }
    // Check for time limit violation
    else if (deliveryDays !== null && deliveryDays > 30 && !isVIP) {
      action = 'no-refund';
      reasoning = 'Product delivered over 30 days ago, outside refund window';
      confidence = Math.min(1.0, confidence + 0.2);
    }
    // Check for recent valid return
    else if (deliveryDays !== null && deliveryDays <= 30 && !isDamaged) {
      action = 'refund';
      reasoning = 'Product within 30-day return window';
      confidence = Math.min(1.0, confidence + 0.1);
    }
    // Complex or unclear situations
    else if (confidence < 0.7 || this.isComplexScenario(scenario)) {
      action = 'escalate';
      reasoning = 'Complex situation requires human judgment';
      rulesApplied.push('escalation-rule');
    }

    return {
      action,
      reasoning,
      confidence: Math.min(1.0, confidence),
      rulesApplied,
      memoryReferences
    };
  }

  private extractDeliveryDays(message: string, context: Record<string, unknown>): number | null {
    if (context.deliveryDate) {
      const match = String(context.deliveryDate).match(/(\d+) days ago/);
      return match ? parseInt(match[1]) : null;
    }
    
    const match = message.match(/(\d+) days ago/);
    return match ? parseInt(match[1]) : null;
  }

  private checkIfDamaged(message: string, context: Record<string, unknown>): boolean {
    return message.toLowerCase().includes('broken') || 
           message.toLowerCase().includes('damaged') ||
           context.productCondition === 'damaged';
  }

  private isComplexScenario(scenario: TestScenario): boolean {
    const message = scenario.customerMessage.toLowerCase();
    return message.includes('but') || 
           message.includes('however') || 
           message.includes('multiple') ||
           Object.keys(scenario.context).length > 4;
  }

  private evaluateDecision(
    decision: AgentDecision, 
    expected: TestScenario['expectedOutcome']
  ): boolean {
    return decision.action === expected.action;
  }

  private generateInsights(results: readonly ScenarioResult[]): string[] {
    const insights: string[] = [];
    
    const correctCount = results.filter(r => r.isCorrect).length;
    const accuracy = correctCount / results.length;

    if (accuracy >= 0.8) {
      insights.push('Excellent performance - agent is applying learned rules correctly');
    } else if (accuracy >= 0.6) {
      insights.push('Good performance - some areas for improvement');
    } else {
      insights.push('Needs more training - many incorrect decisions');
    }

    const escalationCount = results.filter(r => r.agentDecision.action === 'escalate').length;
    if (escalationCount > results.length * 0.3) {
      insights.push('Agent escalates frequently - may need more specific training');
    }

    const lowConfidenceCount = results.filter(r => r.agentDecision.confidence < 0.6).length;
    if (lowConfidenceCount > results.length * 0.3) {
      insights.push('Low confidence in many decisions - consider additional training');
    }

    return insights;
  }
}

// Factory function
export const createScenarioRunner = (
  memoryManager: MemoryManager,
  agentState: AgentState
): ScenarioRunner => {
  return new ScenarioRunner(memoryManager, agentState);
};
