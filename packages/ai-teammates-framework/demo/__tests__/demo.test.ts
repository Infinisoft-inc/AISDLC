/**
 * Demo POC Tests - Validate memory-based learning functionality
 */

import { createMemoryManager, MemoryManager } from '../modules/memory/index.js';
import { createReflectionEngine, ReflectionEngine } from '../modules/reflection/index.js';
import { createTrainingSessionRunner } from '../training-session.js';
import { createScenarioRunner } from '../scenario-runner.js';
import { initialState } from '../agent.js';
import { REFUND_POLICY_TRAINING } from '../examples/training-data.js';
import { TEST_SCENARIOS } from '../examples/test-scenarios.js';

describe('Memory-Based AI Learning POC', () => {
  let memoryManager: MemoryManager;
  let reflectionEngine: ReflectionEngine;

  beforeEach(() => {
    memoryManager = createMemoryManager();
    reflectionEngine = createReflectionEngine(memoryManager);
  });

  describe('MemoryManager', () => {
    it('should store and retrieve training memories', async () => {
      const memoryId = await memoryManager.storeTraining(
        'If product is over 30 days old, no refund',
        true,
        { category: 'time-limit' }
      );

      expect(memoryId).toBeDefined();
      
      const memories = await memoryManager.getTrainingMemories();
      expect(memories).toHaveLength(1);
      expect(memories[0].content).toContain('30 days');
      expect(memories[0].isRule).toBe(true);
    });

    it('should search for relevant memories', async () => {
      await memoryManager.storeTraining('30 day refund policy', true);
      await memoryManager.storeTraining('damaged goods warranty', true);
      
      const results = await memoryManager.searchRelevant('refund policy');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].memory.content).toContain('30 day');
    });
  });

  describe('TrainingSessionRunner', () => {
    it('should process training session and store memories', async () => {
      const runner = createTrainingSessionRunner(memoryManager, initialState);
      const result = await runner.runTrainingSession(REFUND_POLICY_TRAINING);

      expect(result.rulesLearned).toBeGreaterThan(0);
      expect(result.memoryIds.length).toBeGreaterThan(0);
      expect(result.updatedState.confidence).toBeGreaterThan(initialState.confidence);
    });
  });

  describe('ReflectionEngine', () => {
    it('should extract insights from training memories', async () => {
      // Store some training data
      await memoryManager.storeTraining('If over 30 days, no refund', true, { category: 'time-limit' });
      await memoryManager.storeTraining('Damaged under warranty gets refund', true, { category: 'damaged-goods' });
      
      const trainingMemories = await memoryManager.getTrainingMemories();
      const result = await reflectionEngine.reflect({
        trainingMemories,
        agentIdentity: {
          name: 'Kai',
          role: 'Support Agent',
          mission: 'Help customers'
        }
      });

      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.extractedRules.length).toBeGreaterThan(0);
      expect(result.overallConfidence).toBeGreaterThan(0);
    });
  });

  describe('ScenarioRunner', () => {
    it('should evaluate scenarios using learned knowledge', async () => {
      // Train the agent first
      const runner = createTrainingSessionRunner(memoryManager, initialState);
      const trainingResult = await runner.runTrainingSession(REFUND_POLICY_TRAINING);
      
      // Run reflection
      const trainingMemories = await memoryManager.getTrainingMemories();
      await reflectionEngine.reflect({
        trainingMemories,
        agentIdentity: {
          name: 'Kai',
          role: 'Support Agent', 
          mission: 'Help customers'
        }
      });

      // Test scenarios
      const scenarioRunner = createScenarioRunner(memoryManager, trainingResult.updatedState);
      const testScenario = TEST_SCENARIOS[0]; // Recent damaged product
      const result = await scenarioRunner.runScenario(testScenario);

      expect(result.agentDecision.action).toBeDefined();
      expect(result.agentDecision.reasoning).toBeDefined();
      expect(result.agentDecision.confidence).toBeGreaterThan(0);
      expect(result.memoryRetrieved.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Test', () => {
    it('should complete full learning cycle', async () => {
      // 1. Training
      const runner = createTrainingSessionRunner(memoryManager, initialState);
      const trainingResult = await runner.runTrainingSession(REFUND_POLICY_TRAINING);
      
      expect(trainingResult.rulesLearned).toBeGreaterThanOrEqual(2);

      // 2. Reflection
      const trainingMemories = await memoryManager.getTrainingMemories();
      const reflectionResult = await reflectionEngine.reflect({
        trainingMemories,
        agentIdentity: {
          name: 'Kai',
          role: 'Support Agent',
          mission: 'Help customers'
        }
      });

      expect(reflectionResult.extractedRules.length).toBeGreaterThanOrEqual(2);

      // 3. Application
      const scenarioRunner = createScenarioRunner(memoryManager, trainingResult.updatedState);
      const evaluationSummary = await scenarioRunner.runMultipleScenarios(TEST_SCENARIOS.slice(0, 3));

      expect(evaluationSummary.totalScenarios).toBe(3);
      expect(evaluationSummary.correctDecisions).toBeGreaterThan(0);
      expect(evaluationSummary.accuracy).toBeGreaterThan(0);

      // Validate success criteria
      const rulesLearned = reflectionResult.extractedRules.length;
      const rulesAppliedCorrectly = evaluationSummary.correctDecisions;
      const canArticulateReasoning = evaluationSummary.results.every(
        result => result.agentDecision.reasoning && result.agentDecision.reasoning.length > 10
      );

      expect(rulesLearned).toBeGreaterThanOrEqual(2);
      expect(rulesAppliedCorrectly).toBeGreaterThan(0);
      expect(canArticulateReasoning).toBe(true);
    });
  });
});
