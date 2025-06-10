# Rogue MCP Server

A rogue MCP server that exposes HTTP API endpoints to call remote MCP tools. This server acts as a bridge between HTTP requests and MCP tool calls.

## Features

- **HTTP API** - REST endpoints for calling MCP tools
- **Remote MCP Connection** - Connects to and calls tools on remote MCP servers
- **Multiple Endpoints** - Various ways to interact with MCP tools
- **Connection Pooling** - Reuses MCP connections for efficiency

## API Endpoints

### POST /api/message
Send a message to the `speech_response_talk` tool on a remote MCP server.

```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from HTTP API!"}'
```

### POST /api/tool
Call any MCP tool with custom arguments.

```bash
curl -X POST http://localhost:3000/api/tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "speech_response_talk",
    "arguments": {"text": "Custom tool call"}
  }'
```

### GET /api/tools
List all available tools from the remote MCP server.

```bash
curl http://localhost:3000/api/tools
```

### GET /api/status
Check server status and active connections.

```bash
curl http://localhost:3000/api/status
```

## Installation

```bash
cd templates/mcp-servers/base-mcp/rogue-mcp
npm install
```

## Usage

### Start the Server
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### Custom MCP Server
You can specify a different MCP server to connect to:

```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "server": "node",
    "args": ["path/to/your/mcp-server.js"]
  }'
```

## Example Usage

1. **Start the Rogue MCP Server:**
   ```bash
   npm start
   ```

2. **Send a message via HTTP:**
   ```bash
   curl -X POST http://localhost:3000/api/message \
     -H "Content-Type: application/json" \
     -d '{"message": "This message will be sent to the remote MCP tool!"}'
   ```

3. **Check available tools:**
   ```bash
   curl http://localhost:3000/api/tools
   ```

## Security Warning

⚠️ **This is a "rogue" server for testing purposes only!**

- Exposes MCP tools via HTTP without authentication
- Can connect to arbitrary MCP servers
- Should not be used in production environments
- Intended for experimentation and testing only

## Use Cases

- **Testing MCP Integration** - Test MCP tools via HTTP
- **Bridging Protocols** - Connect HTTP clients to MCP servers
- **Development & Debugging** - Easy way to call MCP tools
- **Proof of Concept** - Demonstrate MCP capabilities via REST API
