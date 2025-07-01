/**
 * Memory Manager - Core memory operations for the learning POC
 */

import { randomUUID } from 'crypto';
import type { 
  MemoryManager as IMemoryManager,
  MemoryEntry,
  TrainingMemory,
  ReflectionMemory,
  MemoryStorage,
  MemorySearchResult,
  MemoryImportance
} from './types.js';
import { InMemoryStorage } from './InMemoryStorage.js';

// Create memory entry helper
const createMemoryEntry = (
  type: MemoryEntry['type'],
  content: string,
  importance: MemoryImportance = 'medium',
  tags: readonly string[] = [],
  metadata: Record<string, unknown> = {}
): MemoryEntry => ({
  id: randomUUID(),
  type,
  content,
  timestamp: new Date(),
  importance,
  tags,
  metadata
});

export class MemoryManager implements IMemoryManager {
  constructor(private storage: MemoryStorage = new InMemoryStorage()) {}

  async storeTraining(
    content: string, 
    isRule: boolean, 
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    const baseMemory = createMemoryEntry('training', content, 'high', ['training', 'policy'], metadata);
    const trainingMemory: TrainingMemory = {
      ...baseMemory,
      type: 'training' as const,
      isRule,
      ruleCategory: isRule ? metadata.category as string : undefined,
      examples: metadata.examples as readonly string[]
    };

    await this.storage.store(trainingMemory);
    return trainingMemory.id;
  }

  async storeReflection(
    insights: readonly string[], 
    rules: readonly string[], 
    confidence: number
  ): Promise<string> {
    const baseMemory = createMemoryEntry(
      'reflection',
      `Reflection: ${insights.join('; ')}`,
      'critical',
      ['reflection', 'learning']
    );
    const reflectionMemory: ReflectionMemory = {
      ...baseMemory,
      type: 'reflection' as const,
      insights,
      extractedRules: rules,
      confidence
    };

    await this.storage.store(reflectionMemory);
    return reflectionMemory.id;
  }

  async storeConversation(
    content: string, 
    importance: MemoryImportance = 'medium'
  ): Promise<string> {
    const conversationMemory = createMemoryEntry(
      'conversation', 
      content, 
      importance, 
      ['conversation']
    );

    await this.storage.store(conversationMemory);
    return conversationMemory.id;
  }

  async searchRelevant(query: string, limit = 5): Promise<readonly MemorySearchResult[]> {
    return this.storage.search({
      text: query,
      limit,
      minSimilarity: 0.1
    });
  }

  async getTrainingMemories(): Promise<readonly TrainingMemory[]> {
    const memories = await this.storage.list('training');
    return memories as readonly TrainingMemory[];
  }

  async getReflections(): Promise<readonly ReflectionMemory[]> {
    const memories = await this.storage.list('reflection');
    return memories as readonly ReflectionMemory[];
  }

  async getMemoryCount(): Promise<number> {
    const allMemories = await this.storage.list();
    return allMemories.length;
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  // Additional utility methods for the POC
  async getMemoriesByType(type: MemoryEntry['type']): Promise<readonly MemoryEntry[]> {
    return this.storage.list(type);
  }

  async getRecentMemories(limit = 10): Promise<readonly MemoryEntry[]> {
    const allMemories = await this.storage.list();
    return allMemories.slice(0, limit);
  }

  async searchByTags(tags: readonly string[]): Promise<readonly MemorySearchResult[]> {
    return this.storage.search({
      tags,
      limit: 20
    });
  }

  // Debug helpers
  async getMemoryStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byImportance: Record<string, number>;
  }> {
    const allMemories = await this.storage.list();
    
    const byType: Record<string, number> = {};
    const byImportance: Record<string, number> = {};
    
    for (const memory of allMemories) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      byImportance[memory.importance] = (byImportance[memory.importance] || 0) + 1;
    }
    
    return {
      total: allMemories.length,
      byType,
      byImportance
    };
  }
}

// Factory function for easy creation
export const createMemoryManager = (storage?: MemoryStorage): MemoryManager => {
  return new MemoryManager(storage);
};
