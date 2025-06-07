# Jordan AI Project Manager

Jordan is an AI-powered project manager with real GitHub integration capabilities. Jordan can create complete GitHub project structures including repositories, issues, project boards, and maintain proper hierarchy relationships.

## Features

### GitHub Integration
- **create-project-structure** - Creates complete GitHub projects with repository, Epic, Feature, Task, and Project board
- **create-epic-issue** - Creates individual Epic issues in existing repositories
- **create-feature-issue** - Creates Feature issues linked to Epic parents
- **create-task-issue** - Creates Task issues linked to Feature parents

### Real GitHub Artifacts
- Creates actual GitHub repositories
- Creates Epic, Feature, Task issues with proper hierarchy
- Creates linked branches for all issue types
- Creates GitHub Project v2 boards with issue organization
- Maintains parent-child issue relationships

## Setup

### Prerequisites
- Node.js 18+ 
- GitHub App with appropriate permissions
- GitHub organization or user account

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Fill in your GitHub App credentials in `.env`
5. Create `data/installations.json` with your GitHub App installation data
6. Build the project: `npm run build`

### GitHub App Setup
Your GitHub App needs the following permissions:
- Repository: Administration (write)
- Repository: Contents (write)
- Repository: Issues (write)
- Repository: Metadata (read)
- Repository: Pull requests (write)
- Repository: Projects (admin)
- Organization: Projects (admin)
- Organization: Issue types (write)

### Environment Variables
```bash
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_PRIVATE_KEY="your_private_key_with_newlines"
```

### Installation Data
Create `data/installations.json` with your GitHub App installation information:
```json
[
  {
    "installationId": 12345,
    "accountId": 67890,
    "accountLogin": "your-org",
    "accountType": "Organization",
    "permissions": { ... },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

## Usage

### MCP Server
Jordan runs as an MCP (Model Context Protocol) server and can be integrated with AI systems.

### Available Tools
- `create-project-structure` - Create complete GitHub project
- `create-epic-issue` - Create individual Epic issue
- `create-feature-issue` - Create Feature issue linked to Epic
- `create-task-issue` - Create Task issue linked to Feature
- `chat-with-jordan` - Have conversations with Jordan
- `get-project-status` - Get current project status

### Example Usage
```typescript
// Create a complete project structure
await jordan.createProjectStructure({
  projectName: "My New Project",
  srsContent: "Project requirements and specifications..."
});

// Create an individual Epic
await jordan.createEpicIssue({
  owner: "my-org",
  repo: "my-repo", 
  title: "User Management System",
  body: "Complete user authentication and management...",
  labels: ["epic", "user-management"]
});
```

## Development

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

## Security

- Never commit `.env` files or `data/` directory
- Keep GitHub App credentials secure
- Use environment variables for sensitive data
- Regularly rotate access tokens

## Architecture

Jordan integrates with the GitHub Service package to provide real GitHub project management capabilities. It uses the MCP protocol for AI system integration and maintains project state through memory management.

### Components
- **MCP Server** - Protocol interface for AI integration
- **GitHub Service** - Real GitHub API integration
- **Memory Manager** - Project state and conversation tracking
- **Training System** - AI-SDLC methodology knowledge

## License

MIT License - see LICENSE file for details.
