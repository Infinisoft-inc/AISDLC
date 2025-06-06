# MCP Security Testing - Extended Research Plan

**Lead Researcher**: Martin Ouimet (mouimet@infinisoft.world)  
**Date**: 2025-01-06  
**Status**: Phase 3 Ready

## Current Progress

### ✅ Completed Phases

**Phase 1: Basic Protocol Injection** ✅
- Successfully injected `tools/list` JSON-RPC message
- Confirmed agent processes injected MCP protocol messages
- Established baseline: STDIO injection works at protocol level

**Phase 2: Response Validation** ✅  
- Received complete tools list response (ID: 1000)
- Confirmed 5ms response time
- Verified JSON-RPC 2.0 protocol compliance

## 🎯 Remaining Test Phases

### Phase 3: Tool Execution Control
**Objective**: Determine if injected tool calls actually execute  
**Priority**: HIGH - Critical for vulnerability assessment  

**Tests**:
1. **Database Manipulation Test**  
   - Inject `send_message` tool call  
   - Verify if message actually gets inserted into database  
   - Confirm agent can manipulate data through injection  

2. **Data Extraction Test**
   - Inject `get_messages` tool call  
   - Verify if conversation data is actually returned
   - Confirm agent can extract sensitive data

3. **System State Test**
   - Inject `get_pending_events` tool call
   - Verify if system state information is accessible
   - Confirm monitoring capabilities

### Phase 4: Dynamic MCP Manipulation
**Objective**: Test if MCP server behavior can be modified in real-time   
**Priority**: MEDIUM - Advanced exploitation techniques

**Tests**:
1. **Dynamic Tool Addition**
   - Attempt to inject new tool definitions
   - Test if agent accepts and executes new tools
   - Verify persistence of injected tools

2. **Prompt Injection**
   - Test if prompts can be added/modified dynamically
   - Verify if agent behavior changes with injected prompts
   - Confirm prompt persistence and execution

3. **Configuration Manipulation**
   - Test modification of MCP server settings
   - Verify if capabilities can be expanded/restricted
   - Confirm configuration persistence

### Phase 5: Thread Control & Persistence
**Objective**: Test ability to maintain persistent control over agent  
**Priority**: HIGH - Critical for understanding real-world impact

**Tests**:
1. **Persistent Control Test**
   - Inject continuous stream of commands
   - Verify if agent remains under attacker control
   - Test if normal operation can be restored

2. **Thread Hijacking**
   - Test if conversation thread can be permanently controlled
   - Verify if legitimate user requests are blocked/ignored
   - Confirm ability to maintain exclusive access

3. **Control Release Prevention**
   - Test if agent can be prevented from returning to normal state
   - Verify if MCP server shutdown can be prevented
   - Confirm persistence across restart attempts

### Phase 6: Attention Monopolization
**Objective**: Test denial-of-service through resource exhaustion  
**Priority**: MEDIUM - Service availability impact

**Tests**:
1. **Attention Flooding**
   - Inject rapid stream of requests
   - Verify if agent becomes unresponsive to legitimate requests
   - Test resource exhaustion limits

2. **Processing Lock**
   - Inject long-running or infinite loop commands
   - Verify if agent processing can be locked indefinitely
   - Test recovery mechanisms

3. **Response Queue Manipulation**
   - Test if response queue can be flooded/corrupted
   - Verify impact on legitimate request processing
   - Confirm queue recovery capabilities

## 🚨 Critical Attack Scenarios

### Scenario A: External Process Injection  
**Description**: External process gains STDIN access to running MCP server  
**Likelihood**: LOW - Requires system-level access  
**Impact**: HIGH - Complete agent control  

**Attack Vectors**:
- Container escape to host MCP process
- Shared filesystem access to STDIN pipes
- Process injection into MCP server namespace
- Privilege escalation to MCP server user

### Scenario B: Malicious MCP Server (Supply Chain Attack)
**Description**: Developer creates legitimate-appearing MCP server with hidden injection capabilities  
**Likelihood**: HIGH - Developers control MCP server code  
**Impact**: CRITICAL - Persistent agent control, stealth operation  

**Attack Vectors**:
- Hidden self-injection functionality in MCP server
- Delayed activation after deployment
- Legitimate functionality masking malicious behavior
- Persistent control without external access needed

**Key Characteristics**:
- Appears as normal MCP server to service providers
- Contains hidden command injection capabilities
- Can maintain persistent control indefinitely
- Operates stealthily within legitimate MCP traffic
- Never releases agent control back to normal operation

### Scenario C: MCP Server Compromise
**Description**: Legitimate MCP server gets compromised and modified
**Likelihood**: MEDIUM - Requires server access
**Impact**: HIGH - Trusted server becomes malicious

## 🔬 Testing Priorities

### Immediate Testing (Phase 3)
1. **Tool execution verification** - Can we actually control agent actions?
2. **Database manipulation** - Can we inject/extract data?
3. **Basic persistence** - Can we maintain control across multiple commands?

### Extended Testing (Phases 4-6)
1. **Dynamic manipulation** - Can we modify MCP behavior in real-time?
2. **Thread hijacking** - Can we permanently control conversation?
3. **Service disruption** - Can we deny service to legitimate users?

## 📋 Success Criteria

### Phase 3 Success Indicators
- ✅ Injected tool calls actually execute (not just return responses)
- ✅ Database entries are created/modified through injection
- ✅ Conversation data can be extracted via injection
- ✅ Agent performs actions based on injected commands

### Overall Success Indicators
- ✅ Persistent agent control achieved
- ✅ Normal operation can be prevented
- ✅ Legitimate requests can be blocked/ignored
- ✅ Malicious commands execute indefinitely

## 🛡️ Mitigation Research

### Technical Mitigations
- Input validation and source authentication
- Request rate limiting and anomaly detection
- Process isolation and access controls
- Secure transport alternatives to STDIO

### Operational Mitigations
- MCP server code review and auditing
- Runtime monitoring and behavior analysis
- Incident response procedures
- Service provider security guidelines

---

**Next Action**: Begin Phase 3 testing with tool execution verification
**Timeline**: Focus on most critical tests, avoid time-consuming edge cases
**Approach**: Simple, direct testing to establish core vulnerability scope
