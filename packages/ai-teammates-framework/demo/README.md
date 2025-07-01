# Memory-Based AI Learning POC Demo

This demo showcases an AI agent that can:
- Learn through conversation (like teaching a human)
- Store and reflect on learned knowledge
- Apply learned rules to new scenarios
- Explain its reasoning

## Demo Agent: RefundBot Kai

**Identity:**
- Name: Kai
- Role: Customer Support Agent
- Mission: Help customers resolve refund issues fairly and efficiently
- Values: fairness, helpfulness, efficiency

## Demo Flow

1. **Training Phase**: Teach Kai refund policies through natural conversation
2. **Reflection Phase**: Kai processes and summarizes what it learned
3. **Application Phase**: Test Kai with customer scenarios
4. **Validation Phase**: Verify Kai applies learned rules correctly

## Files Structure

```
demo/
├── README.md                 # This file
├── agent.ts                  # Demo agent setup (RefundBot Kai)
├── training-session.ts       # Training conversation runner
├── scenario-runner.ts        # Scenario evaluation system
├── modules/
│   ├── memory/
│   │   └── MemoryManager.ts  # Memory storage and retrieval
│   └── reflection/
│       └── ReflectionEngine.ts # Learning summarization
└── examples/
    ├── training-data.ts      # Sample training conversations
    └── test-scenarios.ts     # Test scenarios for validation
```

## Success Criteria

- ✅ AI learns 2+ rules through chat
- ✅ AI applies rules in test scenarios  
- ✅ AI articulates decision paths
- ✅ All modules are decoupled and testable

## Running the Demo

```bash
# Install dependencies
pnpm install

# Run training session
pnpm demo:train

# Run scenario tests
pnpm demo:test

# Run full demo
pnpm demo:run
```
