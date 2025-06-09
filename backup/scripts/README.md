# AI-SDLC Teammate Setup Scripts

Automated setup for the complete AI-SDLC teammate ecosystem.

## Quick Start

```bash
cd scripts
npm install
npm run setup-teammates
```

## What This Creates

### 🤖 Complete AI Teammate Roster

| Avatar | Name | Role | Phase | Description |
|--------|------|------|-------|-------------|
| 📊 | Alex | AI Business Analyst | 1.1 | Business case discovery and requirements gathering |
| 🏗️ | Leo | AI Architect | 1.3 | Domain-driven architecture and system design |
| 🔍 | Maya | AI Functional Analyst | 2.1 | Detailed functional requirements specifications |
| 👨‍💻 | Sam | AI Lead Developer | 2.2 | Implementation plans and technical breakdowns |
| 📋 | Jordan | AI Project Manager | 2.3 | Work breakdown structure and GitHub organization |
| ⚡ | Casey | AI Developer | 2.4 | Code implementation, tests, and pull requests |
| 🧪 | Riley | AI QA Engineer | 3.1 | Quality assurance testing and validation |
| 🚀 | Taylor | AI DevOps Engineer | 3.2 | Deployment and delivery (experimental) |

### 📁 Generated Structure

For each teammate:
```
mcp-servers/
├── ai-architect/
│   ├── src/index.ts          # MCP server implementation
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   └── config/
│       ├── persona.json      # AI personality and metadata
│       ├── mcp-config-ai-architect.json  # MCP client config
│       └── run.sh           # Startup script
└── registry.json            # Complete teammate registry
```

### 🔧 Features

- **Zero-config setup**: Each teammate is ready to run immediately
- **Persona-driven**: Each AI has unique personality and communication style
- **Phase-aligned**: Teammates map directly to AI-SDLC methodology phases
- **MCP-ready**: Generated configs work with any MCP client
- **Cross-platform**: Works on Windows (WSL), macOS, and Linux

## Usage

### 1. Setup All Teammates
```bash
npm run setup-teammates
```

### 2. Import MCP Configs
Each teammate generates an MCP config file:
```
mcp-servers/ai-architect/config/mcp-config-ai-architect.json
```

Import these into your MCP client (Augment Code, etc.)

### 3. Start Using AI Teammates
```bash
# Example: Start the AI Architect
cd mcp-servers/ai-architect/config
./run.sh
```

## Teammate Personalities

Each AI teammate has a unique persona:

- **Alex (Business Analyst)**: Structured and inquisitive
- **Leo (Architect)**: Technical and systematic  
- **Maya (Functional Analyst)**: Detail-oriented and precise
- **Sam (Lead Developer)**: Pragmatic and solution-focused
- **Jordan (Project Manager)**: Organized and collaborative
- **Casey (Developer)**: Efficient and quality-focused
- **Riley (QA Engineer)**: Thorough and quality-driven
- **Taylor (DevOps Engineer)**: Reliable and automation-focused

## Customization

### Modify Teammate Definitions
Edit `setup-ai-teammates.ts` to:
- Add new teammates
- Change personalities
- Modify capabilities
- Update phase assignments

### Extend Base Template
The script uses `ai-business-analyst` as the base template. Customize it to change the foundation for all teammates.

## Status

🔬 **Experimental** - This is a first-generation teammate ecosystem. Feedback and contributions welcome!

## License

MIT
