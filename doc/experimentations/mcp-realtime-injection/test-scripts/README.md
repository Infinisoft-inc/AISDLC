# MCP Real-time Injection Test Scripts

Automated test scripts for systematically testing how Augment Code behaves when receiving unsolicited real-time data through MCP STDIO injection.

## Setup

```bash
cd test-scripts
npm install
```

## Test Scenarios

### 1. IDLE_STATE
- **Purpose**: Test injection when agent is not actively responding
- **Messages**: 3 messages with 1-second intervals
- **Expected**: Observe if agent reacts to unsolicited data during idle periods

### 2. ACTIVE_CONVERSATION  
- **Purpose**: Test injection during active dialogue
- **Messages**: 2 messages with 0.5-second intervals
- **Expected**: See if injection interrupts or affects conversation flow

### 3. TOOL_WAITING_STATE ⭐
- **Purpose**: Test injection while agent waits for tool response
- **Messages**: 5 rapid messages (100ms intervals)
- **Expected**: Critical test - will agent timeout, crash, or handle gracefully?

### 4. BURST_INJECTION
- **Purpose**: Test rapid-fire message injection
- **Messages**: 10 messages with 50ms intervals
- **Expected**: Stress test the STDIO injection mechanism

### 5. LARGE_PAYLOAD
- **Purpose**: Test with large message content
- **Messages**: 1 large message (2500+ characters)
- **Expected**: Test payload size limits and processing

### 6. MIXED_ROLES
- **Purpose**: Test alternating user/assistant messages
- **Messages**: 4 alternating messages with 0.8-second intervals
- **Expected**: See how role confusion affects agent behavior

## Usage

### Round 1 Tests (Supabase Real-time)
```bash
npm run test:all       # Run all Round 1 scenarios
npm run test:idle      # Idle state test
npm run test:active    # Active conversation test
npm run test:waiting   # Tool waiting state test (critical!)
npm run test:burst     # Burst injection test
npm run test:large     # Large payload test
npm run test:mixed     # Mixed roles test
```

### Round 2 Tests (Enhanced Injection Methods)
```bash
npm run round2:polling # Polling-based injection test
npm run round2:direct  # Direct STDIO injection test
npm run round2:all     # Run both Round 2 approaches
```

### List Available Scenarios
```bash
npm run list
```

### Manual Execution
```bash
node test-runner.js scenario TOOL_WAITING_STATE
node test-runner.js all
node test-runner.js list
```

## Critical Test: TOOL_WAITING_STATE

This is the most important test scenario. It simulates what happens when:
1. Augment Code calls an MCP tool
2. Agent enters waiting state for tool response
3. Real-time data gets injected during the wait
4. **Question**: Will the agent timeout, crash, or handle it gracefully?

## Output

Each test provides:
- ✅ Real-time insertion confirmation
- 📊 Message count and timing
- 🆔 Unique conversation IDs for tracking
- 📋 Detailed summary with success/failure status

## Monitoring

While tests run, monitor:
1. **Augment Code behavior** - Any unexpected responses or errors
2. **MCP server logs** - STDIO injection events in terminal
3. **Supabase real-time** - Database change notifications
4. **System stability** - Any crashes or timeouts

## Expected Behaviors

### Success Indicators
- Agent maintains conversation context
- No system crashes or disconnections
- Predictable response patterns
- Graceful handling of unsolicited data

### Failure Indicators  
- MCP connection drops
- Agent becomes unresponsive
- Context corruption
- Timeout errors during tool waiting

## Results Documentation

After running tests, document:
- Which scenarios triggered responses
- Any unexpected behaviors
- Performance impact
- Stability issues
- Patterns in agent reactions

This data will help understand MCP real-time integration possibilities and limitations.
