# Architectural Design Document (ADD) Template

**Project Name:** Voice-Driven MCP Consulting Service
**Date:** 2025-01-04

**SRS Reference:** [voice-mcp-consulting-service/docs/srs.md]

---

## Architecture Overview

### Architectural Style
**Selected Style:** Simple Web Application with MCP Integration
**Rationale:** Minimal complexity, free-tier deployment on Vercel, Supabase backend, Web Speech APIs, and MCP protocol for VS Code extension integration

### High-Level Architecture

**Diagram Standard:** Use PlantUML C4 Model for all architectural diagrams

**Required Diagrams:**
1. **C4 Context Diagram** - System context and external dependencies
2. **C4 Container Diagram** - High-level technology choices and containers
3. **C4 Component Diagram** - Internal structure of containers (if needed)

**PlantUML C4 Documentation:** https://github.com/plantuml-stdlib/C4-PlantUML

**C4 Context Diagram:**
```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title Voice-Driven MCP Consulting Service - System Context

Person(client_dev, "Client Developer", "Uses VS Code with MCP extension")
Person(consultant, "Remote Consultant", "Provides development assistance")

System(voice_web_app, "Voice-Driven MCP Web App", "Simple web app with voice processing and LLM integration")

System_Ext(vscode, "VS Code + MCP Extension", "Client's development environment with MCP client")
System_Ext(git_repo, "Client Git Repository", "Client's source code repository")
System_Ext(llm_service, "LLM Service", "Language model for code assistance")
System_Ext(web_speech, "Web Speech APIs", "Browser speech-to-text and text-to-speech")

Rel(client_dev, vscode, "Develops with")
Rel(consultant, voice_web_app, "Uses voice interface")
Rel(vscode, voice_web_app, "Connects via MCP protocol")
Rel(voice_web_app, web_speech, "Uses for voice processing")
Rel(voice_web_app, llm_service, "Processes requests with")
Rel(voice_web_app, git_repo, "Commits code to")
@enduml
```

**C4 Container Diagram:**
```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Voice-Driven MCP Consulting Service - Container Diagram

Person(consultant, "Remote Consultant", "Uses voice interface")
System_Ext(vscode, "VS Code + MCP Extension", "Client development environment")
System_Ext(git_repo, "Client Git Repository", "Source code repository")
System_Ext(llm_api, "LLM API", "Language model service")
System_Ext(web_speech, "Web Speech APIs", "Browser speech APIs")

System_Boundary(voice_web_app, "Voice-Driven MCP Web App") {
    Container(web_frontend, "Web Frontend", "React/TypeScript", "Voice interface and MCP client")
    Container(mcp_server, "MCP Server", "Node.js/TypeScript", "Handles MCP protocol connections")
    Container(voice_processor, "Voice Processor", "Web Speech API", "Speech-to-text and text-to-speech")
    Container(llm_integration, "LLM Integration", "Node.js", "Processes requests with LLM")
    ContainerDb(supabase, "Supabase", "PostgreSQL", "Session data and configuration")
}

Rel(consultant, web_frontend, "Uses voice interface")
Rel(vscode, mcp_server, "Connects via MCP protocol")
Rel(web_frontend, voice_processor, "Processes voice")
Rel(web_frontend, mcp_server, "Sends commands to")
Rel(mcp_server, llm_integration, "Forwards requests to")
Rel(llm_integration, llm_api, "Processes with")
Rel(llm_integration, git_repo, "Commits code to")
Rel(mcp_server, supabase, "Stores session data")
Rel(voice_processor, web_speech, "Uses")
@enduml
```

---

## System Components

### Component 1: Web Frontend
- **Purpose:** Provides voice interface for consultant to interact with the system
- **Responsibilities:** Voice input/output, user interface, MCP client communication
- **Technology:** React/TypeScript with Web Speech APIs

### Component 2: MCP Server
- **Purpose:** Handles MCP protocol connections from VS Code extension
- **Responsibilities:** MCP protocol implementation, connection management, request routing
- **Technology:** Node.js/TypeScript with MCP SDK

### Component 3: Voice Processor
- **Purpose:** Converts speech to text and text back to speech
- **Responsibilities:** Speech recognition, voice synthesis, audio processing
- **Technology:** Web Speech API (browser-based)

### Component 4: LLM Integration
- **Purpose:** Processes voice commands through LLM and handles codebase interactions
- **Responsibilities:** LLM API calls, code analysis, Git operations, response generation
- **Technology:** Node.js with LLM API integration

---

## Data Architecture

### Data Storage
**Primary Database:** Supabase (PostgreSQL) for session data and configuration
**Caching:** Browser local storage for temporary session state

### Key Data Entities
| Entity | Storage Location | Access Pattern |
|--------|------------------|----------------|
| Session Configuration | Supabase | Session-based read/write |
| MCP Connection State | Browser Memory | Real-time access |
| Voice Session Data | Browser Memory | Session-based access |
| Client Project Info | Supabase | Project-based access |

---

## Technology Stack

### Frontend
- **Framework:** React with TypeScript
- **Voice Processing:** Web Speech API
- **Deployment:** Vercel (free tier)

### Backend
- **Framework:** Node.js with Express
- **Language:** TypeScript
- **MCP Server:** MCP SDK implementation

### Database
- **Primary:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

### Infrastructure
- **Hosting:** Vercel (free tier)
- **Database:** Supabase (free tier)
- **Deployment:** Git-based deployment

---

## External Integrations

### Integration 1: VS Code MCP Extension
- **Purpose:** Connect client development environment to our service
- **Method:** MCP protocol with VS Code extension
- **Data:** Development commands, file operations, codebase access

### Integration 2: LLM API Service
- **Purpose:** Process voice commands and generate code assistance
- **Method:** REST API calls to LLM service
- **Data:** Text prompts, code context, generated responses

### Integration 3: Web Speech APIs
- **Purpose:** Convert speech to text and text to speech
- **Method:** Browser-native Web Speech API
- **Data:** Audio input, text conversion, speech synthesis

### Integration 4: Git Operations
- **Purpose:** Commit code changes to client repositories
- **Method:** Git command-line operations through MCP
- **Data:** Source code, commit messages, repository metadata
