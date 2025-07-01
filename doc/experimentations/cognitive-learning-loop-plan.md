# Cognitive Learning Loop: Vertical Implementation Plan

This document outlines a step-by-step, vertically-sliced approach to implementing learning-by-conversation, reflection, and memory organization in the AI Teammates MCP framework. Each step is actionable and builds on the previous, enabling fast iteration and validation.

---

## 1. Core Approach
- The LLM interacts with the MCP server, which exposes tools, resources, and prompts.
- The LLM sequences calls to these components to learn, reflect, and act.
- The framework provides the cognitive backend (memory, reflection, identity, context, etc.) as composable, protocol-driven components.
- All cognitive modules (memory, reflection, identity, learning, correction) are designed for seamless integration and emergent, LLM-driven learning.

---

## 2. Implementation Steps (Vertical Slices)

### **Step 1: Persistent Memory with Salience & Embeddings**
- [ ] Define schema for memory entries (type, tags, content, timestamp, salience, embedding, etc.)
- [ ] Implement `MemoryManager` to support salience scoring and embedding storage for each entry
- [ ] Expose as MCP tool/resource (URI-based access)
- [ ] Test storing and retrieving teaching examples with salience/embedding via conversation

### **Step 2: Reflection Tool & Loop**
- [ ] Define schema for reflection input/output (memories in, rules/insights out, confidence, etc.)
- [ ] Implement `ReflectionEngine` that reviews memories, summarizes learnings, extracts rules, and updates knowledge
- [ ] Expose as MCP tool, triggerable by agent or on schedule
- [ ] Store reflection results as new memory entries (type: reflection, rule, insight)
- [ ] Test LLM calling reflection after a teaching session

### **Step 3: Identity Profile**
- [ ] Implement `IdentityProfile` module to track agent’s traits, values, beliefs, intentions
- [ ] Expose as resource and inject into prompts/context for the agent
- [ ] Allow reflection/learning modules to update identity profile as needed
- [ ] Test identity-aware prompt generation and reasoning

### **Step 4: Learn-from-Dialogue & Heuristic Extraction**
- [ ] Implement `HeuristicBuilder` to extract general principles/rules from examples and discussions
- [ ] Expose as MCP tool for the agent to call with a set of examples
- [ ] Store extracted heuristics as new memory entries (type: rule, heuristic)
- [ ] Test agent learning and applying new rules from dialogue

### **Step 5: Correction & Self-Correction**
- [ ] Implement `CorrectionTool` to allow the agent to overwrite, merge, or deprecate memories as it learns or corrects itself
- [ ] Expose as MCP tool for agent-driven correction
- [ ] Test correction loop and knowledge update

### **Step 6: Contextual Prompt Generation & Reasoning**
- [ ] Implement `ContextualPrompt` generator to assemble relevant memory, identity, and context for the LLM
- [ ] LLM retrieves relevant rules/examples from memory, applies them, and cites reasoning
- [ ] Test end-to-end: teach → reflect → apply in scenario

### **Step 7: Meta-Reasoning & Review (Optional)**
- [ ] Implement `MetaReasoningTool` or knowledge graph resource for self-querying and meta-cognition
- [ ] Allow LLM to review its own state, confidence, or knowledge gaps
- [ ] Test meta-reasoning and self-assessment

---

## 3. Required Components (Summary)
- **Tools:** MemoryManager, ReflectionEngine, CorrectionTool, HeuristicBuilder, (optional: MetaReasoningTool)
- **Resources:** memoryResource, conversationHistoryResource, identityResource, (optional: knowledgeGraphResource)
- **Prompts:** contextualPrompt, reflectionPrompt, scenarioPrompt, correctionPrompt
- **Context:** agent identity, session context, memory context

---

## 4. Demo Workflow Example
1. Teach agent via conversation (MemoryManager)
2. Reflect on learnings (ReflectionEngine)
3. Update identity profile if needed (IdentityProfile)
4. Extract and store new heuristics/rules (HeuristicBuilder)
5. Apply knowledge in scenario (contextualPrompt + memoryResource)
6. Correct/update knowledge (CorrectionTool)
7. (Optional) Self-review/meta-reasoning (MetaReasoningTool)

---

## 5. Next Steps
- [ ] Create issues for each vertical step
- [ ] Implement and test each step sequentially, ensuring seamless integration between modules
- [ ] Validate with real LLM-driven sessions and emergent learning behaviors

---

*This plan enables rapid, vertical progress and fast feedback at each stage, with all cognitive modules working together for emergent, self-organizing learning. Adjust as needed based on results and insights.*
