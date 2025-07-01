/**
 * Sample training data for the RefundBot Kai demo
 */

export interface TrainingMessage {
  readonly speaker: 'human' | 'agent';
  readonly content: string;
  readonly isTeaching?: boolean;
  readonly ruleType?: 'policy' | 'exception' | 'escalation' | 'clarification';
  readonly metadata?: Record<string, unknown>;
}

export interface TrainingSession {
  readonly sessionId: string;
  readonly title: string;
  readonly description: string;
  readonly messages: readonly TrainingMessage[];
}

// Sample refund policy training session
export const REFUND_POLICY_TRAINING: TrainingSession = {
  sessionId: 'refund-policy-001',
  title: 'Basic Refund Policy Training',
  description: 'Teaching Kai the fundamental refund policies and procedures',
  messages: [
    {
      speaker: 'human',
      content: 'Hi Kai! I\'m going to teach you our refund policy. Ready to learn?',
      isTeaching: false
    },
    {
      speaker: 'agent', 
      content: 'Hello! Yes, I\'m ready to learn about refund policies. Please teach me!',
      isTeaching: false
    },
    {
      speaker: 'human',
      content: 'First rule: If a product was delivered more than 30 days ago, we cannot offer a refund.',
      isTeaching: true,
      ruleType: 'policy',
      metadata: { 
        category: 'time-limit',
        timeframe: '30 days',
        action: 'no refund'
      }
    },
    {
      speaker: 'agent',
      content: 'Got it! So products delivered over 30 days ago are not eligible for refunds. I\'ll remember that.',
      isTeaching: false
    },
    {
      speaker: 'human',
      content: 'Second rule: If a product is damaged and still under warranty, we should offer a full refund.',
      isTeaching: true,
      ruleType: 'policy',
      metadata: {
        category: 'damaged-goods',
        condition: 'under warranty',
        action: 'full refund'
      }
    },
    {
      speaker: 'agent',
      content: 'Understood! Damaged products under warranty get full refunds. That makes sense for customer satisfaction.',
      isTeaching: false
    },
    {
      speaker: 'human',
      content: 'Third rule: If you\'re unsure about a situation or it doesn\'t fit these rules, escalate to a human supervisor.',
      isTeaching: true,
      ruleType: 'escalation',
      metadata: {
        category: 'uncertainty',
        action: 'escalate to human'
      }
    },
    {
      speaker: 'agent',
      content: 'Perfect! When in doubt, escalate to a human. Better to be safe and get the right answer.',
      isTeaching: false
    },
    {
      speaker: 'human',
      content: 'One exception: Even if it\'s over 30 days, if the customer is a VIP member, we can make exceptions.',
      isTeaching: true,
      ruleType: 'exception',
      metadata: {
        category: 'vip-exception',
        overrides: 'time-limit',
        condition: 'VIP member'
      }
    },
    {
      speaker: 'agent',
      content: 'Ah, so VIP members get special treatment even beyond the 30-day limit. I\'ll keep that in mind!',
      isTeaching: false
    }
  ]
};

// Additional training scenarios
export const EDGE_CASES_TRAINING: TrainingSession = {
  sessionId: 'edge-cases-001',
  title: 'Edge Cases and Clarifications',
  description: 'Teaching Kai how to handle complex refund scenarios',
  messages: [
    {
      speaker: 'human',
      content: 'Let\'s cover some edge cases. What if a customer bought multiple items but only one is damaged?',
      isTeaching: true,
      ruleType: 'clarification',
      metadata: {
        category: 'partial-order',
        scenario: 'mixed condition items'
      }
    },
    {
      speaker: 'agent',
      content: 'Good question! I would apply the damaged goods rule only to the damaged item, and handle the rest normally.',
      isTeaching: false
    },
    {
      speaker: 'human',
      content: 'Exactly right! Only refund what qualifies. Don\'t refund the whole order unless everything qualifies.',
      isTeaching: true,
      ruleType: 'clarification',
      metadata: {
        category: 'partial-refund',
        principle: 'item-by-item evaluation'
      }
    }
  ]
};

export const ALL_TRAINING_SESSIONS = [
  REFUND_POLICY_TRAINING,
  EDGE_CASES_TRAINING
] as const;
