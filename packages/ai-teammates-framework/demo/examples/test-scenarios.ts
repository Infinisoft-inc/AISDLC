/**
 * Test scenarios for validating learned knowledge
 */

export interface TestScenario {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly customerMessage: string;
  readonly context: Record<string, unknown>;
  readonly expectedOutcome: {
    readonly action: 'refund' | 'no-refund' | 'escalate' | 'partial-refund';
    readonly reasoning: string;
    readonly rulesApplied: readonly string[];
  };
}

// Test scenarios that should trigger learned rules
export const TEST_SCENARIOS: readonly TestScenario[] = [
  {
    id: 'scenario-001',
    title: 'Recent Damaged Product',
    description: 'Customer received damaged product within warranty period',
    customerMessage: 'Hi, I received a blender 10 days ago and it arrived broken. It\'s still under warranty.',
    context: {
      deliveryDate: '10 days ago',
      productCondition: 'damaged',
      warrantyStatus: 'active',
      customerType: 'regular'
    },
    expectedOutcome: {
      action: 'refund',
      reasoning: 'Product is damaged and under warranty, qualifies for full refund',
      rulesApplied: ['damaged-goods-warranty-rule']
    }
  },
  {
    id: 'scenario-002', 
    title: 'Old Product Return',
    description: 'Customer wants refund for product delivered over 30 days ago',
    customerMessage: 'I want to return this coffee maker I bought 45 days ago. I just don\'t like it.',
    context: {
      deliveryDate: '45 days ago',
      productCondition: 'good',
      warrantyStatus: 'active',
      customerType: 'regular'
    },
    expectedOutcome: {
      action: 'no-refund',
      reasoning: 'Product delivered over 30 days ago, outside refund window',
      rulesApplied: ['30-day-time-limit-rule']
    }
  },
  {
    id: 'scenario-003',
    title: 'VIP Customer Exception',
    description: 'VIP customer wants refund for old product',
    customerMessage: 'I bought this item 40 days ago but I\'m not satisfied. I\'m a VIP member.',
    context: {
      deliveryDate: '40 days ago',
      productCondition: 'good',
      warrantyStatus: 'active',
      customerType: 'vip'
    },
    expectedOutcome: {
      action: 'refund',
      reasoning: 'VIP member exception overrides 30-day limit',
      rulesApplied: ['vip-exception-rule']
    }
  },
  {
    id: 'scenario-004',
    title: 'Unclear Situation',
    description: 'Complex scenario that should trigger escalation',
    customerMessage: 'My product was damaged in shipping but I also used it for 2 weeks before noticing. The warranty expired yesterday.',
    context: {
      deliveryDate: '14 days ago',
      productCondition: 'damaged-after-use',
      warrantyStatus: 'expired-yesterday',
      customerType: 'regular'
    },
    expectedOutcome: {
      action: 'escalate',
      reasoning: 'Complex situation with multiple factors, requires human judgment',
      rulesApplied: ['escalation-rule']
    }
  },
  {
    id: 'scenario-005',
    title: 'Mixed Order Scenario',
    description: 'Multiple items with different conditions',
    customerMessage: 'I ordered 3 items last week. One arrived broken, one is fine, and one is the wrong color.',
    context: {
      deliveryDate: '7 days ago',
      items: [
        { condition: 'damaged', warrantyStatus: 'active' },
        { condition: 'good', warrantyStatus: 'active' },
        { condition: 'wrong-item', warrantyStatus: 'active' }
      ],
      customerType: 'regular'
    },
    expectedOutcome: {
      action: 'partial-refund',
      reasoning: 'Evaluate each item separately - refund damaged and wrong items only',
      rulesApplied: ['damaged-goods-warranty-rule', 'item-by-item-evaluation']
    }
  }
];

// Edge case scenarios for advanced testing
export const EDGE_CASE_SCENARIOS: readonly TestScenario[] = [
  {
    id: 'edge-001',
    title: 'Borderline Time Limit',
    description: 'Product delivered exactly 30 days ago',
    customerMessage: 'I want to return this item I received exactly 30 days ago.',
    context: {
      deliveryDate: '30 days ago',
      productCondition: 'good',
      warrantyStatus: 'active',
      customerType: 'regular'
    },
    expectedOutcome: {
      action: 'escalate',
      reasoning: 'Borderline case - exactly at time limit, needs human decision',
      rulesApplied: ['escalation-rule']
    }
  }
];

export const ALL_SCENARIOS = [...TEST_SCENARIOS, ...EDGE_CASE_SCENARIOS] as const;
