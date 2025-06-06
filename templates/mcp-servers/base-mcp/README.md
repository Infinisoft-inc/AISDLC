# Base MCP Server Template

A clean, minimal MCP (Model Context Protocol) server template for quick project starts.

## What's Included

This template provides **1 example of each MCP capability**:

### 🛠️ **1 Example Tool**
- **`store-data`** - Stores key-value pairs in memory
- Demonstrates how to handle tool calls and return responses

### 💬 **1 Example Prompt**
- **`example-prompt`** - Shows how MCP prompts work
- Demonstrates structured prompt responses with role and content

### 📁 **1 Example Resource**
- **`example://data/storage`** - Provides access to stored data
- Demonstrates how to expose data as MCP resources

## Quick Start

1. **Clone this template:**
   ```bash
   cp -r templates/mcp-servers/ai-lead-developer my-new-mcp-server
   cd my-new-mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Customize the server:**
   - Edit `src/index.ts`
   - Change server name and version
   - Add your own tools, prompts, and resources

4. **Build and test:**
   ```bash
   npm run build
   npm start
   ```

## Customization Guide

### Adding Tools
```typescript
{
  name: "your-tool-name",
  description: "What your tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: { type: "string", description: "Parameter description" },
    },
    required: ["param1"],
  },
}
```

### Adding Prompts
```typescript
{
  name: "your-prompt-name",
  description: "What your prompt does",
}
```

### Adding Resources
```typescript
{
  uri: "your-scheme://path/to/resource",
  name: "Resource Name",
  description: "What this resource provides",
  mimeType: "application/json",
}
```

## File Structure

```
├── src/
│   └── index.ts          # Main MCP server implementation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Key Features

- ✅ **Clean and minimal** - No unnecessary complexity
- ✅ **Well-commented** - Easy to understand and modify
- ✅ **TypeScript** - Full type safety
- ✅ **MCP compliant** - Follows official MCP standards
- ✅ **Ready to clone** - Perfect starting point for new projects

## Next Steps

1. **Rename the server** in `src/index.ts`
2. **Replace example functionality** with your use case
3. **Add your tools, prompts, and resources**
4. **Test with MCP clients** like Claude Desktop or VS Code extensions

This template gives you a solid foundation to build any MCP server quickly!