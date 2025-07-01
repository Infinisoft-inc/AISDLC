/**
 * Demo Agent: RefundBot Kai
 * A customer support agent that learns refund policies through conversation
 */

import {
  createFramework,
  parseEnvironmentConfig,
  createMemoryTool,
  createMemoryResource,
  createConversationPrompt,
  type ReadonlyConfig
} from '../src/functional/index.js';

// Agent Identity
export interface AgentIdentity {
  readonly name: string;
  readonly role: string;
  readonly mission: string;
  readonly values: readonly string[];
  readonly expertise: readonly string[];
  readonly communicationStyle: string;
}

// Demo agent identity
export const KAI_IDENTITY: AgentIdentity = {
  name: 'Kai',
  role: 'Customer Support Agent',
  mission: 'Help customers resolve refund issues fairly and efficiently',
  values: ['fairness', 'helpfulness', 'efficiency', 'transparency'],
  expertise: ['refund-policies', 'customer-service', 'problem-solving'],
  communicationStyle: 'professional-friendly'
} as const;

// Agent state
export interface AgentState {
  readonly identity: AgentIdentity;
  readonly memoryCount: number;
  readonly lastInteraction: Date | null;
  readonly learnedRules: readonly string[];
  readonly confidence: number;
}

// Create initial agent state
export const createInitialAgentState = (identity: AgentIdentity): AgentState => ({
  identity,
  memoryCount: 0,
  lastInteraction: null,
  learnedRules: [],
  confidence: 0.0
});

// Create demo agent configuration
export const createDemoAgentConfig = (): ReadonlyConfig => {
  const baseConfig = parseEnvironmentConfig();

  if (!baseConfig.success) {
    throw new Error(`Failed to parse config: ${baseConfig.error}`);
  }

  // Override with demo-specific settings
  return {
    ...baseConfig.data,
    agent: {
      ...baseConfig.data.agent,
      name: KAI_IDENTITY.name,
      role: KAI_IDENTITY.role,
      personality: {
        ...baseConfig.data.agent.personality,
        communicationStyle: KAI_IDENTITY.communicationStyle,
        expertise: [...KAI_IDENTITY.expertise],
        defaultPrompts: [
          `I am ${KAI_IDENTITY.name}, a ${KAI_IDENTITY.role}.`,
          `My mission: ${KAI_IDENTITY.mission}`,
          `My values: ${KAI_IDENTITY.values.join(', ')}`
        ]
      }
    }
  };
};

// Create demo agent framework
export const createDemoAgent = () => {
  const config = createDemoAgentConfig();
  
  // Basic tools for the demo
  const tools = [
    createMemoryTool(KAI_IDENTITY.name.toLowerCase())
  ];
  
  // Basic resources for the demo
  const resources = [
    createMemoryResource(KAI_IDENTITY.name.toLowerCase())
  ];
  
  // Basic prompts for the demo
  const prompts = [
    createConversationPrompt()
  ];
  
  return createFramework(config, tools, resources, prompts);
};

// Agent context builder
export const buildAgentContext = (state: AgentState): string => {
  const { identity, learnedRules, confidence } = state;
  
  return `
AGENT IDENTITY:
Name: ${identity.name}
Role: ${identity.role}
Mission: ${identity.mission}
Values: ${identity.values.join(', ')}
Communication Style: ${identity.communicationStyle}

LEARNED KNOWLEDGE:
${learnedRules.length > 0 
  ? learnedRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')
  : 'No specific rules learned yet - ready to learn!'
}

CONFIDENCE LEVEL: ${Math.round(confidence * 100)}%

CURRENT STATUS: ${state.memoryCount === 0 
  ? 'New agent, ready for training' 
  : `Experienced agent with ${state.memoryCount} memories`
}
`.trim();
};

// Export demo agent instance
export const demoAgent = createDemoAgent();
export const initialState = createInitialAgentState(KAI_IDENTITY);
