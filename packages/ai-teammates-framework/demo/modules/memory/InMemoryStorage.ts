/**
 * Simple in-memory storage implementation for the POC
 * In production, this would be replaced with pgvector, Redis, etc.
 */

import type { 
  MemoryEntry, 
  MemoryStorage, 
  MemoryQuery, 
  MemorySearchResult,
  MemoryType 
} from './types.js';

// Simple text similarity function (for POC - would use embeddings in production)
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
};

// Check if memory matches query filters
const matchesQuery = (memory: MemoryEntry, query: MemoryQuery): boolean => {
  if (query.type && memory.type !== query.type) return false;
  if (query.importance && memory.importance !== query.importance) return false;
  if (query.tags && !query.tags.some(tag => memory.tags.includes(tag))) return false;
  
  return true;
};

export class InMemoryStorage implements MemoryStorage {
  private memories = new Map<string, MemoryEntry>();

  async store(memory: MemoryEntry): Promise<void> {
    this.memories.set(memory.id, memory);
  }

  async retrieve(id: string): Promise<MemoryEntry | null> {
    return this.memories.get(id) || null;
  }

  async search(query: MemoryQuery): Promise<readonly MemorySearchResult[]> {
    const results: MemorySearchResult[] = [];
    const limit = query.limit || 10;
    const minSimilarity = query.minSimilarity || 0.1;

    for (const memory of this.memories.values()) {
      // Apply filters
      if (!matchesQuery(memory, query)) continue;

      // Calculate similarity if text query provided
      let similarity = 1.0;
      let relevanceReason = 'Exact match';

      if (query.text) {
        similarity = calculateSimilarity(query.text, memory.content);
        if (similarity < minSimilarity) continue;
        
        relevanceReason = similarity > 0.7 
          ? 'High content similarity'
          : similarity > 0.3 
          ? 'Moderate content similarity'
          : 'Low content similarity';
      }

      results.push({
        memory,
        similarity,
        relevanceReason
      });
    }

    // Sort by similarity (highest first) and limit results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async list(type?: MemoryType): Promise<readonly MemoryEntry[]> {
    const memories = Array.from(this.memories.values());
    
    if (type) {
      return memories.filter(m => m.type === type);
    }
    
    return memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async delete(id: string): Promise<void> {
    this.memories.delete(id);
  }

  async clear(): Promise<void> {
    this.memories.clear();
  }

  // Utility methods for debugging
  getSize(): number {
    return this.memories.size;
  }

  getMemoryTypes(): Record<MemoryType, number> {
    const counts: Record<string, number> = {};
    
    for (const memory of this.memories.values()) {
      counts[memory.type] = (counts[memory.type] || 0) + 1;
    }
    
    return counts as Record<MemoryType, number>;
  }
}
