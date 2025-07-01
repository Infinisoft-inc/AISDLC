# AI Teammates Framework - Functional Architecture

A pure functional TypeScript framework for building AI teammates using the Model Context Protocol (MCP). This framework provides a composable, testable, and maintainable architecture for creating AI agents with tools, resources, and prompts.

## 🚀 Quick Start

```typescript
import { createFramework, createMemoryTool, createMemoryResource, createConversationPrompt } from '@ai-teammates/framework/functional';

// Create framework with built-in components
const framework = createFramework(
  config,
  [createMemoryTool('my-agent')],
  [createMemoryResource('my-agent')],
  [createConversationPrompt()]
);

// Use the framework
framework.logger.info('Framework initialized');
framework.memory.set('user-preference', 'dark-mode');
```

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Configuration](#configuration)
- [Creating Tools](#creating-tools)
- [Creating Resources](#creating-resources)
- [Creating Prompts](#creating-prompts)
- [MCP Protocol](#mcp-protocol)
- [Built-in Components](#built-in-components)
- [Testing](#testing)
- [API Reference](#api-reference)

## Architecture Overview

The framework follows functional programming principles with these key characteristics:

- **Pure Functions**: No side effects, predictable outputs
- **Immutable Data**: All data structures are readonly
- **Composition**: Build complex behavior from simple functions
- **Type Safety**: Comprehensive TypeScript types with no `any`
- **Testability**: 100% test coverage with isolated components

### Core Architecture

```
Framework
├── Configuration (Environment-based)
├── Services (Logger, Memory, URI Builder)
├── Tools (Custom business logic)
├── Resources (Data access)
├── Prompts (Template generation)
└── MCP Handlers (Protocol implementation)
```

## Core Concepts

### Tools
Tools are functions that perform actions. They have:
- **Name**: Unique identifier
- **Description**: Human-readable purpose
- **Input Schema**: JSON schema for validation
- **Handler**: Async function that executes the tool

### Resources
Resources provide access to data. They have:
- **URI**: Unique resource identifier
- **Name**: Human-readable name
- **MIME Type**: Content type
- **Handler**: Async function that retrieves data

### Prompts
Prompts generate text templates. They have:
- **Name**: Unique identifier
- **Arguments**: Template parameters
- **Handler**: Async function that generates content

## Installation

```bash
npm install @ai-teammates/framework
```

## Configuration

The framework uses environment variables for configuration:

```bash
# Agent Configuration
AGENT_NAME=my-ai-teammate
AGENT_ROLE=Development Assistant
AGENT_COMMUNICATION_STYLE=professional

# Transport
TRANSPORT_TYPE=stdio
TRANSPORT_OPTIONS={}

# Features
ENABLED_TOOLS=memory,conversations
ENABLED_RESOURCES=memory
ENABLED_PROMPTS=conversation

# Integrations
DOPPLER_TOKEN=your-token
GITHUB_TOKEN=your-token
```

### Configuration Object

```typescript
import { parseEnvironmentConfig } from '@ai-teammates/framework/functional';

const configResult = parseEnvironmentConfig();
if (configResult.isSuccess) {
  const config = configResult.data;
  // Use configuration
}
```

## Creating Tools

Tools encapsulate business logic and can be called by AI models:

```typescript
import { createTool, success, failure } from '@ai-teammates/framework/functional';

const calculatorTool = createTool(
  'calculator',
  'Perform mathematical calculations',
  {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number', description: 'First number' },
      b: { type: 'number', description: 'Second number' }
    },
    required: ['operation', 'a', 'b']
  },
  async (args) => {
    const { operation, a, b } = args;
    
    switch (operation) {
      case 'add': return success(`${a} + ${b} = ${a + b}`);
      case 'subtract': return success(`${a} - ${b} = ${a - b}`);
      case 'multiply': return success(`${a} × ${b} = ${a * b}`);
      case 'divide': 
        if (b === 0) return failure('Cannot divide by zero');
        return success(`${a} ÷ ${b} = ${a / b}`);
      default:
        return failure(`Unknown operation: ${operation}`);
    }
  }
);
```

## Creating Resources

Resources provide access to data and information:

```typescript
import { createResource, success } from '@ai-teammates/framework/functional';

const userProfileResource = createResource(
  'app://users/{userId}',
  'User Profile',
  'Access user profile information',
  'application/json',
  async (uri) => {
    const userId = uri.split('/').pop();
    
    // Fetch user data (example)
    const userData = await fetchUserProfile(userId);
    
    return success(JSON.stringify(userData, null, 2));
  }
);
```

## Creating Prompts

Prompts generate contextual text for AI interactions:

```typescript
import { createPrompt, success } from '@ai-teammates/framework/functional';

const codeReviewPrompt = createPrompt(
  'code-review',
  'Generate code review prompts',
  [
    { name: 'language', description: 'Programming language', required: true },
    { name: 'complexity', description: 'Code complexity level', required: false }
  ],
  async (args) => {
    const { language, complexity = 'medium' } = args;
    
    const prompt = `
You are conducting a code review for ${language} code.
Focus on:
- Code quality and best practices
- Security considerations
- Performance implications
- Maintainability

Complexity level: ${complexity}

Please provide constructive feedback with specific suggestions for improvement.
    `.trim();
    
    return success(prompt);
  }
);
```

## MCP Protocol

The framework implements the Model Context Protocol for AI model communication:

### Handling Tool Calls

```typescript
import { handleToolCall } from '@ai-teammates/framework/functional';

const tools = [calculatorTool, memoryTool];
const request = {
  params: {
    name: 'calculator',
    arguments: { operation: 'add', a: 5, b: 3 }
  }
};

const response = await handleToolCall(request, tools);
```

### Handling Resource Reads

```typescript
import { handleResourceRead } from '@ai-teammates/framework/functional';

const resources = [userProfileResource, memoryResource];
const request = {
  params: {
    uri: 'app://users/123'
  }
};

const response = await handleResourceRead(request, resources);
```

### Handling Prompt Generation

```typescript
import { handlePromptGet } from '@ai-teammates/framework/functional';

const prompts = [codeReviewPrompt, conversationPrompt];
const request = {
  params: {
    name: 'code-review',
    arguments: { language: 'typescript', complexity: 'high' }
  }
};

const response = await handlePromptGet(request, prompts);
```

## Built-in Components

### Memory Tool

Provides persistent memory storage:

```typescript
import { createMemoryTool } from '@ai-teammates/framework/functional';

const memoryTool = createMemoryTool('my-agent');

// Usage examples:
// Set: { action: 'set', key: 'user-pref', value: 'dark-mode', ttl: 3600 }
// Get: { action: 'get', key: 'user-pref' }
// Delete: { action: 'delete', key: 'user-pref' }
// List: { action: 'list' }
// Clear: { action: 'clear' }
```

### Memory Resource

Provides access to stored memory:

```typescript
import { createMemoryResource } from '@ai-teammates/framework/functional';

const memoryResource = createMemoryResource('my-agent');
// Access via URI: my-agent://memory/{key}
```

### Conversation Prompt

Generates conversation prompts:

```typescript
import { createConversationPrompt } from '@ai-teammates/framework/functional';

const conversationPrompt = createConversationPrompt();
// Arguments: { context: string, style?: string }
```

## Testing

The framework includes comprehensive testing utilities:

```typescript
import { createTool, success, failure } from '@ai-teammates/framework/functional';

describe('My Tool', () => {
  test('should handle valid input', async () => {
    const tool = createTool('test', 'Test tool', schema, handler);
    const result = await tool.handler({ input: 'valid' });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data).toBe('expected output');
    }
  });

  test('should handle invalid input', async () => {
    const result = await tool.handler({ input: 'invalid' });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toContain('validation error');
    }
  });
});
```

## API Reference

### Core Functions

- `createFramework(config, tools?, resources?, prompts?)` - Create framework instance
- `createTool(name, description, schema, handler)` - Create tool definition
- `createResource(uri, name, description, mimeType, handler)` - Create resource definition
- `createPrompt(name, description, arguments, handler)` - Create prompt definition

### Utility Functions

- `success(data)` - Create success result
- `failure(error)` - Create failure result
- `isSuccess(result)` - Check if result is successful
- `isFailure(result)` - Check if result is failure

### Configuration

- `parseEnvironmentConfig()` - Parse environment variables
- `validateConfig(config)` - Validate configuration object

### Services

- `createLogger(agentName)` - Create logging service
- `createMemoryService()` - Create memory service
- `createUriBuilder(prefix)` - Create URI builder service

## Contributing

1. Follow functional programming principles
2. Maintain 100% test coverage
3. Use TypeScript strict mode
4. Follow single responsibility principle
5. Keep functions under 40 lines
6. No `any` types allowed

## License

MIT License - see LICENSE file for details.

## Related Documentation

- [Examples and Recipes](./docs/EXAMPLES.md) - Practical usage examples and patterns
- [AI-to-AI Knowledge Transfer](./docs/AI_KNOWLEDGE_TRANSFER.md) - Technical specifications for AI systems
- [Architecture Deep Dive](./docs/ARCHITECTURE.md) - Comprehensive architectural analysis
- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
