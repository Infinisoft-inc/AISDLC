# Experimental Teammate - SSE MCP Server

A persistent, never-disconnecting MCP server using Server-Sent Events (SSE) for real-time streaming and stable connections.

## 🚀 **Key Features**

### **🔄 Persistent Connection**
- **SSE-based transport** - No more stdio disconnections
- **HTTP server** - Runs on port 3001 by default
- **Real-time streaming** - Continuous data flow
- **Health monitoring** - Built-in health check endpoint

### **🎭 AI Teammates**
- **@gino prompt** - Analytical, creative AI teammate
- **Personality-driven responses** - LLM instructions for character consistency
- **Mention detection** - Responds when @gino is mentioned

### **🛠️ Tools & Resources**
- **`store-data`** - Persistent key-value storage
- **`example://data/storage`** - View stored data
- **Health endpoint** - Monitor server status

## Quick Start

1. **Install dependencies:**
   ```bash
   cd packages/experimental-teammate
   pnpm install
   ```

2. **Build the server:**
   ```bash
   pnpm run build
   ```

3. **Start the SSE server:**
   ```bash
   pnpm run start:sse
   ```

4. **Test the server:**
   ```bash
   curl http://127.0.0.1:3001/health
   ```

## 🌐 **Endpoints**

- **SSE Stream:** `http://127.0.0.1:3001/sse`
- **Messages:** `http://127.0.0.1:3001/messages` (POST)
- **Health Check:** `http://127.0.0.1:3001/health`

## Experimental Features

### Testing New Tools
Use the `experiment-action` tool to test new capabilities:
```json
{
  "action": "test-new-feature",
  "parameters": {
    "feature": "voice-interaction",
    "mode": "experimental"
  }
}
```

### Testing New Prompts
Use the `experiment-prompt` to test new conversation patterns and see how the AI responds to different interaction styles.

### Testing New Resources
Access `experiment://data/results` to see how experimental data is structured and accessed.

## Perfect For

- 🧪 **Rapid prototyping** of new MCP capabilities
- 🔬 **Testing AI interaction patterns** before implementing in production
- 🚀 **Exploring innovative workflows** with AI teammates
- 📈 **Analyzing experimental results** and patterns
- 🎯 **Validating new concepts** before full implementation

## Development

Run in development mode:
```bash
npm run dev
```

This will watch for changes and rebuild automatically.

## Experiment Away!

This server is designed to be your testing ground. Modify it, break it, rebuild it - that's what experimentation is all about! 🧪🚀
