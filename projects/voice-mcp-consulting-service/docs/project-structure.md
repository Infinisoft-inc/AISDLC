# Project Structure - Voice-Driven MCP Consulting Service

**Project:** Voice-Driven MCP Consulting Service  
**Date:** 2025-01-04  
**Prepared by:** Jordan (AI Project Manager)  
**Phase:** 1.4 - Project Structure Setup  

---

## Repository Structure

```
voice-mcp-consulting-service/
├── README.md                           # Project overview and setup
├── LICENSE                             # MIT License
├── .gitignore                         # Git ignore rules
├── package.json                       # Root package.json for workspace
├── docs/                              # Project documentation
│   ├── business-case.md               # Business case (Phase 1.1)
│   ├── brd.md                         # Business Requirements (Phase 1.2)
│   ├── urd.md                         # User Requirements (Phase 1.2)
│   ├── srs.md                         # System Requirements (Phase 1.3)
│   ├── add.md                         # Architecture Design (Phase 1.3)
│   ├── epics.md                       # Project EPICs (Phase 1.4)
│   └── project-structure.md           # This document
├── .github/                           # GitHub configuration
│   ├── ISSUE_TEMPLATE/                # Issue templates
│   │   ├── epic.md                    # Epic issue template
│   │   ├── feature.md                 # Feature issue template
│   │   └── task.md                    # Task issue template
│   └── workflows/                     # GitHub Actions (future)
├── frontend/                          # React web application
│   ├── package.json                   # Frontend dependencies
│   ├── src/                           # Source code
│   │   ├── components/                # React components
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── services/                  # API and service layers
│   │   ├── types/                     # TypeScript type definitions
│   │   └── utils/                     # Utility functions
│   ├── public/                        # Static assets
│   └── vercel.json                    # Vercel deployment config
├── backend/                           # Node.js MCP server
│   ├── package.json                   # Backend dependencies
│   ├── src/                           # Source code
│   │   ├── mcp/                       # MCP server implementation
│   │   ├── services/                  # Business logic services
│   │   ├── types/                     # TypeScript type definitions
│   │   └── utils/                     # Utility functions
│   ├── config/                        # Configuration files
│   └── vercel.json                    # Vercel deployment config
├── vscode-extension/                  # VS Code MCP extension
│   ├── package.json                   # Extension dependencies
│   ├── src/                           # Extension source code
│   ├── config/                        # MCP client configuration
│   └── README.md                      # Extension documentation
└── deployment/                        # Deployment configurations
    ├── vercel/                        # Vercel-specific configs
    ├── supabase/                      # Supabase configurations
    └── scripts/                       # Deployment scripts
```

---

## Development Workflow

### Phase 2 Implementation Cycle
For each EPIC, follow the AI-SDLC Phase 2 cycle:

1. **Phase 2.1 - FRS Creation**
   - Maya (AI Functional Analyst) creates detailed FRS
   - Document: `docs/frs-epic-X.md`

2. **Phase 2.2 - Implementation Plan**
   - Sam (AI Lead Developer) creates implementation plan
   - Document: `docs/implementation-plan-epic-X.md`

3. **Phase 2.3 - Work Breakdown Structure**
   - Jordan (AI Project Manager) creates GitHub issues
   - Issues: Epic → Features → Tasks hierarchy

4. **Phase 2.4 - Code Development**
   - Casey (AI Developer) implements code
   - Output: Working code, tests, documentation

### GitHub Issue Hierarchy

```
EPIC-001: MCP Service Integration
├── FEAT-001: VS Code Extension Setup
│   ├── TASK-001: Create extension scaffold
│   ├── TASK-002: Implement MCP client config
│   └── TASK-003: Add connection validation
├── FEAT-002: Web App MCP Server
│   ├── TASK-004: Setup MCP server framework
│   ├── TASK-005: Implement protocol handlers
│   └── TASK-006: Add session management
└── FEAT-003: Client Onboarding
    ├── TASK-007: Create setup documentation
    ├── TASK-008: Build connection testing
    └── TASK-009: Add error handling
```

---

## Technology Stack Implementation

### Frontend (React Web App)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Voice:** Web Speech API
- **State Management:** React Context + useReducer
- **Deployment:** Vercel

### Backend (MCP Server)
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **MCP:** @modelcontextprotocol/sdk
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel Functions

### VS Code Extension
- **Framework:** VS Code Extension API
- **Language:** TypeScript
- **MCP Client:** @modelcontextprotocol/sdk
- **Package Manager:** npm
- **Distribution:** VS Code Marketplace (future)

---

## Development Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- VS Code
- Git

### Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd voice-mcp-consulting-service

# Install root dependencies
npm install

# Setup frontend
cd frontend
npm install
npm run dev

# Setup backend
cd ../backend
npm install
npm run dev

# Setup VS Code extension
cd ../vscode-extension
npm install
npm run compile
```

---

## Deployment Strategy

### Frontend Deployment (Vercel)
- **Trigger:** Push to main branch
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Supabase config

### Backend Deployment (Vercel Functions)
- **Trigger:** Push to main branch
- **Runtime:** Node.js 18
- **Functions:** API routes in `backend/api/`
- **Environment Variables:** Supabase, LLM API keys

### Database (Supabase)
- **Type:** PostgreSQL
- **Hosting:** Supabase cloud
- **Migrations:** SQL files in `deployment/supabase/`
- **Authentication:** Supabase Auth

---

## Quality Assurance

### Testing Strategy
- **Unit Tests:** Jest + Testing Library
- **Integration Tests:** Playwright
- **E2E Tests:** Voice workflow testing
- **Manual Testing:** User acceptance testing

### Code Quality
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Pre-commit:** Husky + lint-staged
- **CI/CD:** GitHub Actions (future)

---

## Documentation Standards

### Code Documentation
- **Functions:** JSDoc comments
- **Components:** PropTypes + comments
- **APIs:** OpenAPI/Swagger specs
- **README:** Setup and usage instructions

### Project Documentation
- **Architecture:** C4 diagrams in ADD
- **Requirements:** Traceability matrix
- **User Guides:** End-user documentation
- **Developer Guides:** Contributing guidelines

---

**Next Steps:**
1. Initialize GitHub repository with this structure
2. Create initial EPIC issues using templates
3. Begin Phase 2.1 with EPIC 1 (MCP Service Integration)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-04  
**Status:** Ready for Implementation
