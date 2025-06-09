# AI Business Analyst MCP Server

A Model Context Protocol (MCP) server that provides an AI Business Analyst teammate for the AI-SDLC methodology.

## Features

- **Structured Business Case Discovery**: Guided conversation to gather business requirements
- **Persistent Storage**: Stores answers scoped by project ID
- **Business Case Summarization**: Generates formatted business case summaries
- **Memory Resources**: Access to stored business case context

## Quick Start

### Installation

```bash
cd mcp-servers/ai-business-analyst
npm install
npm run build
```

### Usage

1. **Start Business Case Discovery**
   ```
   Use prompt: start-business-case
   ```

2. **Store Answers**
   ```
   Use tool: store-case-answers
   {
     "projectId": "my-project-123",
     "problem": "Users struggle with manual report generation",
     "stakeholders": "Operations team, Management, End users"
   }
   ```

3. **Generate Summary**
   ```
   Use tool: summarize-business-case
   {
     "projectId": "my-project-123"
   }
   ```

4. **Access Context**
   ```
   Read resource: memory://business-case/context
   ```

## MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "ai-business-analyst": {
      "command": "node",
      "args": ["./mcp-servers/ai-business-analyst/dist/index.js"],
      "env": {}
    }
  }
}
```

## API Reference

### Prompts
- `start-business-case`: Initiates structured business case discovery

### Tools
- `store-case-answers`: Store business case discovery answers
- `summarize-business-case`: Generate business case summary

### Resources
- `memory://business-case/context`: Access all stored business case data

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start the server
npm start
```

## Status

🔬 **Experimental** - This is a first draft implementation for early testing and feedback.

## License

MIT
