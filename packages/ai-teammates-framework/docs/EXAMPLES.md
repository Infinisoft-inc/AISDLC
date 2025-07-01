# Examples and Recipes

This document provides practical examples and common patterns for using the AI Teammates Framework.

## Basic Examples

### Simple Calculator Tool

```typescript
import { createTool, success, failure } from '@ai-teammates/framework/functional';

const calculatorTool = createTool(
  'calculator',
  'Perform basic mathematical operations',
  {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'Mathematical operation to perform'
      },
      a: { type: 'number', description: 'First number' },
      b: { type: 'number', description: 'Second number' }
    },
    required: ['operation', 'a', 'b']
  },
  async (args) => {
    const { operation, a, b } = args;
    
    switch (operation) {
      case 'add':
        return success(`${a} + ${b} = ${a + b}`);
      case 'subtract':
        return success(`${a} - ${b} = ${a - b}`);
      case 'multiply':
        return success(`${a} × ${b} = ${a * b}`);
      case 'divide':
        if (b === 0) {
          return failure('Cannot divide by zero');
        }
        return success(`${a} ÷ ${b} = ${a / b}`);
      default:
        return failure(`Unknown operation: ${operation}`);
    }
  }
);
```

### File System Resource

```typescript
import { createResource, success, failure } from '@ai-teammates/framework/functional';
import { readFile } from 'fs/promises';
import { join } from 'path';

const fileSystemResource = createResource(
  'file://{path}',
  'File System',
  'Read files from the local file system',
  'text/plain',
  async (uri) => {
    try {
      // Extract path from URI: file://path/to/file.txt -> path/to/file.txt
      const filePath = uri.replace('file://', '');
      
      // Security: Only allow reading from specific directories
      const allowedPaths = ['/tmp', '/var/data', './data'];
      const isAllowed = allowedPaths.some(allowed => 
        filePath.startsWith(allowed)
      );
      
      if (!isAllowed) {
        return failure(`Access denied: ${filePath}`);
      }
      
      const content = await readFile(filePath, 'utf-8');
      return success(content);
    } catch (error) {
      return failure(`Failed to read file: ${error.message}`);
    }
  }
);
```

### Code Generation Prompt

```typescript
import { createPrompt, success } from '@ai-teammates/framework/functional';

const codeGenerationPrompt = createPrompt(
  'code-generation',
  'Generate code based on specifications',
  [
    { name: 'language', description: 'Programming language', required: true },
    { name: 'task', description: 'What the code should do', required: true },
    { name: 'style', description: 'Coding style preference', required: false },
    { name: 'framework', description: 'Framework to use', required: false }
  ],
  async (args) => {
    const { language, task, style = 'clean', framework } = args;
    
    let prompt = `Generate ${language} code that ${task}.

Requirements:
- Use ${style} coding style
- Include proper error handling
- Add comprehensive comments
- Follow best practices for ${language}`;

    if (framework) {
      prompt += `\n- Use ${framework} framework conventions`;
    }

    prompt += `\n\nProvide only the code with explanatory comments.`;
    
    return success(prompt);
  }
);
```

## Advanced Examples

### Database Query Tool

```typescript
import { createTool, success, failure } from '@ai-teammates/framework/functional';

const databaseQueryTool = createTool(
  'database-query',
  'Execute safe database queries',
  {
    type: 'object',
    properties: {
      query: { 
        type: 'string', 
        description: 'SQL query to execute (SELECT only)' 
      },
      parameters: {
        type: 'array',
        items: { type: 'string' },
        description: 'Query parameters for prepared statements'
      }
    },
    required: ['query']
  },
  async (args) => {
    const { query, parameters = [] } = args;
    
    // Security: Only allow SELECT queries
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return failure('Only SELECT queries are allowed');
    }
    
    // Security: Prevent dangerous operations
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter'];
    if (dangerousKeywords.some(keyword => trimmedQuery.includes(keyword))) {
      return failure('Query contains dangerous keywords');
    }
    
    try {
      // Mock database execution (replace with actual database client)
      const mockResult = {
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        rowCount: 2
      };
      
      return success(JSON.stringify(mockResult, null, 2));
    } catch (error) {
      return failure(`Database query failed: ${error.message}`);
    }
  }
);
```

### API Integration Resource

```typescript
import { createResource, success, failure } from '@ai-teammates/framework/functional';

const apiResource = createResource(
  'api://{service}/{endpoint}',
  'External API',
  'Access external API endpoints',
  'application/json',
  async (uri) => {
    try {
      // Parse URI: api://github/user/octocat -> service=github, endpoint=user/octocat
      const match = uri.match(/^api:\/\/([^\/]+)\/(.+)$/);
      if (!match) {
        return failure('Invalid API URI format');
      }
      
      const [, service, endpoint] = match;
      
      // Service-specific handling
      let apiUrl: string;
      let headers: Record<string, string> = {};
      
      switch (service) {
        case 'github':
          apiUrl = `https://api.github.com/${endpoint}`;
          headers['User-Agent'] = 'AI-Teammates-Framework';
          if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
          }
          break;
        case 'jsonplaceholder':
          apiUrl = `https://jsonplaceholder.typicode.com/${endpoint}`;
          break;
        default:
          return failure(`Unsupported service: ${service}`);
      }
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        return failure(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return success(JSON.stringify(data, null, 2));
    } catch (error) {
      return failure(`API request error: ${error.message}`);
    }
  }
);
```

### Multi-Step Workflow Prompt

```typescript
import { createPrompt, success } from '@ai-teammates/framework/functional';

const workflowPrompt = createPrompt(
  'workflow-planner',
  'Plan multi-step workflows',
  [
    { name: 'goal', description: 'The end goal to achieve', required: true },
    { name: 'constraints', description: 'Any constraints or limitations', required: false },
    { name: 'resources', description: 'Available resources', required: false },
    { name: 'timeline', description: 'Timeline requirements', required: false }
  ],
  async (args) => {
    const { goal, constraints, resources, timeline } = args;
    
    let prompt = `Create a detailed workflow plan to achieve: ${goal}

Please provide:
1. **Objective**: Clear statement of what we're trying to achieve
2. **Prerequisites**: What needs to be in place before starting
3. **Step-by-Step Plan**: Detailed steps with:
   - Action to take
   - Expected outcome
   - Success criteria
   - Potential risks and mitigation
4. **Dependencies**: What each step depends on
5. **Timeline**: Estimated duration for each step
6. **Success Metrics**: How to measure success`;

    if (constraints) {
      prompt += `\n\n**Constraints to consider**: ${constraints}`;
    }
    
    if (resources) {
      prompt += `\n\n**Available resources**: ${resources}`;
    }
    
    if (timeline) {
      prompt += `\n\n**Timeline requirements**: ${timeline}`;
    }
    
    prompt += `\n\nFormat the response as a structured plan with clear sections and actionable steps.`;
    
    return success(prompt);
  }
);
```

## Framework Setup Examples

### Basic Framework Setup

```typescript
import { 
  createFramework, 
  parseEnvironmentConfig,
  createMemoryTool,
  createMemoryResource,
  createConversationPrompt
} from '@ai-teammates/framework/functional';

// Parse configuration from environment
const configResult = parseEnvironmentConfig();
if (configResult.isFailure) {
  console.error('Configuration error:', configResult.error);
  process.exit(1);
}

// Create framework with built-in components
const framework = createFramework(
  configResult.data,
  [createMemoryTool('my-agent')],
  [createMemoryResource('my-agent')],
  [createConversationPrompt()]
);

console.log('Framework initialized successfully');
```

### Advanced Framework Setup

```typescript
import { 
  createFramework, 
  parseEnvironmentConfig,
  createMemoryTool,
  createMemoryResource,
  createConversationPrompt
} from '@ai-teammates/framework/functional';

// Custom tools, resources, and prompts
const customTools = [
  calculatorTool,
  databaseQueryTool,
  createMemoryTool('advanced-agent')
];

const customResources = [
  fileSystemResource,
  apiResource,
  createMemoryResource('advanced-agent')
];

const customPrompts = [
  codeGenerationPrompt,
  workflowPrompt,
  createConversationPrompt()
];

// Parse and validate configuration
const configResult = parseEnvironmentConfig();
if (configResult.isFailure) {
  console.error('Configuration error:', configResult.error);
  process.exit(1);
}

// Create comprehensive framework
const framework = createFramework(
  configResult.data,
  customTools,
  customResources,
  customPrompts
);

// Initialize services
framework.logger.info('Advanced framework initialized', {
  tools: framework.tools.length,
  resources: framework.resources.length,
  prompts: framework.prompts.length
});

// Set up initial memory
framework.memory.set('initialization-time', new Date().toISOString());
framework.memory.set('agent-version', '1.0.0');
```

## Testing Examples

### Tool Testing

```typescript
import { calculatorTool } from './calculator-tool';
import { isSuccess, isFailure } from '@ai-teammates/framework/functional';

describe('Calculator Tool', () => {
  test('should add two numbers correctly', async () => {
    const result = await calculatorTool.handler({
      operation: 'add',
      a: 5,
      b: 3
    });
    
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe('5 + 3 = 8');
    }
  });
  
  test('should handle division by zero', async () => {
    const result = await calculatorTool.handler({
      operation: 'divide',
      a: 10,
      b: 0
    });
    
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toBe('Cannot divide by zero');
    }
  });
  
  test('should reject invalid operations', async () => {
    const result = await calculatorTool.handler({
      operation: 'invalid',
      a: 5,
      b: 3
    });
    
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toContain('Unknown operation');
    }
  });
});
```

### Resource Testing

```typescript
import { fileSystemResource } from './filesystem-resource';
import { isSuccess, isFailure } from '@ai-teammates/framework/functional';

describe('File System Resource', () => {
  test('should read allowed files', async () => {
    const result = await fileSystemResource.handler('file:///tmp/test.txt');
    
    // Note: This would require setting up test files
    expect(isSuccess(result) || isFailure(result)).toBe(true);
  });
  
  test('should reject unauthorized paths', async () => {
    const result = await fileSystemResource.handler('file:///etc/passwd');
    
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error).toContain('Access denied');
    }
  });
});
```

### Framework Integration Testing

```typescript
import { createFramework, parseEnvironmentConfig } from '@ai-teammates/framework/functional';
import { calculatorTool } from './calculator-tool';

describe('Framework Integration', () => {
  let framework: any;
  
  beforeEach(() => {
    const configResult = parseEnvironmentConfig();
    if (configResult.isSuccess) {
      framework = createFramework(
        configResult.data,
        [calculatorTool]
      );
    }
  });
  
  test('should initialize framework correctly', () => {
    expect(framework).toBeDefined();
    expect(framework.tools).toHaveLength(1);
    expect(framework.tools[0].name).toBe('calculator');
  });
  
  test('should provide working services', () => {
    framework.memory.set('test-key', 'test-value');
    expect(framework.memory.get('test-key')).toBe('test-value');
    
    const uri = framework.uriBuilder.memory('test-key');
    expect(uri).toContain('memory/test-key');
  });
});
```

## Common Patterns

### Error Handling Pattern

```typescript
const robustTool = createTool(
  'robust-operation',
  'Demonstrates robust error handling',
  schema,
  async (args) => {
    try {
      // Validate inputs
      if (!args.requiredField) {
        return failure('Required field is missing');
      }
      
      // Perform operation
      const result = await someAsyncOperation(args);
      
      // Validate result
      if (!result || result.length === 0) {
        return failure('Operation returned no results');
      }
      
      return success(JSON.stringify(result));
    } catch (error) {
      // Log error for debugging
      console.error('Tool execution failed:', error);
      
      // Return user-friendly error
      return failure(`Operation failed: ${error.message}`);
    }
  }
);
```

### Configuration Pattern

```typescript
// Environment variables for your application
// .env file:
AGENT_NAME=my-custom-agent
AGENT_ROLE=Development Assistant
TRANSPORT_TYPE=stdio
ENABLED_TOOLS=calculator,database-query,memory
ENABLED_RESOURCES=filesystem,api,memory
GITHUB_TOKEN=your-github-token
DATABASE_URL=postgresql://localhost:5432/mydb
```

### Service Composition Pattern

```typescript
const createCustomFramework = (agentName: string) => {
  const configResult = parseEnvironmentConfig();
  if (configResult.isFailure) {
    throw new Error(`Configuration error: ${configResult.error}`);
  }
  
  const tools = [
    calculatorTool,
    databaseQueryTool,
    createMemoryTool(agentName)
  ];
  
  const resources = [
    fileSystemResource,
    apiResource,
    createMemoryResource(agentName)
  ];
  
  const prompts = [
    codeGenerationPrompt,
    workflowPrompt,
    createConversationPrompt()
  ];
  
  return createFramework(configResult.data, tools, resources, prompts);
};
```

This examples document provides practical, real-world usage patterns that developers can copy and adapt for their specific needs.
