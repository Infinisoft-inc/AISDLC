/**
 * Memory system types for the learning POC
 */

// Memory entry types
export type MemoryType = 'training' | 'conversation' | 'reflection' | 'rule' | 'experience';

export type MemoryImportance = 'low' | 'medium' | 'high' | 'critical';

// Base memory entry
export interface MemoryEntry {
  readonly id: string;
  readonly type: MemoryType;
  readonly content: string;
  readonly timestamp: Date;
  readonly importance: MemoryImportance;
  readonly tags: readonly string[];
  readonly metadata: Record<string, unknown>;
}

// Training-specific memory
export interface TrainingMemory extends MemoryEntry {
  readonly type: 'training';
  readonly isRule: boolean;
  readonly ruleCategory?: string;
  readonly examples?: readonly string[];
}

// Reflection-specific memory
export interface ReflectionMemory extends MemoryEntry {
  readonly type: 'reflection';
  readonly insights: readonly string[];
  readonly extractedRules: readonly string[];
  readonly confidence: number;
}

// Memory search query
export interface MemoryQuery {
  readonly text?: string;
  readonly type?: MemoryType;
  readonly importance?: MemoryImportance;
  readonly tags?: readonly string[];
  readonly limit?: number;
  readonly minSimilarity?: number;
}

// Memory search result
export interface MemorySearchResult {
  readonly memory: MemoryEntry;
  readonly similarity: number;
  readonly relevanceReason: string;
}

// Memory storage interface
export interface MemoryStorage {
  store(memory: MemoryEntry): Promise<void>;
  retrieve(id: string): Promise<MemoryEntry | null>;
  search(query: MemoryQuery): Promise<readonly MemorySearchResult[]>;
  list(type?: MemoryType): Promise<readonly MemoryEntry[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

// Memory manager interface
export interface MemoryManager {
  storeTraining(content: string, isRule: boolean, metadata?: Record<string, unknown>): Promise<string>;
  storeReflection(insights: readonly string[], rules: readonly string[], confidence: number): Promise<string>;
  storeConversation(content: string, importance?: MemoryImportance): Promise<string>;
  searchRelevant(query: string, limit?: number): Promise<readonly MemorySearchResult[]>;
  getTrainingMemories(): Promise<readonly TrainingMemory[]>;
  getReflections(): Promise<readonly ReflectionMemory[]>;
  getMemoryCount(): Promise<number>;
  clear(): Promise<void>;
}
