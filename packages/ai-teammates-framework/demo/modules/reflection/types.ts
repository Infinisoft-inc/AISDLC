/**
 * Reflection engine types
 */

import type { TrainingMemory, ReflectionMemory } from '../memory/types.js';

// Reflection input
export interface ReflectionInput {
  readonly trainingMemories: readonly TrainingMemory[];
  readonly agentIdentity: {
    readonly name: string;
    readonly role: string;
    readonly mission: string;
  };
  readonly context?: string;
}

// Extracted insight
export interface ExtractedInsight {
  readonly type: 'rule' | 'principle' | 'exception' | 'pattern';
  readonly content: string;
  readonly confidence: number;
  readonly supportingMemories: readonly string[]; // memory IDs
  readonly category?: string;
}

// Reflection result
export interface ReflectionResult {
  readonly insights: readonly ExtractedInsight[];
  readonly extractedRules: readonly string[];
  readonly overallConfidence: number;
  readonly summary: string;
  readonly recommendations: readonly string[];
  readonly memoryId: string; // ID of stored reflection memory
}

// Reflection engine interface
export interface ReflectionEngine {
  reflect(input: ReflectionInput): Promise<ReflectionResult>;
  generateSummary(memories: readonly TrainingMemory[]): Promise<string>;
  extractRules(memories: readonly TrainingMemory[]): Promise<readonly string[]>;
  calculateConfidence(insights: readonly ExtractedInsight[]): number;
}
