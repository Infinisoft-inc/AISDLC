# GitHub Service - AI-SDLC Integration

**Author:** Martin Ouimet (mouimet@infinisoft.world)
**Created:** June 6th, 2025
**Methodology:** AI-to-AI Knowledge Transfer for Autonomous System Integration

## AI Automation Ready 🤖

Enterprise-grade GitHub project creation service designed for **AI-to-AI automation**.

### 📋 For AI Systems
**Read the `/ai-to-ai/` folder** for complete machine-readable documentation and examples.

### 🎯 What It Creates
Complete AI-SDLC project structure with:
- ✅ Repository in organization with auto-initialization
- ✅ GitHub Project v2 with proper configuration
- ✅ Issue hierarchy (Epic → Feature → Task) with real parent-child relationships
- ✅ Linked branches for ALL issue types (epic/, feature/, task/)
- ✅ Issue type assignment (Epic, Feature, Task) via GraphQL
- ✅ Bottom-up development workflow ready for PR management

### 🚀 Quick Test
```bash
npm run build
node demo-simple.js
```

**Creates:**
- Repository: `https://github.com/Infinisoft-inc/aisdlc-simple-{timestamp}`
- Project: `https://github.com/orgs/Infinisoft-inc/projects/{number}`
- Epic #1 with branch: `epic/epic-user-management-...`
- Feature #2 with branch: `feature/feature-fr-um-001-...`
- Task #3 with branch: `task/implement-user-registration-api-endpoint`

### 🔄 Development Workflow Created
```
Task PR → Feature PR → Epic PR → Main
```

**Quality Gates:**
- Task level: Code review for implementation
- Feature level: Integration testing
- Epic level: Domain validation
- Main: Production-ready code

## AI Integration

### Single Function Call
```typescript
import { createCompleteProjectStructure } from './dist/github-service.js';

const result = await createCompleteProjectStructure({
  repository: { name: 'ai-project', description: 'AI-created project' },
  epic: { title: '[EPIC] User Management', body: '...' },
  features: [{ title: '[FEATURE] Login', body: '...', tasks: [...] }]
}, installationId);

// Result includes: repository, project, epic, features, tasks - all with linked branches
```

### Environment Setup
```bash
# Required environment variables
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

## Architecture

```
github-service/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── auth.ts            # JWT and token management
│   ├── storage.ts         # Simple file storage
│   ├── github-service.ts  # Main GitHub operations
│   ├── webhook-server.ts  # Express webhook server
│   └── index.ts           # Main exports
├── data/                  # Storage directory (auto-created)
│   ├── installations.json # GitHub App installations
│   └── projects.json      # Project data
└── dist/                  # Compiled JavaScript
```

## Functions

### Repository Management
- `createRepository(repoData)` - Create a new repository
- `getRepository(owner, repo)` - Get repository information
- `listRepositories()` - List all accessible repositories

### Issue Management
- `createIssue(owner, repo, issueData)` - Create an issue
- `createMilestone(owner, repo, title, description)` - Create a milestone

### Authentication
- `generateJWT()` - Generate GitHub App JWT token
- `getInstallationToken(installationId?)` - Get installation access token
- `createAuthenticatedOctokit(installationId?)` - Create authenticated Octokit instance

### Storage
- `saveInstallation(installation)` - Save GitHub App installation
- `getInstallation(installationId?)` - Get installation data
- `saveProject(projectId, data)` - Save project data
- `getProject(projectId)` - Get project data

## Development

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

### Development with Auto-reload
```bash
npm run dev
```

## Integration with AI Project Manager

The AI Project Manager can import this service directly:

```typescript
import { createRepository, createIssue } from '../github-service';

// In AI Project Manager tools
async function createGitHubRepository(projectData) {
  const result = await createRepository({
    name: projectData.projectName,
    description: projectData.description
  });
  
  return result;
}
```

## Storage

Currently uses simple JSON file storage in `data/` directory:
- `installations.json` - GitHub App installations and tokens
- `projects.json` - Project data and metadata

This can be easily replaced with Redis, PostgreSQL, or any other storage system by implementing the same interface in `storage.ts`.

## Security Notes

- Private keys are stored in environment variables
- Installation tokens are automatically refreshed
- File storage is local and not suitable for production multi-instance deployment
- For production, replace file storage with encrypted database storage

## Future Enhancements

- [ ] Redis storage implementation
- [ ] Project board management
- [ ] Branch and PR operations
- [ ] Webhook signature verification
- [ ] Rate limiting and error retry
- [ ] Multi-tenant support
- [ ] Metrics and monitoring
