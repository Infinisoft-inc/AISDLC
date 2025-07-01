# API Reference: Functional AI Teammates Framework

**Part of the AI-SDLC experimental framework by Martin Ouimet**

## Core Functions

### createFramework

Creates a framework instance with all services and components.

```typescript
function createFramework(
  config: Config,
  tools?: Tool[],
  resources?: Resource[],
  prompts?: Prompt[]
): Framework
```

**Parameters:**
- `config`: Framework configuration object
- `tools`: Array of tool definitions (optional)
- `resources`: Array of resource definitions (optional)  
- `prompts`: Array of prompt definitions (optional)

**Returns:** Framework instance with services and components

**Example:**
```typescript
const framework = createFramework(
  config,
  [memoryTool, calculatorTool],
  [memoryResource, userResource],
  [conversationPrompt]
);
```

### createTool

Creates a tool definition for business logic operations.

```typescript
function createTool(
  name: string,
  description: string,
  inputSchema: JSONSchema,
  handler: ToolHandler
): Tool
```

**Parameters:**
- `name`: Unique tool identifier
- `description`: Human-readable tool description
- `inputSchema`: JSON schema for input validation
- `handler`: Async function that executes the tool

**Returns:** Tool definition object

**Example:**
```typescript
const calculatorTool = createTool(
  'calculator',
  'Perform mathematical calculations',
  {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract'] },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b']
  },
  async (args) => {
    const { operation, a, b } = args;
    switch (operation) {
      case 'add': return success(`${a + b}`);
      case 'subtract': return success(`${a - b}`);
      default: return failure('Unknown operation');
    }
  }
);
```

### createResource

Creates a resource definition for data access operations.

```typescript
function createResource(
  uri: string,
  name: string,
  description: string,
  mimeType: string,
  handler: ResourceHandler
): Resource
```

**Parameters:**
- `uri`: URI pattern for the resource (supports templates)
- `name`: Human-readable resource name
- `description`: Resource description
- `mimeType`: MIME type of the resource content
- `handler`: Async function that retrieves the resource

**Returns:** Resource definition object

**Example:**
```typescript
const userResource = createResource(
  'app://users/{userId}',
  'User Profile',
  'Access user profile information',
  'application/json',
  async (uri) => {
    const userId = uri.split('/').pop();
    try {
      const user = await fetchUser(userId);
      return success(JSON.stringify(user, null, 2));
    } catch (error) {
      return failure(`User not found: ${userId}`);
    }
  }
);
```

### createPrompt

Creates a prompt definition for template generation.

```typescript
function createPrompt(
  name: string,
  description: string,
  arguments: PromptArgument[],
  handler: PromptHandler
): Prompt
```

**Parameters:**
- `name`: Unique prompt identifier
- `description`: Human-readable prompt description
- `arguments`: Array of prompt argument definitions
- `handler`: Async function that generates the prompt

**Returns:** Prompt definition object

**Example:**
```typescript
const codeReviewPrompt = createPrompt(
  'code-review',
  'Generate code review prompts',
  [
    { name: 'language', description: 'Programming language', required: true },
    { name: 'complexity', description: 'Code complexity', required: false }
  ],
  async (args) => {
    const { language, complexity = 'medium' } = args;
    const prompt = `Review this ${language} code with ${complexity} complexity...`;
    return success(prompt);
  }
);
```

## Utility Functions

### Result Pattern

#### success

Creates a successful result.

```typescript
function success<T>(data: T): Success<T>
```

**Example:**
```typescript
return success('Operation completed successfully');
```

#### failure

Creates a failure result.

```typescript
function failure(error: string): Failure
```

**Example:**
```typescript
return failure('Operation failed: invalid input');
```

#### isSuccess

Checks if a result is successful.

```typescript
function isSuccess<T>(result: Result<T>): result is Success<T>
```

**Example:**
```typescript
const result = await operation();
if (isSuccess(result)) {
  console.log(result.data); // Type-safe access
}
```

#### isFailure

Checks if a result is a failure.

```typescript
function isFailure<T>(result: Result<T>): result is Failure
```

**Example:**
```typescript
const result = await operation();
if (isFailure(result)) {
  console.error(result.error); // Type-safe access
}
```

## Configuration Functions

### parseEnvironmentConfig

Parses configuration from environment variables.

```typescript
function parseEnvironmentConfig(): Result<Config>
```

**Returns:** Result containing parsed configuration or error

**Example:**
```typescript
const configResult = parseEnvironmentConfig();
if (configResult.isSuccess) {
  const config = configResult.data;
  // Use configuration
} else {
  console.error('Configuration error:', configResult.error);
}
```

### validateConfig

Validates a configuration object.

```typescript
function validateConfig(config: Config): Result<Config>
```

**Parameters:**
- `config`: Configuration object to validate

**Returns:** Result containing validated configuration or error

**Example:**
```typescript
const validationResult = validateConfig(config);
if (validationResult.isFailure) {
  console.error('Invalid configuration:', validationResult.error);
}
```

## Service Functions

### createLogger

Creates a logging service.

```typescript
function createLogger(agentName: string): Logger
```

**Parameters:**
- `agentName`: Name of the agent for log context

**Returns:** Logger service instance

**Logger Methods:**
- `debug(message: string, context?: ReadonlyRecord<string, unknown>): LogEntry`
- `info(message: string, context?: ReadonlyRecord<string, unknown>): LogEntry`
- `warn(message: string, context?: ReadonlyRecord<string, unknown>): LogEntry`
- `error(message: string, context?: ReadonlyRecord<string, unknown>): LogEntry`

**Example:**
```typescript
const logger = createLogger('my-agent');
logger.info('Framework initialized', { version: '1.0.0' });
```

### createMemoryService

Creates a memory service for key-value storage.

```typescript
function createMemoryService(): MemoryService
```

**Returns:** Memory service instance

**Memory Service Methods:**
- `set(key: string, value: string, ttl?: number): void`
- `get(key: string): string | undefined`
- `has(key: string): boolean`
- `delete(key: string): boolean`
- `clear(): void`
- `entries(): MemoryEntry[]`
- `size(): number`

**Example:**
```typescript
const memory = createMemoryService();
memory.set('user-preference', 'dark-mode', 3600); // 1 hour TTL
const preference = memory.get('user-preference');
```

### createUriBuilder

Creates a URI builder service.

```typescript
function createUriBuilder(prefix: string): UriBuilder
```

**Parameters:**
- `prefix`: URI prefix for the agent

**Returns:** URI builder service instance

**URI Builder Methods:**
- `memory(key: string): string`
- `conversation(id: string): string`
- `template(name: string): string`
- `project(org: string, repo: string, branch: string): string`

**Example:**
```typescript
const uriBuilder = createUriBuilder('my-agent');
const memoryUri = uriBuilder.memory('user-settings');
// Returns: "my-agent://memory/user-settings"
```

## MCP Protocol Functions

### handleToolCall

Handles MCP tool call requests.

```typescript
function handleToolCall(
  request: MCPRequest,
  tools: Tool[]
): Promise<MCPResponse>
```

**Parameters:**
- `request`: MCP request object
- `tools`: Array of available tools

**Returns:** Promise resolving to MCP response

**Example:**
```typescript
const request = {
  params: {
    name: 'calculator',
    arguments: { operation: 'add', a: 5, b: 3 }
  }
};
const response = await handleToolCall(request, [calculatorTool]);
```

### handleResourceRead

Handles MCP resource read requests.

```typescript
function handleResourceRead(
  request: MCPRequest,
  resources: Resource[]
): Promise<MCPResponse>
```

**Parameters:**
- `request`: MCP request object
- `resources`: Array of available resources

**Returns:** Promise resolving to MCP response

**Example:**
```typescript
const request = {
  params: {
    uri: 'app://users/123'
  }
};
const response = await handleResourceRead(request, [userResource]);
```

### handlePromptGet

Handles MCP prompt get requests.

```typescript
function handlePromptGet(
  request: MCPRequest,
  prompts: Prompt[]
): Promise<MCPResponse>
```

**Parameters:**
- `request`: MCP request object
- `prompts`: Array of available prompts

**Returns:** Promise resolving to MCP response

**Example:**
```typescript
const request = {
  params: {
    name: 'code-review',
    arguments: { language: 'typescript' }
  }
};
const response = await handlePromptGet(request, [codeReviewPrompt]);
```

### createResponse

Creates an MCP response object.

```typescript
function createResponse(isError: boolean, content: string): MCPResponse
```

**Parameters:**
- `isError`: Whether the response represents an error
- `content`: Response content

**Returns:** MCP response object

**Example:**
```typescript
const successResponse = createResponse(false, 'Operation successful');
const errorResponse = createResponse(true, 'Operation failed');
```

## Built-in Components

### createMemoryTool

Creates a built-in memory management tool.

```typescript
function createMemoryTool(agentName: string): Tool
```

**Parameters:**
- `agentName`: Name of the agent for tool naming

**Returns:** Memory tool definition

**Supported Actions:**
- `set`: Store a value with optional TTL
- `get`: Retrieve a value by key
- `delete`: Remove a value by key
- `list`: List all stored keys
- `clear`: Remove all stored values

**Example:**
```typescript
const memoryTool = createMemoryTool('my-agent');
// Tool name will be: "my-agent_memory"
```

### createMemoryResource

Creates a built-in memory resource.

```typescript
function createMemoryResource(agentName: string): Resource
```

**Parameters:**
- `agentName`: Name of the agent for URI prefix

**Returns:** Memory resource definition

**URI Pattern:** `{agentName}://memory/{key}`

**Example:**
```typescript
const memoryResource = createMemoryResource('my-agent');
// URI pattern: "my-agent://memory/{key}"
```

### createConversationPrompt

Creates a built-in conversation prompt.

```typescript
function createConversationPrompt(): Prompt
```

**Returns:** Conversation prompt definition

**Arguments:**
- `context`: Required string for conversation context
- `style`: Optional string for communication style (default: 'professional')

**Example:**
```typescript
const conversationPrompt = createConversationPrompt();
// Prompt name: "conversation"
```

## Composition Utilities

### pipe

Chains functions left to right.

```typescript
function pipe<T>(...functions: Function[]): (input: T) => any
```

**Example:**
```typescript
const transform = pipe(
  parseInput,
  validateData,
  processData,
  formatOutput
);
const result = transform(input);
```

### compose

Chains functions right to left.

```typescript
function compose<T>(...functions: Function[]): (input: T) => any
```

**Example:**
```typescript
const transform = compose(
  formatOutput,
  processData,
  validateData,
  parseInput
);
const result = transform(input);
```

### curry

Converts a function to accept arguments one at a time.

```typescript
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C
```

**Example:**
```typescript
const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
const add5 = curriedAdd(5);
const result = add5(3); // 8
```

### partial

Partially applies arguments to a function.

```typescript
function partial<T extends any[], U extends any[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...partialArgs: T
): (...args: U) => R
```

**Example:**
```typescript
const multiply = (a: number, b: number, c: number) => a * b * c;
const multiplyBy2 = partial(multiply, 2);
const result = multiplyBy2(3, 4); // 24
```
