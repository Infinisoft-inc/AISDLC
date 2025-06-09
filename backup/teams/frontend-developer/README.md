# AI-SDLC Teammate Template v2.0

**Intelligent AI teammates with persistent memory and voice-first interaction**

A comprehensive template for creating AI teammates that embody the AI-SDLC methodology with advanced capabilities including persistent memory, intelligent conversation, and natural voice interaction.

## Features

- **🧠 Intelligent Responses**: LLM-powered reasoning with role-specific context
- **💾 Persistent Memory**: Remembers conversations, learnings, and project context across sessions
- **🎓 AI-SDLC Training**: Complete methodology training system for any AI role
- **🗣️ Voice-First Interaction**: Seamless integration with speech_response_talk for natural conversation
- **👥 Role Specialization**: Customizable for any AI teammate role (Project Manager, Developer, QA, etc.)
- **🔄 Context-Aware**: Builds intelligent prompts with relevant memory and context
- **🎵 Unique Voices**: Each teammate has distinct voice identification for TTS

## Quick Start

### 1. Copy Template
```bash
cp -r templates/mcp-servers/base-mcp my-ai-teammate
cd my-ai-teammate
```

### 2. Customize for Your Role
```typescript
// In src/index.ts, update the default instantiation:
const server = new AITeammateServer("YourTeammateName", "Your Role Description");
```

### 3. Build and Prepare
```bash
npm install
npm run build  # Automatically makes dist/index.js executable
chmod +x config/run.sh  # Make run script executable
```

### 4. Human Integration Required
**IMPORTANT:** AI cannot start the teammate independently. Human must:
1. Load the MCP configuration: `config/mcp-config-ai-[role].json`
2. Start the MCP server in their system
3. Use `complete-training` tool to train the AI teammate
4. Test first conversation to confirm activation

## Available Tools

### `complete-training`
Completes the AI teammate's AI-SDLC methodology training
- **Input**: None required
- **Output**: Training completion report with full methodology understanding

### `chat-with-[teammate]`
Natural conversation with your AI teammate
- **Input**: `message` (required), `context` (optional)
- **Output**: Intelligent, context-aware response with personality

### `get-status`
Get current status and teammate's memory context
- **Input**: None required
- **Output**: Complete context summary including memory, training, and project status

## Available Resources

### `[teammate]://memory/current`
View the AI teammate's current memory state and context
- **Format**: JSON
- **Content**: Complete memory including conversations, learnings, and project context

### `[teammate]://training/status`
View the AI teammate's AI-SDLC training completion status
- **Format**: JSON
- **Content**: Training progress, methodology understanding, and role knowledge

## Architecture

### Memory System (`src/memory.ts`)
- **Persistent Storage**: Conversations, learnings, project context
- **Context Generation**: Intelligent context summaries for LLM prompts
- **User Profiles**: Communication style, preferences, working relationship
- **Project Tracking**: Current project phase, status, milestones

### Training System (`src/training.ts`)
- **AI-SDLC Methodology**: Complete understanding of the methodology
- **Role Specialization**: Specific knowledge for each AI teammate role
- **Information Flow**: Template chains and progressive detail approach
- **Collaboration Patterns**: Human-AI interaction workflows

### Intelligence System
- **Context Building**: Combines memory, personality, and current situation
- **Prompt Generation**: Creates intelligent prompts for LLM processing
- **Voice Integration**: Automatic speech_response_talk integration with unique voice ID
- **Response Routing**: Returns prompts for Augment Code LLM processing

## Voice-First Integration

The template includes automatic integration with `speech_response_talk` tool for unique voice identification:

1. **User speaks** → Augment Code receives voice/text
2. **Augment Code routes** → calls AI teammate's MCP tool
3. **AI teammate processes** → builds intelligent prompt with context
4. **AI teammate returns prompt** → Augment Code processes with LLM
5. **Augment Code calls speech_response_talk** → with format "[TeammateName]: [response]"
6. **TTS assigns unique voice** → based on teammate name
7. **User hears response** → in teammate's distinct voice

## Customization

### Creating a Specific Role
1. **Update Constructor**: Change teammate name and role description
2. **Customize Memory**: Modify default identity and capabilities
3. **Role Training**: Add role-specific training data to ai-roles-personalities.json
4. **Specialized Tools**: Add role-specific tools as needed

### Example: Creating "Riley" Frontend Developer
```typescript
const server = new AITeammateServer("Riley", "AI Frontend Developer");
```

The system will automatically:
- Look for Riley's role data in ai-roles-personalities.json
- Create Riley-specific memory and training
- Generate Riley-specific tools and prompts
- Enable natural conversation as Riley with unique voice

## Version History

### v2.0.0 (Current)
- **Intelligent LLM-powered responses** with context-aware reasoning
- **Persistent memory system** with conversation history and learnings
- **AI-SDLC training system** for methodology understanding
- **Voice-first interaction** with speech_response_talk integration
- **Unique voice identification** for each teammate in TTS
- **Role specialization** for any AI teammate type
- **Context-aware prompts** for optimal LLM processing

### v1.0.0
- Basic MCP server template with simple tools and prompts
- Static responses without intelligence or memory
- Example-based functionality for learning MCP concepts

## License

MIT License - Part of the AI-SDLC Methodology Project

---

**Ready to create intelligent AI teammates with unique voices!** 🚀
