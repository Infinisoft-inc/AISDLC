/**
 * Reflection Engine - Processes learned content and extracts insights
 * For POC: Uses simple pattern matching. In production: Would use LLM calls
 */

import type { MemoryManager } from '../memory/index.js';
import type { 
  ReflectionEngine as IReflectionEngine,
  ReflectionInput,
  ReflectionResult,
  ExtractedInsight
} from './types.js';
import type { TrainingMemory } from '../memory/types.js';

// Simple rule extraction patterns (POC implementation)
const RULE_PATTERNS = [
  {
    pattern: /if.*more than (\d+) days.*no refund/i,
    type: 'rule' as const,
    category: 'time-limit'
  },
  {
    pattern: /damaged.*warranty.*refund/i,
    type: 'rule' as const,
    category: 'damaged-goods'
  },
  {
    pattern: /unsure.*escalate/i,
    type: 'rule' as const,
    category: 'escalation'
  },
  {
    pattern: /vip.*exception/i,
    type: 'exception' as const,
    category: 'vip-treatment'
  }
];

export class ReflectionEngine implements IReflectionEngine {
  constructor(private memoryManager: MemoryManager) {}

  async reflect(input: ReflectionInput): Promise<ReflectionResult> {
    console.log(`\n🤔 Starting reflection process...`);
    console.log(`📚 Analyzing ${input.trainingMemories.length} training memories\n`);

    // Extract insights from training memories
    const insights = this.extractInsights(input.trainingMemories);
    
    // Generate rules from insights
    const extractedRules = insights
      .filter(insight => insight.type === 'rule' || insight.type === 'exception')
      .map(insight => insight.content);

    // Calculate overall confidence
    const overallConfidence = this.calculateConfidence(insights);

    // Generate summary
    const summary = await this.generateSummary(input.trainingMemories);

    // Generate recommendations
    const recommendations = this.generateRecommendations(insights, overallConfidence);

    // Store reflection in memory
    const memoryId = await this.memoryManager.storeReflection(
      insights.map(i => i.content),
      extractedRules,
      overallConfidence
    );

    console.log(`✅ Reflection completed!`);
    console.log(`💡 Insights extracted: ${insights.length}`);
    console.log(`📋 Rules identified: ${extractedRules.length}`);
    console.log(`🎯 Confidence level: ${Math.round(overallConfidence * 100)}%\n`);

    return {
      insights,
      extractedRules,
      overallConfidence,
      summary,
      recommendations,
      memoryId
    };
  }

  async generateSummary(memories: readonly TrainingMemory[]): Promise<string> {
    const ruleCount = memories.filter(m => m.isRule).length;
    const totalCount = memories.length;
    
    const categories = new Set(
      memories
        .map(m => m.metadata.category as string)
        .filter(Boolean)
    );

    return `Learned ${ruleCount} rules from ${totalCount} training interactions. ` +
           `Covered ${categories.size} policy categories: ${Array.from(categories).join(', ')}. ` +
           `Ready to apply this knowledge to customer scenarios.`;
  }

  async extractRules(memories: readonly TrainingMemory[]): Promise<readonly string[]> {
    return memories
      .filter(m => m.isRule)
      .map(m => m.content);
  }

  calculateConfidence(insights: readonly ExtractedInsight[]): number {
    if (insights.length === 0) return 0;
    
    const totalConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0);
    return totalConfidence / insights.length;
  }

  private extractInsights(memories: readonly TrainingMemory[]): ExtractedInsight[] {
    const insights: ExtractedInsight[] = [];

    for (const memory of memories) {
      // Try to match against known patterns
      for (const pattern of RULE_PATTERNS) {
        if (pattern.pattern.test(memory.content)) {
          insights.push({
            type: pattern.type,
            content: this.normalizeRule(memory.content),
            confidence: 0.8, // High confidence for pattern matches
            supportingMemories: [memory.id],
            category: pattern.category
          });
          break; // Only match first pattern
        }
      }

      // If no pattern matched but it's marked as a rule, add it anyway
      if (memory.isRule && !insights.some(i => i.supportingMemories.includes(memory.id))) {
        insights.push({
          type: memory.ruleCategory === 'exception' ? 'exception' : 'rule',
          content: this.normalizeRule(memory.content),
          confidence: 0.6, // Lower confidence for unmatched rules
          supportingMemories: [memory.id],
          category: memory.ruleCategory
        });
      }
    }

    return insights;
  }

  private normalizeRule(content: string): string {
    // Simple normalization - remove extra whitespace, ensure proper capitalization
    return content.trim().replace(/\s+/g, ' ');
  }

  private generateRecommendations(
    insights: readonly ExtractedInsight[], 
    confidence: number
  ): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.5) {
      recommendations.push('Consider additional training to improve confidence');
    }

    if (insights.length < 3) {
      recommendations.push('Learn more rules to handle diverse scenarios');
    }

    const hasEscalationRule = insights.some(i => i.category === 'escalation');
    if (!hasEscalationRule) {
      recommendations.push('Add escalation procedures for uncertain cases');
    }

    if (recommendations.length === 0) {
      recommendations.push('Knowledge base looks solid - ready for real scenarios');
    }

    return recommendations;
  }
}

// Factory function
export const createReflectionEngine = (memoryManager: MemoryManager): ReflectionEngine => {
  return new ReflectionEngine(memoryManager);
};
